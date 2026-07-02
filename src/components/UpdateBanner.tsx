import { useState, useEffect } from 'react';
import { RefreshCw, X, Download, CheckCircle } from 'lucide-react';
import { updateService, UpdateResult } from '@/services/updateService';
import { Filesystem, Directory } from '@capacitor/filesystem';

export default function UpdateBanner() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateResult | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [installed, setInstalled] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkUpdate();
  }, []);

  const checkUpdate = async () => {
    const result = await updateService.checkForUpdate();
    if (result.hasUpdate) {
      setUpdateInfo(result);
      setShowUpdate(true);
    }
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const handleDownloadAndInstall = async () => {
    if (!updateInfo?.apkUrl) return;
    setDownloading(true);
    setProgress(0);
    setError('');

    try {
      // 1. 下载 APK（用 XMLHttpRequest 追踪进度）
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', updateInfo.apkUrl!, true);
        xhr.responseType = 'arraybuffer';

        xhr.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 0) {
            resolve(xhr.response as ArrayBuffer);
          } else {
            reject(new Error(`下载失败 (${xhr.status})`));
          }
        };

        xhr.onerror = () => reject(new Error('网络错误，下载失败'));
        xhr.send();
      });

      // 2. 保存到 Downloads 目录
      const base64 = arrayBufferToBase64(arrayBuffer);
      await Filesystem.writeFile({
        path: 'purchase-tracker.apk',
        data: base64,
        directory: Directory.External,
        recursive: true,
      });

      // 3. 获取文件 URI 并调起安装
      const { uri } = await Filesystem.getUri({
        path: 'purchase-tracker.apk',
        directory: Directory.External,
      });

      setProgress(100);
      setDownloading(false);
      setInstalled(true);

      // 通过系统调起 APK 安装
      window.open(uri, '_system');

      setTimeout(() => setShowUpdate(false), 2000);
    } catch (e: any) {
      setDownloading(false);
      setError(e.message || '下载失败');
    }
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5">
        {/* 标题区 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {installed ? (
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' }}
              >
                <RefreshCw className={`w-5 h-5 text-white ${downloading ? 'animate-spin' : ''}`} />
              </div>
            )}
            <div>
              <div className="font-semibold text-gray-900">
                {installed ? '安装包已就绪' : downloading ? '正在下载...' : error ? '下载失败' : '发现新版本'}
              </div>
              <div className="text-xs text-gray-500">
                {installed
                  ? '请在弹出的安装页面中完成安装'
                  : error
                    ? error
                    : `v${updateInfo?.currentVersion} → v${updateInfo?.latestVersion}`}
              </div>
            </div>
          </div>
          {!downloading && (
            <button
              onClick={() => setShowUpdate(false)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 更新日志 */}
        {!installed && !error && updateInfo?.releaseNotes && (
          <div className="text-sm text-gray-600 mb-4 bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto whitespace-pre-line">
            {updateInfo.releaseNotes}
          </div>
        )}

        {/* 下载进度条 */}
        {downloading && (
          <div className="mb-4">
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
                }}
              />
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">{progress}%</p>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="space-y-2">
          {!installed && !error && (
            <button
              onClick={handleDownloadAndInstall}
              disabled={downloading}
              className="w-full py-3 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
            >
              <Download className="w-4 h-4" />
              {downloading ? '下载中...' : '下载并安装'}
            </button>
          )}

          {error && (
            <button
              onClick={handleDownloadAndInstall}
              className="w-full py-3 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
            >
              <RefreshCw className="w-4 h-4" />
              重新下载
            </button>
          )}

          {!downloading && !installed && (
            <button
              onClick={() => setShowUpdate(false)}
              className="w-full py-3 text-gray-600 bg-gray-100 rounded-xl active:bg-gray-200 transition-colors text-sm font-medium active:scale-[0.98]"
            >
              稍后再说
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
