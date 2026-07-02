# 腾讯云 SCF 代理

为 APP 提供国内可访问的后端代理：
- 防伪查询转发到公牛官网
- 远程日志接收与查询

## 前置准备

1. 注册腾讯云账号并完成实名认证：https://cloud.tencent.com/
2. 开通云函数 SCF：https://console.cloud.tencent.com/scf
3. 开通对象存储 COS：https://console.cloud.tencent.com/cos
4. 创建访问密钥：https://console.cloud.tencent.com/cam/capi
   - 记录 `SecretId` 和 `SecretKey`

## 部署步骤

进入本目录：

```bash
cd server/tencent
```

安装依赖：

```bash
npm install
```

设置环境变量（PowerShell 示例）：

```powershell
$env:TENCENT_SECRET_ID="你的 SecretId"
$env:TENCENT_SECRET_KEY="你的 SecretKey"
$env:TENCENT_REGION="ap-guangzhou"
$env:COS_BUCKET="你的 bucket 名称，例如 purchase-tracker-logs-123"
$env:COS_REGION="ap-guangzhou"
```

> 注意：COS bucket 名称需要全局唯一，建议使用 `purchase-tracker-logs-你的随机数字`。

运行部署脚本：

```bash
npm run deploy
```

部署成功后会输出函数 URL，例如：

```
函数 URL：https://xxx-xxx.ap-guangzhou.tencentscs.com
```

## 配置 APP

将函数 URL 配置到 APP 的环境变量中：

项目根目录创建 `.env.local`：

```
VITE_PROXY_BASE_URL=https://xxx-xxx.ap-guangzhou.tencentscs.com
```

重新构建 APP 即可。
