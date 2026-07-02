const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { promisify } = require('util');

const scf = require('tencentcloud-sdk-nodejs-scf');
const COS = require('cos-nodejs-sdk-v5');

const ScfClient = scf.v20180416.Client;

const FUNCTION_NAME = 'purchaseTrackerProxy';
const DEFAULT_REGION = 'ap-guangzhou';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`缺少环境变量：${name}`);
  }
  return value;
}

function run(cmd, options = {}) {
  console.log(`> ${cmd}`);
  return execSync(cmd, { stdio: 'inherit', ...options });
}

async function zipFunctionCode() {
  const root = __dirname;
  const distDir = path.join(root, 'dist');
  const zipPath = path.join(root, 'function.zip');

  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true });
  }
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }

  fs.mkdirSync(distDir, { recursive: true });

  // 复制源码
  fs.cpSync(path.join(root, 'src'), path.join(distDir, 'src'), { recursive: true });

  // 安装生产依赖
  fs.writeFileSync(
    path.join(distDir, 'package.json'),
    JSON.stringify({
      name: 'purchase-tracker-proxy',
      version: '1.0.0',
      main: 'src/index.js',
      dependencies: {
        'cos-nodejs-sdk-v5': '^2.14.0',
      },
    })
  );
  run('npm install --production', { cwd: distDir });

  // 打包为 zip
  if (process.platform === 'win32') {
    run(`powershell -Command "Compress-Archive -Path '${distDir}\\*' -DestinationPath '${zipPath}' -Force"`);
  } else {
    run(`cd "${distDir}" && zip -r "${zipPath}" .`);
  }

  return zipPath;
}

async function getOrCreateCosBucket(cos, bucket, region) {
  try {
    await cos.headBucket({ Bucket: bucket, Region: region });
    console.log(`COS 存储桶已存在：${bucket}`);
  } catch {
    console.log(`创建 COS 存储桶：${bucket}`);
    await cos.putBucket({ Bucket: bucket, Region: region });
  }
}

async function deploy() {
  const secretId = requireEnv('TENCENT_SECRET_ID');
  const secretKey = requireEnv('TENCENT_SECRET_KEY');
  const region = process.env.TENCENT_REGION || DEFAULT_REGION;
  const bucket = requireEnv('COS_BUCKET');
  const bucketRegion = process.env.COS_REGION || region;

  const cos = new COS({ SecretId: secretId, SecretKey: secretKey });

  console.log('\n1. 准备 COS 存储桶');
  await getOrCreateCosBucket(cos, bucket, bucketRegion);

  console.log('\n2. 打包函数代码');
  const zipPath = await zipFunctionCode();
  const zipBuffer = fs.readFileSync(zipPath);

  console.log('\n3. 创建/更新 SCF 函数');
  const client = new ScfClient({
    credential: { secretId, secretKey },
    region,
    profile: { signMethod: 'HmacSHA256' },
  });

  const functionConfig = {
    FunctionName: FUNCTION_NAME,
    Handler: 'src/index.main_handler',
    Runtime: 'Nodejs18.15',
    MemorySize: 128,
    Timeout: 30,
    Environment: {
      Variables: [
        { Key: 'COS_SECRET_ID', Value: secretId },
        { Key: 'COS_SECRET_KEY', Value: secretKey },
        { Key: 'COS_BUCKET', Value: bucket },
        { Key: 'COS_REGION', Value: bucketRegion },
        { Key: 'COS_LOG_KEY', Value: 'logs/purchase-tracker.log' },
      ],
    },
    Code: { ZipFile: zipBuffer.toString('base64') },
  };

  let functionExists = false;
  try {
    await client.GetFunction({ FunctionName: FUNCTION_NAME });
    functionExists = true;
  } catch {
    functionExists = false;
  }

  if (functionExists) {
    console.log('更新函数代码...');
    await client.UpdateFunctionCode({
      FunctionName: FUNCTION_NAME,
      Handler: functionConfig.Handler,
      Runtime: functionConfig.Runtime,
      Code: functionConfig.Code,
    });
    console.log('更新函数配置...');
    await client.UpdateFunctionConfiguration({
      FunctionName: FUNCTION_NAME,
      MemorySize: functionConfig.MemorySize,
      Timeout: functionConfig.Timeout,
      Environment: functionConfig.Environment,
    });
  } else {
    console.log('创建函数...');
    await client.CreateFunction(functionConfig);
  }

  // 等待函数状态变为 Active
  console.log('等待函数就绪...');
  let ready = false;
  while (!ready) {
    await promisify(setTimeout)(2000);
    const info = await client.GetFunction({ FunctionName: FUNCTION_NAME });
    if (info.Status === 'Active') {
      ready = true;
    }
  }

  console.log('\n4. 创建/获取函数 URL');
  let functionUrl;
  try {
    const urlInfo = await client.GetFunctionEventInvokeConfig({
      FunctionName: FUNCTION_NAME,
    });
    functionUrl = urlInfo.CustomArg;
  } catch {
    // 没有则创建
  }

  if (!functionUrl) {
    const result = await client.CreateFunctionUrl({
      FunctionName: FUNCTION_NAME,
      AuthType: 'NONE',
      Cors: {
        AllowOrigins: ['*'],
        AllowMethods: ['GET', 'POST', 'OPTIONS'],
        AllowHeaders: ['Content-Type'],
      },
    });
    functionUrl = result.FunctionUrl;
  }

  console.log('\n✅ 部署完成');
  console.log(`函数 URL：${functionUrl}`);
  console.log(`\n请在 APP 中配置以下环境变量：`);
  console.log(`VITE_PROXY_BASE_URL=${functionUrl}`);
}

deploy().catch((error) => {
  console.error('\n❌ 部署失败', error.message);
  process.exit(1);
});
