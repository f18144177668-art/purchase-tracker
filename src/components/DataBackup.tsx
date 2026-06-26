import { useState, useEffect } from 'react';
import { Cloud, Wifi, Clock, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { usePurchaseStore } from '@/store/purchaseStore';

export default function DataBackup() {
  const { refreshCloud, cloudStatus, lastSyncTime, purchases, loading } = usePurchaseStore();
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

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Cloud className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">云端数据</h3>
            <p className="text-sm text-gray-500">数据实时同步到云端</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all disabled:opacity-50"
          title="刷新数据"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing || loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 border border-indigo-100">
          <div className="flex items-center gap-2 mb-2">
            {cloudStatus === 'checking' ? (
              <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
            ) : cloudStatus === 'connected' ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm text-gray-600">连接状态</span>
          </div>
          <p className={`text-lg font-bold ${cloudStatus === 'connected' ? 'text-green-600' : cloudStatus === 'checking' ? 'text-gray-500' : 'text-red-600'}`}>
            {cloudStatus === 'connected' ? '已连接' : cloudStatus === 'checking' ? '检查中' : '未连接'}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-indigo-100">
          <div className="flex items-center gap-2 mb-2">
            <Wifi className="w-4 h-4 text-indigo-500" />
            <span className="text-sm text-gray-600">数据记录</span>
          </div>
          <p className="text-lg font-bold text-indigo-600">{purchases.length} 条</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>最后更新：{formatSyncTime(lastSyncTime)}</span>
        </div>
      </div>
    </div>
  );
}
