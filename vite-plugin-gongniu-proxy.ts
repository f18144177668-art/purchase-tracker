import type { Plugin } from 'vite';

const GONGNIU_BASE = 'https://www.gongniu.cn';
const CAPTCHA_PATH = '/api.php?op=checkcode&code_len=4&font_size=16&width=130&height=50&font_color=&background=';
const QUERY_PATH = '/index.php?c=search&a=query_product';

const sessions = new Map<string, string>();

export function gongniuProxy(): Plugin {
  return {
    name: 'gongniu-proxy',
    configureServer(server) {
      server.middlewares.use('/api/anti-counterfeit', async (req, res) => {
        const url = new URL(req.url || '', 'http://localhost');
        const action = url.searchParams.get('action');

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end('ok');
          return;
        }

        try {
          if (action === 'captcha') {
            const response = await fetch(GONGNIU_BASE + CAPTCHA_PATH, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': `${GONGNIU_BASE}/server/security.html`,
              },
            });

            const cookie = response.headers.get('set-cookie') || '';
            const match = cookie.match(/PHPSESSID=([^;]+)/);
            const sessionId = match ? match[1] : '';

            const buffer = Buffer.from(await response.arrayBuffer());
            const base64 = buffer.toString('base64');

            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify({
              success: true,
              sessionId,
              captchaImage: `data:image/png;base64,${base64}`,
            }));
            return;
          }

          if (action === 'verify' && req.method === 'POST') {
            let body = '';
            for await (const chunk of req) {
              body += chunk;
            }
            const { pcode, vcode, sessionId } = JSON.parse(body);

            if (!pcode || !vcode || !sessionId) {
              res.writeHead(400);
              res.end(JSON.stringify({ success: false, error: '缺少参数' }));
              return;
            }

            const formData = new FormData();
            formData.append('pcode', pcode);
            formData.append('vcode', vcode);

            const response = await fetch(GONGNIU_BASE + QUERY_PATH, {
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
              res.writeHead(500);
              res.end(JSON.stringify({ success: false, error: '解析失败', raw: text }));
              return;
            }

            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200);
            res.end(JSON.stringify({
              success: true,
              isGenuine: result.status === 1,
              status: result.status,
              message: result.info || '',
              raw: result,
            }));
            return;
          }

          res.writeHead(400);
          res.end(JSON.stringify({ success: false, error: '无效操作' }));
        } catch (error: any) {
          res.writeHead(500);
          res.end(JSON.stringify({ success: false, error: error.message }));
        }
      });
    },
  };
}
