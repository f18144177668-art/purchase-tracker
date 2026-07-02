import { isNativeApp } from './platform';
import { logger } from './logger';

const DEV_API_BASE = '/api/anti-counterfeit';
const PROXY_BASE = import.meta.env.VITE_PROXY_BASE_URL || '';

const isDev = import.meta.env.DEV;

export interface CaptchaResult {
  sessionId: string;
  captchaImage: string;
}

export interface VerifyResult {
  isGenuine: boolean;
  status: number;
  message: string;
}

function getApiBase(): string {
  if (isDev) return DEV_API_BASE;
  if (PROXY_BASE) return PROXY_BASE;
  throw new Error('未配置代理地址');
}

async function parseJsonSafely(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`服务返回异常：${text.slice(0, 100)}`);
  }
}

async function request(action: string, body?: object) {
  const url = `${getApiBase()}/${action}`;
  logger.debug(`请求代理：${action}`, { url });

  const init: RequestInit = {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
  };
  if (body) {
    init.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, init);
    logger.debug(`代理响应：${action}`, { status: res.status });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await parseJsonSafely(res);
    if (!data.success) {
      throw new Error(data.error || '请求失败');
    }
    return data;
  } catch (error) {
    logger.error(`代理请求失败：${action}`, error);
    throw error;
  }
}

export async function getCaptcha(): Promise<CaptchaResult> {
  if (isDev) {
    const data = await request('captcha');
    return { sessionId: data.sessionId, captchaImage: data.captchaImage };
  }

  if (!isNativeApp()) {
    throw new Error('防伪查询请在 APP 中使用');
  }

  if (!PROXY_BASE) {
    throw new Error('未配置防伪查询代理地址');
  }

  const data = await request('captcha');
  return { sessionId: data.sessionId, captchaImage: data.captchaImage };
}

export async function verifyAntiCounterfeit(
  pcode: string,
  vcode: string,
  sessionId: string
): Promise<VerifyResult> {
  const data = await request('verify', { pcode, vcode, sessionId });
  return {
    isGenuine: data.isGenuine,
    status: data.status,
    message: data.message,
  };
}
