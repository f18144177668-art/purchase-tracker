const https = require('https');
const querystring = require('querystring');
const COS = require('cos-nodejs-sdk-v5');

const GONGNIU_HOST = 'www.gongniu.cn';
const CAPTCHA_PATH = '/api.php?op=checkcode&code_len=4&font_size=16&width=130&height=50&font_color=&background=';
const QUERY_PATH = '/index.php?c=search&a=query_product';

let cosClient = null;

function getCosClient() {
  if (cosClient) return cosClient;
  cosClient = new COS({
    SecretId: process.env.COS_SECRET_ID,
    SecretKey: process.env.COS_SECRET_KEY,
  });
  return cosClient;
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

async function readLogs() {
  const cos = getCosClient();
  const config = getCosConfig();
  try {
    const result = await cos.getObject(config);
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

async function writeLogs(logs) {
  const cos = getCosClient();
  const config = getCosConfig();
  const text = logs.map((log) => JSON.stringify(log)).join('\n') + (logs.length ? '\n' : '');
  await cos.putObject({ ...config, Body: Buffer.from(text, 'utf-8') });
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

  const logs = await readLogs();
  logs.push({
    timestamp: Date.now(),
    level: level || 'info',
    message,
    details,
  });

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
    return makeJsonResponse(500, {
      error: error.message || 'Internal Server Error',
      stack: error.stack || '',
    });
  }
};
