import { Search, Filter } from 'lucide-react';
import { usePurchaseStore } from '@/store/purchaseStore';
import { channels } from '@/data/initialData';

export function SearchFilter() {
  const searchTerm = usePurchaseStore((state) => state.searchTerm);
  const channelFilter = usePurchaseStore((state) => state.channelFilter);
  const setSearchTerm = usePurchaseStore((state) => state.setSearchTerm);
  const setChannelFilter = usePurchaseStore((state) => state.setChannelFilter);

  return (
    <div className="bg-white rounded-xl p-4 shadow-md mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索型号、快递单号、防伪码或订单编号..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white"
          >
            <option value="">全部渠道</option>
            {channels.map((channel) => (
              <option key={channel} value={channel}>
                {channel}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
