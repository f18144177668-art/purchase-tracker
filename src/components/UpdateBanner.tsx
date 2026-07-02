import { useState, useEffect } from 'react';
import { RefreshCw, X, ExternalLink } from 'lucide-react';
import { updateService, UpdateResult } from '@/services/updateService';

export default function UpdateBanner() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateResult | null>(null);

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

  const handleDownloadApk = () => {
    if (updateInfo?.apkUrl) {
      window.open(updateInfo.apkUrl, '_blank');
      setShowUpdate(false);
    }
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' }}
            >
              <RefreshCw className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">发现新版本</div>
              <div className="text-xs text-gray-500">
                v{updateInfo?.currentVersion} → v{updateInfo?.latestVersion}
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
          <div className="text-sm text-gray-600 mb-4 bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto whitespace-pre-line">
            {updateInfo.releaseNotes}
          </div>
        )}

        <div className="space-y-2">
          {updateInfo?.apkUrl && (
            <button
              onClick={handleDownloadApk}
              className="w-full py-3 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
            >
              <ExternalLink className="w-4 h-4" />
              下载最新安装包
            </button>
          )}
          <button
            onClick={() => setShowUpdate(false)}
            className="w-full py-3 text-gray-600 bg-gray-100 rounded-xl active:bg-gray-200 transition-colors text-sm font-medium active:scale-[0.98]"
          >
            稍后再说
          </button>
        </div>
      </div>
    </div>
  );
}
