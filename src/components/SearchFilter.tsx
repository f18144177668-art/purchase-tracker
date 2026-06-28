import { Search, X } from 'lucide-react';
import { usePurchaseStore } from '@/store/purchaseStore';
import { channels } from '@/data/initialData';

export function SearchFilter() {
  const searchTerm = usePurchaseStore((state) => state.searchTerm);
  const channelFilter = usePurchaseStore((state) => state.channelFilter);
  const setSearchTerm = usePurchaseStore((state) => state.setSearchTerm);
  const setChannelFilter = usePurchaseStore((state) => state.setChannelFilter);

  return (
    <div className="mb-4 space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="搜索型号、单号、防伪码..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-9 pr-9 text-sm"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        <button
          onClick={() => setChannelFilter('')}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            channelFilter === ''
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 active:bg-gray-200'
          }`}
        >
          全部
        </button>
        {channels.map((channel) => (
          <button
            key={channel}
            onClick={() => setChannelFilter(channel)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              channelFilter === channel
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 active:bg-gray-50'
            }`}
          >
            {channel}
          </button>
        ))}
      </div>
    </div>
  );
}
