import { useState, useEffect } from 'react';
import { Cloud, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { usePurchaseStore } from '@/store/purchaseStore';

export default function DataBackup() {
  const { refreshCloud, cloudStatus, cloudError, lastSyncTime, purchases, loading } = usePurchaseStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    refreshCloud();
  }, [refreshCloud]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshCloud();
    setRefreshing(false);
  };

  const formatSyncTime = (time: string | null) => {
    if (!time) return '从未同步';
    const date = new Date(time);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusConfig = {
    connected: { icon: CheckCircle, text: '已连接', color: 'text-success-600 bg-success-50' },
    checking: { icon: RefreshCw, text: '检查中', color: 'text-gray-500 bg-gray-100' },
    disconnected: { icon: XCircle, text: '未连接', color: 'text-danger-600 bg-danger-50' },
  };

  const { icon: StatusIcon, text, color } = statusConfig[cloudStatus];

  return (
    <div className="card p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
            <Cloud className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">云端数据</h3>
            <p className="text-xs text-gray-500">{purchases.length} 条记录</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="p-2 text-primary-600 bg-primary-50 rounded-lg transition-all disabled:opacity-50 active:bg-primary-100"
          title="刷新数据"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing || loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
          <StatusIcon className={`w-3.5 h-3.5 ${cloudStatus === 'checking' ? 'animate-spin' : ''}`} />
          <span>{text}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatSyncTime(lastSyncTime)}</span>
        </div>
      </div>

      {cloudStatus === 'disconnected' && cloudError && (
        <div className="mt-3 p-2.5 bg-danger-50 border border-danger-100 rounded-lg">
          <p className="text-xs text-danger-600 break-all">错误：{cloudError}</p>
        </div>
      )}
    </div>
  );
}
