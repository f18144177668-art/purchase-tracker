import { isNativeApp } from './platform';

const DEV_API_BASE = '/api/anti-counterfeit';
const GONGNIU_BASE = 'https://www.gongniu.cn';
const CAPTCHA_PATH = '/api.php?op=checkcode&code_len=4&font_size=16&width=130&height=50&font_color=&background=';
const QUERY_PATH = '/index.php?c=search&a=query_product';

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

async function parseJsonSafely(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`??????:${text.slice(0, 100)}`);
  }
}

// ?????? Vite ??
async function getCaptchaDev(): Promise<CaptchaResult> {
  const res = await fetch(`${DEV_API_BASE}?action=captcha`);
  const data = await parseJsonSafely(res);
  if (!data.success) throw new Error(data.error || '???????');
  return { sessionId: data.sessionId, captchaImage: data.captchaImage };
}

async function verifyAntiCounterfeitDev(
  pcode: string,
  vcode: string,
  sessionId: string
): Promise<VerifyResult> {
  const res = await fetch(`${DEV_API_BASE}?action=verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pcode, vcode, sessionId }),
  });
  const data = await parseJsonSafely(res);
  if (!data.success) throw new Error(data.error || '????');
  return { isGenuine: data.isGenuine, status: data.status, message: data.message };
}

// ????(APP)????????
async function getCaptchaProd(): Promise<CaptchaResult> {
  const response = await fetch(GONGNIU_BASE + CAPTCHA_PATH, {
    credentials: 'include',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': `${GONGNIU_BASE}/server/security.html`,
    },
  });

  if (!response.ok) {
    throw new Error(`???????:${response.status}`);
  }

  const cookie = response.headers.get('set-cookie') || '';
  const match = cookie.match(/PHPSESSID=([^;]+)/);
  const sessionId = match ? match[1] : '';

  const buffer = await response.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

  return {
    sessionId,
    captchaImage: `data:image/png;base64,${base64}`,
  };
}

async function verifyAntiCounterfeitProd(
  pcode: string,
  vcode: string,
  sessionId: string
): Promise<VerifyResult> {
  const formData = new FormData();
  formData.append('pcode', pcode);
  formData.append('vcode', vcode);

  const response = await fetch(GONGNIU_BASE + QUERY_PATH, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': `${GONGNIU_BASE}/server/security.html`,
      ...(sessionId ? { 'Cookie': `PHPSESSID=${sessionId}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`??????:${response.status}`);
  }

  const data = await parseJsonSafely(response);
  return {
    isGenuine: data.status === 1,
    status: data.status,
    message: data.info || '',
  };
}

export async function getCaptcha(): Promise<CaptchaResult> {
  if (isDev) return getCaptchaDev();
  if (isNativeApp()) return getCaptchaProd();
  throw new Error('?????? APP ???');
}

export async function verifyAntiCounterfeit(
  pcode: string,
  vcode: string,
  sessionId: string
): Promise<VerifyResult> {
  if (isDev) return verifyAntiCounterfeitDev(pcode, vcode, sessionId);
  if (isNativeApp()) return verifyAntiCounterfeitProd(pcode, vcode, sessionId);
  throw new Error('?????? APP ???');
}
