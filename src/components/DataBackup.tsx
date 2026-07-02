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
    connected: {
      icon: CheckCircle,
      text: '已连接',
      dot: '#10b981',
      textColor: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    checking: {
      icon: RefreshCw,
      text: '同步中',
      dot: '#6b7280',
      textColor: 'text-gray-500',
      bg: 'bg-gray-100',
    },
    disconnected: {
      icon: XCircle,
      text: '未连接',
      dot: '#ef4444',
      textColor: 'text-red-500',
      bg: 'bg-red-50',
    },
  };

  const { icon: StatusIcon, text, textColor, bg } = statusConfig[cloudStatus];

  return (
    <div className="card p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)' }}
          >
            <Cloud className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 text-sm">云端同步</h3>
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-medium ${bg} ${textColor}`}>
                <StatusIcon className={`w-3 h-3 ${cloudStatus === 'checking' ? 'animate-spin' : ''}`} />
                {text}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-gray-400" />
              <p className="text-xs text-gray-400">{formatSyncTime(lastSyncTime)} · {purchases.length} 条</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 transition-all disabled:opacity-40 active:bg-gray-100 active:scale-95"
          title="刷新数据"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing || loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {cloudStatus === 'disconnected' && cloudError && (
        <div className="mt-3 p-2.5 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-xs text-red-500 break-all">错误：{cloudError}</p>
        </div>
      )}
    </div>
  );
}
