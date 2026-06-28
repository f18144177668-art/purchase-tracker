import { Package, Wallet, FileText } from 'lucide-react';
import { usePurchaseStore } from '@/store/purchaseStore';

export function SummaryCards() {
  const summary = usePurchaseStore((state) => state.getSummary());

  const cards = [
    {
      label: '总数量',
      value: summary.totalQuantity,
      icon: Package,
      color: 'primary' as const,
    },
    {
      label: '总金额',
      value: `¥${summary.totalPrice.toFixed(2)}`,
      icon: Wallet,
      color: 'warning' as const,
    },
    {
      label: '记录数',
      value: summary.totalCount,
      icon: FileText,
      color: 'success' as const,
    },
  ];

  const colorStyles = {
    primary: 'bg-primary-50 text-primary-600',
    warning: 'bg-warning-50 text-warning-600',
    success: 'bg-success-50 text-success-600',
  };

  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="card p-3 card-press">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${colorStyles[card.color]}`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-xs text-gray-500 mb-0.5">{card.label}</p>
            <p className="text-base font-bold text-gray-900 truncate">{card.value}</p>
          </div>
        );
      })}
    </div>
  );
}
