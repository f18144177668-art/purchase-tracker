import { usePurchaseStore } from '@/store/purchaseStore';
import { SummaryCards } from '@/components/SummaryCards';
import { SearchFilter } from '@/components/SearchFilter';
import { PurchaseCard } from '@/components/PurchaseCard';
import { Package } from 'lucide-react';

export function HomePage() {
  const purchases = usePurchaseStore((state) => state.getFilteredPurchases());
  const loading = usePurchaseStore((state) => state.loading);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <SummaryCards />
        <SearchFilter />
        <div className="bg-white rounded-xl p-12 shadow-md text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-blue-500 animate-pulse" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">加载中...</h3>
          <p className="text-gray-500">正在从云端获取数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <SummaryCards />
      <SearchFilter />
      
      {purchases.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-md text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">暂无采购记录</h3>
          <p className="text-gray-500">点击右上角的"添加"按钮开始记录采购信息</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {purchases.map((purchase) => (
            <PurchaseCard key={purchase.id} purchase={purchase} />
          ))}
        </div>
      )}
    </div>
  );
}
