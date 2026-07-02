const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { promisify } = require('util');

const tencentcloud = require('tencentcloud-sdk-nodejs');

const ScfClient = tencentcloud.scf.v20180416.Client;

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

  // 复制源码到根目录
  fs.cpSync(path.join(root, 'src', 'index.js'), path.join(distDir, 'index.js'));

  // 安装生产依赖
  fs.writeFileSync(
    path.join(distDir, 'package.json'),
    JSON.stringify({
      name: 'purchase-tracker-proxy',
      version: '1.0.0',
      main: 'index.js',
      dependencies: {
        'cos-nodejs-sdk-v5': '^2.14.0',
      },
    })
  );
  run('npm install --production', { cwd: distDir });

  // 使用 adm-zip 打包，保证路径为正斜杠，兼容 Linux 解压
  const AdmZip = require('adm-zip');
  const zip = new AdmZip();
  zip.addLocalFolder(distDir, '');
  zip.writeZip(zipPath);

  return zipPath;
}

async function deploy() {
  const secretId = requireEnv('TENCENT_SECRET_ID');
  const secretKey = requireEnv('TENCENT_SECRET_KEY');
  const region = process.env.TENCENT_REGION || DEFAULT_REGION;

  console.log('\n1. 打包函数代码');
  const zipPath = await zipFunctionCode();
  const zipBuffer = fs.readFileSync(zipPath);

  console.log('\n2. 创建/更新 SCF 函数');
  const client = new ScfClient({
    credential: { secretId, secretKey },
    region,
    profile: { signMethod: 'TC3-HMAC-SHA256' },
  });

  const envVars = [
    { Key: 'COS_SECRET_ID', Value: process.env.COS_SECRET_ID || '' },
    { Key: 'COS_SECRET_KEY', Value: process.env.COS_SECRET_KEY || '' },
    { Key: 'COS_BUCKET', Value: process.env.COS_BUCKET || '' },
    { Key: 'COS_REGION', Value: process.env.COS_REGION || '' },
    { Key: 'COS_LOG_KEY', Value: process.env.COS_LOG_KEY || 'logs/purchase-tracker.log' },
  ];

  const clsLogsetId = process.env.CLS_LOGSET_ID || '';
  const clsTopicId = process.env.CLS_TOPIC_ID || '';

  const functionConfig = {
    FunctionName: FUNCTION_NAME,
    Handler: 'index.main_handler',
    Runtime: 'Nodejs18.15',
    MemorySize: 128,
    Timeout: 30,
    Environment: { Variables: envVars },
    Code: { ZipFile: zipBuffer.toString('base64') },
    ...(clsLogsetId ? { ClsLogsetId: clsLogsetId } : {}),
    ...(clsTopicId ? { ClsTopicId: clsTopicId } : {}),
  };

  let functionInfo = null;
  try {
    functionInfo = await client.GetFunction({ FunctionName: FUNCTION_NAME });
  } catch {
    functionInfo = null;
  }

  if (functionInfo) {
    if (functionInfo.Status !== 'Active') {
      console.log(`函数当前状态为 ${functionInfo.Status}，先删除再重新创建...`);
      await client.DeleteFunction({ FunctionName: FUNCTION_NAME });
      // 等待删除完成
      let deleted = false;
      while (!deleted) {
        await promisify(setTimeout)(2000);
        try {
          await client.GetFunction({ FunctionName: FUNCTION_NAME });
        } catch {
          deleted = true;
        }
      }
      console.log('创建函数...');
      await client.CreateFunction(functionConfig);
    } else {
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
        ...(clsLogsetId ? { ClsLogsetId: clsLogsetId } : {}),
        ...(clsTopicId ? { ClsTopicId: clsTopicId } : {}),
      });
    }
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

  console.log('\n✅ 函数部署完成');
  console.log(`函数名称：${FUNCTION_NAME}`);
  console.log(`所在地域：${region}`);
  console.log('\n⚠️  下一步：请到 SCF 控制台开启“函数 URL”');
  console.log(`控制台地址：https://console.cloud.tencent.com/scf/detail?rid=${region}&ns=default&fn=${FUNCTION_NAME}`);
  console.log('\n开启函数 URL 后，把 URL 配置到 GitHub Secret：VITE_PROXY_BASE_URL');
}

deploy().catch((error) => {
  console.error('\n❌ 部署失败', error.message);
  process.exit(1);
});
