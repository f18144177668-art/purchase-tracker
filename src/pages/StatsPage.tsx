import { usePurchaseStore } from '@/store/purchaseStore';
import { SummaryCards } from '@/components/SummaryCards';
import { ChannelIcon } from '@/components/ChannelIcon';
import DataBackup from '@/components/DataBackup';
import { getSwitchIcon } from '@/utils/modelUtils';
import { Package, TrendingUp, ShoppingCart } from 'lucide-react';

export function StatsPage() {
  const modelStats = usePurchaseStore((state) => state.getModelStats());
  const channelStats = usePurchaseStore((state) => state.getChannelStats());
  const typeStats = usePurchaseStore((state) => state.getTypeStats());

  const maxTypeQty = Math.max(...typeStats.map((s) => s.totalQuantity), 1);
  const maxChannelQty = Math.max(...channelStats.map((s) => s.totalQuantity), 1);
  const maxModelQty = Math.max(...modelStats.map((s) => s.totalQuantity), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <SummaryCards />

      <DataBackup />

      {/* 按类型统计 */}
      <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">按类型统计</h3>
            <p className="text-sm text-gray-500">共 {typeStats.length} 种类型</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {typeStats.map((stat) => (
            <div
              key={stat.type}
              className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{getSwitchIcon(stat.type)}</span>
                <span className="font-semibold text-gray-800 text-sm">{stat.type}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">数量</span>
                  <span className="font-bold text-gray-800">{stat.totalQuantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">均价</span>
                  <span className="font-medium text-blue-600">¥{stat.avgPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">总价</span>
                  <span className="font-bold text-orange-600">¥{stat.totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(stat.totalQuantity / maxTypeQty) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 按渠道统计 */}
        <div className="bg-white rounded-2xl p-6 shadow-md lg:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">按渠道统计</h3>
              <p className="text-sm text-gray-500">共 {channelStats.length} 个渠道</p>
            </div>
          </div>
          <div className="space-y-4">
            {channelStats.map((stat) => (
              <div key={stat.channel} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ChannelIcon channel={stat.channel} size={32} />
                    <div>
                      <p className="font-semibold text-gray-800">{stat.channel}</p>
                      <p className="text-xs text-gray-500">{stat.count} 次采购</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{stat.totalQuantity} 件</p>
                    <p className="text-sm text-orange-600 font-medium">¥{stat.totalPrice.toFixed(2)}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(stat.totalQuantity / maxChannelQty) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 按型号统计 */}
        <div className="bg-white rounded-2xl p-6 shadow-md lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">按型号统计</h3>
              <p className="text-sm text-gray-500">共 {modelStats.length} 种型号</p>
            </div>
          </div>
          <div className="space-y-3">
            {modelStats.map((stat) => (
              <div key={stat.model} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getSwitchIcon(stat.model)}</span>
                    <div>
                      <p className="font-medium text-gray-800">{stat.model}</p>
                      <p className="text-xs text-gray-500">均价 ¥{stat.avgPrice.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="font-bold text-gray-800">{stat.count}</p>
                      <p className="text-xs text-gray-500">采购次数</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-gray-800">{stat.totalQuantity}</p>
                      <p className="text-xs text-gray-500">总数量</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600">¥{stat.totalPrice.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">总价</p>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(stat.totalQuantity / maxModelQty) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 详细表格 */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">型号详细统计</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 rounded-tl-xl">型号</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">采购次数</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">总数量</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">均价</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">最高价</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">最低价</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 rounded-tr-xl">总价</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {modelStats.map((stat) => (
                <tr key={stat.model} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getSwitchIcon(stat.model)}</span>
                      <span className="font-medium text-gray-800">{stat.model}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{stat.count}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{stat.totalQuantity}</td>
                  <td className="px-4 py-3 text-right text-blue-600 font-medium">¥{stat.avgPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-red-500 font-medium">¥{stat.maxPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-green-600 font-medium">¥{stat.minPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-bold text-orange-600">¥{stat.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
