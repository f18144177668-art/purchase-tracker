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
      // Capgo 已经在原生层切换 bundle，短暂提示后 APP 会自动使用新版本
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
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-800">发现新版本</div>
              <div className="text-xs text-gray-500">
                {updateInfo?.currentVersion} → {updateInfo?.latestVersion}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowUpdate(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {updateInfo?.releaseNotes && (
          <div className="text-sm text-gray-600 mb-4 bg-gray-50 rounded-lg p-3">
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
          <div className="flex items-center justify-center gap-2 text-green-600 py-2">
            <Check className="w-5 h-5" />
            <span className="font-medium">更新完成，即将重启...</span>
          </div>
        ) : (
          <div className="space-y-2">
            {updateInfo?.canHotUpdate && (
              <button
                onClick={handleUpdate}
                className="w-full px-4 py-2 text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                立即更新（热更新）
              </button>
            )}
            {updateInfo?.apkUrl && (
              <button
                onClick={handleDownloadApk}
                className="w-full px-4 py-2 text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                下载最新安装包
              </button>
            )}
            <button
              onClick={() => setShowUpdate(false)}
              className="w-full px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              稍后再说
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
