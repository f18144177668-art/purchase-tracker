import { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePurchaseStore } from '@/store/purchaseStore';
import { Purchase } from '@/types';
import { ChannelIcon } from './ChannelIcon';
import { getSwitchIcon, getSwitchType, getBrand } from '@/utils/modelUtils';

interface PurchaseCardProps {
  purchase: Purchase;
}

export function PurchaseCard({ purchase }: PurchaseCardProps) {
  const deletePurchase = usePurchaseStore((state) => state.deletePurchase);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`确定删除型号 "${purchase.model}" 的记录吗？`)) {
      setDeleting(true);
      await deletePurchase(purchase.id);
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const switchType = getSwitchType(purchase.model);
  const brand = getBrand(purchase.model);
  const switchIcon = getSwitchIcon(purchase.model);
  const total = purchase.price * purchase.quantity;

  return (
    <div className="card p-4 card-press">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 bg-primary-600 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-sm">
          {switchIcon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-gray-900 line-clamp-1">{purchase.model}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="badge badge-gray">{brand}</span>
                <span className="badge badge-primary">{switchType}</span>
              </div>
            </div>
            <div className="flex items-center gap-0.5 shrink-0 -mr-1">
              <Link
                to={`/edit/${purchase.id}`}
                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="编辑"
              >
                <Edit2 className="w-4 h-4" />
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors disabled:opacity-50"
                title="删除"
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 border-danger-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-baseline gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">数量</p>
                <p className="text-sm font-bold text-gray-900">{purchase.quantity}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">单价</p>
                <p className="text-sm font-bold text-primary-600">¥{purchase.price.toFixed(2)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-0.5">小计</p>
              <p className="text-lg font-bold text-warning-600">¥{total.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <ChannelIcon channel={purchase.channel} size={16} />
              <span className="text-xs text-gray-600">{purchase.channel}</span>
            </div>
            <span className="text-xs text-gray-400">{formatDate(purchase.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
