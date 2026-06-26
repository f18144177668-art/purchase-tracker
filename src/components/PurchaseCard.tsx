import { useState } from 'react';
import { Edit2, Trash2, Truck, Shield, FileText } from 'lucide-react';
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
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const switchType = getSwitchType(purchase.model);
  const brand = getBrand(purchase.model);
  const switchIcon = getSwitchIcon(purchase.model);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
            {switchIcon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{purchase.model}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {brand}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {switchType}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Link
            to={`/edit/${purchase.id}`}
            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            title="编辑"
          >
            <Edit2 className="w-5 h-5" />
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
            title="删除"
          >
            {deleting ? (
              <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">数量</p>
          <p className="text-xl font-bold text-gray-800">{purchase.quantity}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center">
          <p className="text-xs text-blue-600 mb-1">单价</p>
          <p className="text-xl font-bold text-blue-700">¥{purchase.price.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 text-center">
          <p className="text-xs text-orange-600 mb-1">小计</p>
          <p className="text-xl font-bold text-orange-600">¥{(purchase.price * purchase.quantity).toFixed(2)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <ChannelIcon channel={purchase.channel} size={24} />
        <span className="text-sm font-medium text-gray-700">{purchase.channel}</span>
      </div>

      <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
        {purchase.trackingNumber && (
          <div className="flex items-center gap-2 text-gray-600">
            <Truck className="w-4 h-4 text-primary-500 flex-shrink-0" />
            <span className="truncate font-mono text-xs">{purchase.trackingNumber}</span>
          </div>
        )}
        {purchase.antiCounterfeit && (
          <div className="flex items-center gap-2 text-gray-600">
            <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="truncate font-mono text-xs">{purchase.antiCounterfeit}</span>
          </div>
        )}
        {purchase.orderNumber && (
          <div className="flex items-center gap-2 text-gray-600">
            <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="truncate font-mono text-xs">{purchase.orderNumber}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <p className="text-xs text-gray-400">{formatDate(purchase.createdAt)}</p>
      </div>
    </div>
  );
}
