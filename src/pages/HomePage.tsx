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
      <div className="page-container flex flex-col">
        <SummaryCards />
        <SearchFilter />
        <div className="card flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center mb-3">
            <Package className="w-7 h-7 text-primary-500 animate-pulse" />
          </div>
          <h3 className="text-base font-medium text-gray-800 mb-1">加载中...</h3>
          <p className="text-sm text-gray-500">正在从云端获取数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <SummaryCards />
      <SearchFilter />

      {purchases.length === 0 ? (
        <div className="card flex flex-col items-center justify-center p-10 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-base font-medium text-gray-800 mb-1">暂无采购记录</h3>
          <p className="text-sm text-gray-500">点击下方“添加”按钮开始记录</p>
        </div>
      ) : (
        <div className="space-y-3">
          {purchases.map((purchase) => (
            <PurchaseCard key={purchase.id} purchase={purchase} />
          ))}
        </div>
      )}
    </div>
  );
}
