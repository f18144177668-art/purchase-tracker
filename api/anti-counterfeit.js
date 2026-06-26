export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const action = url.searchParams.get('action') || (req.method === 'POST' ? 'verify' : 'captcha');

  try {
    if (action === 'captcha') {
      const imgRes = await fetch(
        'https://www.gongniu.cn/api.php?op=checkcode&code_len=4&font_size=16&width=130&height=50&font_color=&background=',
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://www.gongniu.cn/server/security.html',
          },
        }
      );

      const cookies = imgRes.headers.get('set-cookie') || '';
      const sessionMatch = cookies.match(/PHPSESSID=([^;]+)/);
      const sessionId = sessionMatch ? sessionMatch[1] : '';

      const buffer = await imgRes.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');

      res.status(200).json({
        success: true,
        sessionId,
        captchaImage: `data:image/png;base64,${base64}`,
      });
    } else if (action === 'verify') {
      let body = req.body;
      if (typeof body === 'string') {
        body = JSON.parse(body);
      }
      const { pcode, vcode, sessionId } = body;

      const verifyRes = await fetch(
        'https://www.gongniu.cn/index.php?c=search&a=query_product',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://www.gongniu.cn/server/security.html',
            'Cookie': sessionId ? `PHPSESSID=${sessionId}` : '',
          },
          body: `pcode=${encodeURIComponent(pcode)}&vcode=${encodeURIComponent(vcode)}`,
        }
      );

      const text = await verifyRes.text();

      let result = { success: false, isGenuine: false, status: -99, message: '查询失败' };

      try {
        const json = JSON.parse(text);
        if (json.status === 1) {
          result = {
            success: true,
            isGenuine: true,
            status: 1,
            message: json.data?.product_name || '正品',
          };
        } else {
          result = {
            success: true,
            isGenuine: false,
            status: json.status || -1,
            message: json.msg || '查询失败',
          };
        }
      } catch (e) {
        result.message = '解析响应失败';
      }

      res.status(200).json(result);
    } else {
      res.status(400).json({ success: false, error: 'Invalid action' });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || '服务器错误',
    });
  }
}
