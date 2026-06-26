const API_BASE = '/api/anti-counterfeit';

export interface CaptchaResult {
  sessionId: string;
  captchaImage: string;
}

export interface VerifyResult {
  isGenuine: boolean;
  status: number;
  message: string;
}

export async function getCaptcha(): Promise<CaptchaResult> {
  const res = await fetch(`${API_BASE}?action=captcha`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || '获取验证码失败');
  return { sessionId: data.sessionId, captchaImage: data.captchaImage };
}

export async function verifyAntiCounterfeit(
  pcode: string,
  vcode: string,
  sessionId: string
): Promise<VerifyResult> {
  const res = await fetch(`${API_BASE}?action=verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pcode, vcode, sessionId }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || '查询失败');
  return { isGenuine: data.isGenuine, status: data.status, message: data.message };
}
