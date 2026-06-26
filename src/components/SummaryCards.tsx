import { Package, DollarSign, FileText } from 'lucide-react';
import { usePurchaseStore } from '@/store/purchaseStore';

export function SummaryCards() {
  const summary = usePurchaseStore((state) => state.getSummary());

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-primary-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">总数量</p>
            <p className="text-2xl font-bold text-gray-800">{summary.totalQuantity}</p>
          </div>
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <Package className="w-6 h-6 text-primary-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-accent-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">总金额</p>
            <p className="text-2xl font-bold text-gray-800">¥{summary.totalPrice.toFixed(2)}</p>
          </div>
          <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-accent-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">记录数</p>
            <p className="text-2xl font-bold text-gray-800">{summary.totalCount}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <FileText className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
