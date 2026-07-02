import { useState, useEffect } from 'react';
import { RefreshCw, X, Check, Download, ExternalLink } from 'lucide-react';
import { updateService, UpdateResult } from '@/services/updateService';

export default function UpdateBanner() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateResult | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);

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

  const handleUpdate = async () => {
    setDownloading(true);
    setProgress(0);

    const success = await updateService.downloadUpdate((p) => {
      setProgress(p);
    });

    setDownloading(false);

    if (success) {
      setSuccess(true);
      setTimeout(() => {
        setShowUpdate(false);
      }, 1500);
    }
  };

  const handleDownloadApk = () => {
    if (updateInfo?.apkUrl) {
      window.open(updateInfo.apkUrl, '_blank');
    }
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">发现新版本</div>
              <div className="text-xs text-gray-500">
                build {updateInfo?.currentBuild} → build {updateInfo?.latestBuild}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowUpdate(false)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {updateInfo?.releaseNotes && (
          <div className="text-sm text-gray-600 mb-4 bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
            {updateInfo.releaseNotes}
          </div>
        )}

        {downloading ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-2">
                <Download className="w-4 h-4 animate-bounce" />
                正在下载更新...
              </span>
              <span className="text-primary-600 font-medium">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : success ? (
          <div className="flex items-center justify-center gap-2 text-green-600 py-3">
            <Check className="w-5 h-5" />
            <span className="font-medium">更新完成，即将重启...</span>
          </div>
        ) : (
          <div className="space-y-2">
            {updateInfo?.canHotUpdate && (
              <button
                onClick={handleUpdate}
                className="w-full py-3 text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <RefreshCw className="w-4 h-4" />
                立即更新（热更新）
              </button>
            )}
            {updateInfo?.apkUrl && (
              <button
                onClick={handleDownloadApk}
                className="w-full py-3 text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <ExternalLink className="w-4 h-4" />
                下载最新安装包
              </button>
            )}
            <button
              onClick={() => setShowUpdate(false)}
              className="w-full py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium active:scale-[0.98]"
            >
              稍后再说
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
