import { usePurchaseStore } from '@/store/purchaseStore';
import { SummaryCards } from '@/components/SummaryCards';
import { ChannelIcon } from '@/components/ChannelIcon';
import DataBackup from '@/components/DataBackup';
import { getSwitchIcon } from '@/utils/modelUtils';
import { Package, ShoppingCart, TrendingUp, RefreshCw, Check } from 'lucide-react';
import { updateService, UpdateResult } from '@/services/updateService';
import { useState } from 'react';

function VersionInfo() {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<UpdateResult | null>(null);
  const [error, setError] = useState('');

  const current = updateService.getCurrentVersion();

  const handleCheck = async () => {
    setChecking(true);
    setError('');
    setResult(null);
    try {
      const r = await updateService.checkForUpdate();
      setResult(r);
    } catch (e: any) {
      setError(e.message || '检查失败');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="card p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900">版本信息</h3>
        <button
          onClick={handleCheck}
          disabled={checking}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
          {checking ? '检查中...' : '检查更新'}
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">当前版本</span>
          <span className="font-medium text-gray-900">v{current.buildNumber}</span>
        </div>

        {result && (
          <div className="mt-3 p-3 rounded-lg bg-gray-50">
            {result.hasUpdate ? (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-success-600 font-medium">
                  <Check className="w-4 h-4" />
                  发现新版本 v{result.latestBuild}
                </div>
                {result.releaseNotes && (
                  <div className="text-xs text-gray-500 mt-1">{result.releaseNotes}</div>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-500">已是最新版本 ✅</div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-danger-50 text-danger-700 text-xs">
            检查失败：{error}
          </div>
        )}
      </div>
    </div>
  );
}

export function StatsPage() {
  const modelStats = usePurchaseStore((state) => state.getModelStats());
  const channelStats = usePurchaseStore((state) => state.getChannelStats());
  const typeStats = usePurchaseStore((state) => state.getTypeStats());

  const maxTypeQty = Math.max(...typeStats.map((s) => s.totalQuantity), 1);
  const maxChannelQty = Math.max(...channelStats.map((s) => s.totalQuantity), 1);
  const maxModelQty = Math.max(...modelStats.map((s) => s.totalQuantity), 1);

  return (
    <div className="page-container">
      <SummaryCards />
      <DataBackup />
      <VersionInfo />

      {/* 按类型统计 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-primary-600" />
            <h3 className="text-sm font-bold text-gray-900">按类型统计</h3>
          </div>
          <span className="text-xs text-gray-500">{typeStats.length} 种</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {typeStats.map((stat) => (
            <div
              key={stat.type}
              className="shrink-0 card p-3 w-36 card-press"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{getSwitchIcon(stat.type)}</span>
                <span className="font-semibold text-gray-900 text-sm truncate">{stat.type}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">数量</span>
                  <span className="font-bold text-gray-900">{stat.totalQuantity}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">总价</span>
                  <span className="font-bold text-warning-600">¥{stat.totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-primary-500 h-1.5 rounded-full"
                  style={{ width: `${(stat.totalQuantity / maxTypeQty) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 按渠道统计 */}
      <div className="card p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-success-600" />
            <h3 className="text-sm font-bold text-gray-900">按渠道统计</h3>
          </div>
          <span className="text-xs text-gray-500">{channelStats.length} 个</span>
        </div>
        <div className="space-y-3">
          {channelStats.map((stat) => (
            <div key={stat.channel} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ChannelIcon channel={stat.channel} size={20} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{stat.channel}</p>
                    <p className="text-xs text-gray-500">{stat.count} 次采购</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{stat.totalQuantity} 件</p>
                  <p className="text-xs text-warning-600 font-medium">¥{stat.totalPrice.toFixed(2)}</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-success-500 h-1.5 rounded-full"
                  style={{ width: `${(stat.totalQuantity / maxChannelQty) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 按型号统计 */}
      <div className="card p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-warning-600" />
            <h3 className="text-sm font-bold text-gray-900">按型号统计</h3>
          </div>
          <span className="text-xs text-gray-500">{modelStats.length} 种</span>
        </div>
        <div className="space-y-4">
          {modelStats.map((stat) => (
            <div key={stat.model} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg">{getSwitchIcon(stat.model)}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{stat.model}</p>
                    <p className="text-xs text-gray-500">均价 ¥{stat.avgPrice.toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-warning-600">¥{stat.totalPrice.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{stat.totalQuantity} 件 / {stat.count} 次</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-500 mb-0.5">最高</p>
                  <p className="text-xs font-bold text-danger-600">¥{stat.maxPrice.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-500 mb-0.5">最低</p>
                  <p className="text-xs font-bold text-success-600">¥{stat.minPrice.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-500 mb-0.5">均价</p>
                  <p className="text-xs font-bold text-primary-600">¥{stat.avgPrice.toFixed(2)}</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-warning-500 h-1.5 rounded-full"
                  style={{ width: `${(stat.totalQuantity / maxModelQty) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
