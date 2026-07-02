import { Package, Wallet, FileText } from 'lucide-react';
import { usePurchaseStore } from '@/store/purchaseStore';

export function SummaryCards() {
  const summary = usePurchaseStore((state) => state.getSummary());

  const cards = [
    {
      label: '总数量',
      value: summary.totalQuantity,
      unit: '件',
      icon: Package,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
      shadow: 'rgba(99,102,241,0.35)',
    },
    {
      label: '总金额',
      value: `¥${summary.totalPrice.toFixed(0)}`,
      unit: '',
      icon: Wallet,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      shadow: 'rgba(245,158,11,0.35)',
    },
    {
      label: '记录数',
      value: summary.totalCount,
      unit: '条',
      icon: FileText,
      gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
      shadow: 'rgba(16,185,129,0.35)',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-2xl p-3.5 card-press"
            style={{
              background: card.gradient,
              boxShadow: `0 6px 16px ${card.shadow}`,
            }}
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center mb-2.5">
              <Icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-[11px] text-white/75 font-medium mb-0.5">{card.label}</p>
            <p className="text-lg font-bold text-white leading-tight truncate">
              {card.value}
              {card.unit && <span className="text-xs font-medium text-white/70 ml-0.5">{card.unit}</span>}
            </p>
          </div>
        );
      })}
    </div>
  );
}
