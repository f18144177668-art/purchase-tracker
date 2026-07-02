const https = require('https');
const querystring = require('querystring');

const GONGNIU_HOST = 'www.gongniu.cn';
const CAPTCHA_PATH = '/api.php?op=checkcode&code_len=4&font_size=16&width=130&height=50&font_color=&background=';
const QUERY_PATH = '/index.php?c=search&a=query_product';

let COS = null;
let cosClient = null;
let cosEnabled = false;
let memoryLogs = [];

function initCos() {
  if (cosEnabled) return true;
  if (!process.env.COS_SECRET_ID || !process.env.COS_SECRET_KEY || !process.env.COS_BUCKET || !process.env.COS_REGION) {
    return false;
  }
  try {
    COS = require('cos-nodejs-sdk-v5');
    cosClient = new COS({
      SecretId: process.env.COS_SECRET_ID,
      SecretKey: process.env.COS_SECRET_KEY,
    });
    cosEnabled = true;
    return true;
  } catch (error) {
    console.log('COS 初始化失败，使用内存日志:', error.message);
    return false;
  }
}

function getCosConfig() {
  return {
    Bucket: process.env.COS_BUCKET,
    Region: process.env.COS_REGION,
    Key: process.env.COS_LOG_KEY || 'logs/purchase-tracker.log',
  };
}

function makeJsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: JSON.stringify(body),
  };
}

function requestGongniu(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          buffer: Buffer.concat(chunks),
        });
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function getCaptcha() {
  const options = {
    hostname: GONGNIU_HOST,
    path: CAPTCHA_PATH,
    method: 'GET',
    headers: {
      Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      Referer: `https://${GONGNIU_HOST}/server/security.html`,
    },
  };

  const { headers, buffer } = await requestGongniu(options);

  const cookies = headers['set-cookie'] || [];
  const sessionCookie = cookies.find((c) => c.includes('PHPSESSID')) || '';
  const match = sessionCookie.match(/PHPSESSID=([^;]+)/);
  const sessionId = match ? match[1] : '';

  return makeJsonResponse(200, {
    success: true,
    sessionId,
    captchaImage: `data:image/png;base64,${buffer.toString('base64')}`,
  });
}

async function verifyAntiCounterfeit(body) {
  let payload;
  try {
    payload = JSON.parse(body || '{}');
  } catch {
    return makeJsonResponse(400, { success: false, error: '请求体格式错误' });
  }

  const { pcode, vcode, sessionId } = payload;
  if (!pcode || !vcode) {
    return makeJsonResponse(400, { success: false, error: '缺少防伪码或验证码' });
  }

  const postData = querystring.stringify({ pcode, vcode });
  const options = {
    hostname: GONGNIU_HOST,
    path: QUERY_PATH,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      Accept: 'application/json, text/javascript, */*; q=0.01',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      Referer: `https://${GONGNIU_HOST}/server/security.html`,
      ...(sessionId ? { Cookie: `PHPSESSID=${sessionId}` } : {}),
    },
  };

  const { buffer } = await requestGongniu(options, postData);
  const text = buffer.toString('utf-8');

  try {
    const data = JSON.parse(text);
    return makeJsonResponse(200, {
      success: true,
      isGenuine: data.status === 1,
      status: data.status,
      message: data.info || '',
    });
  } catch {
    return makeJsonResponse(200, {
      success: false,
      error: '解析公牛官网响应失败',
      raw: text.slice(0, 300),
    });
  }
}

async function readLogsFromCos() {
  if (!initCos()) return [];
  try {
    const result = await cosClient.getObject(getCosConfig());
    const text = result.Body.toString('utf-8');
    return text
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch (error) {
    if (error.statusCode === 404) return [];
    throw error;
  }
}

async function writeLogsToCos(logs) {
  if (!initCos()) return;
  const text = logs.map((log) => JSON.stringify(log)).join('\n') + (logs.length ? '\n' : '');
  await cosClient.putObject({ ...getCosConfig(), Body: Buffer.from(text, 'utf-8') });
}

async function readLogs() {
  const cosLogs = await readLogsFromCos();
  if (cosLogs.length > 0) return cosLogs;
  return memoryLogs;
}

async function writeLogs(logs) {
  memoryLogs = logs;
  await writeLogsToCos(logs);
}

async function appendLog(body) {
  let payload;
  try {
    payload = JSON.parse(body || '{}');
  } catch {
    return makeJsonResponse(400, { success: false, error: '请求体格式错误' });
  }

  const { level, message, details } = payload;
  if (!message) {
    return makeJsonResponse(400, { success: false, error: '缺少日志内容' });
  }

  const entry = {
    timestamp: Date.now(),
    level: level || 'info',
    message,
    details,
  };

  // 同时输出到函数日志，方便在 SCF 控制台查看
  console.log(JSON.stringify(entry));

  const logs = await readLogs();
  logs.push(entry);

  if (logs.length > 2000) {
    logs.splice(0, logs.length - 2000);
  }

  await writeLogs(logs);
  return makeJsonResponse(200, { success: true });
}

async function getLogs() {
  const logs = await readLogs();
  return makeJsonResponse(200, { success: true, logs });
}

function getPath(event) {
  if (event.path) return event.path;
  if (event.rawPath) return event.rawPath;
  if (event.requestContext?.path) return event.requestContext.path;
  if (event.requestContext?.http?.path) return event.requestContext.http.path;
  return '/';
}

function getMethod(event) {
  const method =
    event.httpMethod ||
    event.requestContext?.httpMethod ||
    event.requestContext?.http?.method ||
    'GET';
  return method.toUpperCase();
}

exports.main_handler = async (event, context) => {
  const path = getPath(event);
  const method = getMethod(event);

  if (method === 'OPTIONS') {
    return makeJsonResponse(204, {});
  }

  try {
    if (path === '/captcha' && method === 'GET') {
      return await getCaptcha();
    }
    if (path === '/verify' && method === 'POST') {
      return await verifyAntiCounterfeit(event.body);
    }
    if (path === '/log' && method === 'POST') {
      return await appendLog(event.body);
    }
    if (path === '/logs' && method === 'GET') {
      return await getLogs();
    }
    return makeJsonResponse(404, { error: 'Not Found' });
  } catch (error) {
    console.error('处理请求失败:', error);
    return makeJsonResponse(500, {
      error: error.message || 'Internal Server Error',
      stack: error.stack || '',
    });
  }
};
