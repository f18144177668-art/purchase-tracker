// @ts-nocheck
// Edge Function: 公牛产品防伪查询代理

const GONGNIU_BASE = 'https://www.gongniu.cn';
const CAPTCHA_URL = `${GONGNIU_BASE}/api.php?op=checkcode&code_len=4&font_size=16&width=130&height=50&font_color=&background=`;
const QUERY_URL = `${GONGNIU_BASE}/index.php?c=search&a=query_product`;

Deno.serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  try {
    // 获取验证码
    if (action === 'captcha') {
      const response = await fetch(CAPTCHA_URL, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': `${GONGNIU_BASE}/server/security.html`,
        },
      });

      const cookie = response.headers.get('set-cookie') || '';
      const phpsessidMatch = cookie.match(/PHPSESSID=([^;]+)/);
      const phpsessid = phpsessidMatch ? phpsessidMatch[1] : '';

      const imageBuffer = await response.arrayBuffer();
      const imageBase64 = btoa(
        new Uint8Array(imageBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      return new Response(
        JSON.stringify({
          success: true,
          sessionId: phpsessid,
          captchaImage: `data:image/png;base64,${imageBase64}`,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // 查询防伪
    if (action === 'verify' && req.method === 'POST') {
      const { pcode, vcode, sessionId } = await req.json();

      if (!pcode || !vcode || !sessionId) {
        return new Response(
          JSON.stringify({ success: false, error: '缺少必要参数' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const formData = new FormData();
      formData.append('pcode', pcode);
      formData.append('vcode', vcode);

      const response = await fetch(QUERY_URL, {
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': `${GONGNIU_BASE}/server/security.html`,
          'Cookie': `PHPSESSID=${sessionId}`,
        },
        body: formData,
      });

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        return new Response(
          JSON.stringify({ success: false, error: '解析响应失败', raw: text }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const isGenuine = result.status === 1;

      return new Response(
        JSON.stringify({
          success: true,
          isGenuine,
          status: result.status,
          message: result.info || '',
          raw: result,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: '无效的操作' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
