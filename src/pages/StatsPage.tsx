import { usePurchaseStore } from '@/store/purchaseStore';
import { SummaryCards } from '@/components/SummaryCards';
import { ChannelIcon } from '@/components/ChannelIcon';
import DataBackup from '@/components/DataBackup';
import { getSwitchIcon } from '@/utils/modelUtils';
import { Package, ShoppingCart, TrendingUp, RefreshCw, Check, Smartphone } from 'lucide-react';
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}
          >
            <Smartphone className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">当前版本</h3>
            <p className="text-xs text-gray-400 mt-0.5">v{current.buildNumber}</p>
          </div>
        </div>
        <button
          onClick={handleCheck}
          disabled={checking}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-primary-600 bg-primary-50 rounded-xl active:scale-95 disabled:opacity-50 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
          {checking ? '检查中...' : '检查更新'}
        </button>
      </div>

      {result && (
        <div className={`mt-3 p-3 rounded-xl ${result.hasUpdate ? 'bg-blue-50' : 'bg-gray-50'}`}>
          {result.hasUpdate ? (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-primary-600 font-medium text-sm">
                <Check className="w-4 h-4" />
                发现新版本 v{result.latestBuild}
              </div>
              {result.releaseNotes && (
                <p className="text-xs text-gray-500 ml-5">{result.releaseNotes}</p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              已是最新版本
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 rounded-xl bg-red-50 text-red-500 text-xs">
          检查失败：{error}
        </div>
      )}
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
            <div className="w-6 h-6 rounded-lg bg-primary-100 flex items-center justify-center">
              <Package className="w-3.5 h-3.5 text-primary-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">按类型</h3>
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{typeStats.length} 种</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {typeStats.map((stat) => (
            <div
              key={stat.type}
              className="shrink-0 card p-3.5 w-36 card-press"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{getSwitchIcon(stat.type)}</span>
                <span className="font-semibold text-gray-800 text-sm truncate">{stat.type}</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] text-gray-400">数量</span>
                  <span className="text-sm font-bold text-gray-800">{stat.totalQuantity}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] text-gray-400">总价</span>
                  <span className="text-sm font-bold text-orange-500">¥{stat.totalPrice.toFixed(0)}</span>
                </div>
              </div>
              <div className="mt-3 w-full bg-gray-100 rounded-full h-1">
                <div
                  className="h-1 rounded-full progress-bar"
                  style={{
                    width: `${(stat.totalQuantity / maxTypeQty) * 100}%`,
                    background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
                  }}
                />
              </div>
            </div>
          ))}
          {typeStats.length === 0 && (
            <div className="card p-6 text-center text-sm text-gray-400 w-full">暂无数据</div>
          )}
        </div>
      </div>

      {/* 按渠道统计 */}
      <div className="card p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
              <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">按渠道</h3>
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{channelStats.length} 个</span>
        </div>
        <div className="space-y-4">
          {channelStats.map((stat) => (
            <div key={stat.channel}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ChannelIcon channel={stat.channel} size={20} />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{stat.channel}</p>
                    <p className="text-[11px] text-gray-400">{stat.count} 次采购</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">{stat.totalQuantity} 件</p>
                  <p className="text-[11px] text-orange-500 font-medium">¥{stat.totalPrice.toFixed(2)}</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full progress-bar"
                  style={{
                    width: `${(stat.totalQuantity / maxChannelQty) * 100}%`,
                    background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                  }}
                />
              </div>
            </div>
          ))}
          {channelStats.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-4">暂无数据</p>
          )}
        </div>
      </div>

      {/* 按型号统计 */}
      <div className="card p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">按型号</h3>
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{modelStats.length} 种</span>
        </div>
        <div className="space-y-5">
          {modelStats.map((stat) => (
            <div key={stat.model}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xl">{getSwitchIcon(stat.model)}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{stat.model}</p>
                    <p className="text-[11px] text-gray-400">{stat.count} 次 · 均价 ¥{stat.avgPrice.toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-orange-500">¥{stat.totalPrice.toFixed(0)}</p>
                  <p className="text-[11px] text-gray-400">{stat.totalQuantity} 件</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="rounded-xl p-2 text-center" style={{ background: '#fff5f5' }}>
                  <p className="text-[11px] text-gray-400 mb-0.5">最高</p>
                  <p className="text-xs font-bold text-red-500">¥{stat.maxPrice.toFixed(2)}</p>
                </div>
                <div className="rounded-xl p-2 text-center" style={{ background: '#f0fdf4' }}>
                  <p className="text-[11px] text-gray-400 mb-0.5">最低</p>
                  <p className="text-xs font-bold text-emerald-600">¥{stat.minPrice.toFixed(2)}</p>
                </div>
                <div className="rounded-xl p-2 text-center" style={{ background: '#eff6ff' }}>
                  <p className="text-[11px] text-gray-400 mb-0.5">均价</p>
                  <p className="text-xs font-bold text-primary-600">¥{stat.avgPrice.toFixed(2)}</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full progress-bar"
                  style={{
                    width: `${(stat.totalQuantity / maxModelQty) * 100}%`,
                    background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
                  }}
                />
              </div>
            </div>
          ))}
          {modelStats.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-4">暂无数据</p>
          )}
        </div>
      </div>
    </div>
  );
}
