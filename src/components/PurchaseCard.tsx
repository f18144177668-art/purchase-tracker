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
    <div className="card card-press overflow-hidden relative">
      {/* 左侧彩色装饰条 */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background: 'linear-gradient(180deg, #3b82f6 0%, #6366f1 100%)' }}
      />

      <div className="p-4 pl-5">
        {/* 顶部：图标 + 型号 + 操作 */}
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0"
            style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
            }}
          >
            {switchIcon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <div className="min-w-0">
                <h3 className="text-base font-bold text-gray-900 line-clamp-1">{purchase.model}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="badge badge-gray">{brand}</span>
                  <span className="badge badge-primary">{switchType}</span>
                </div>
              </div>
              <div className="flex items-center gap-0.5 shrink-0 -mr-1.5 -mt-0.5">
                <Link
                  to={`/edit/${purchase.id}`}
                  className="p-2 text-gray-300 hover:text-primary-500 rounded-xl transition-colors active:bg-primary-50"
                  title="编辑"
                >
                  <Edit2 className="w-4 h-4" />
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-2 text-gray-300 hover:text-danger-500 rounded-xl transition-colors disabled:opacity-50 active:bg-danger-50"
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
          </div>
        </div>

        {/* 中部：数量/单价/小计 */}
        <div
          className="flex items-center justify-between mt-3 px-3 py-2.5 rounded-xl"
          style={{ background: '#f8faff' }}
        >
          <div className="text-center">
            <p className="text-[11px] text-gray-400 mb-0.5">数量</p>
            <p className="text-sm font-bold text-gray-800">{purchase.quantity}<span className="text-[11px] font-normal text-gray-400 ml-0.5">件</span></p>
          </div>
          <div className="h-7 w-px bg-gray-200" />
          <div className="text-center">
            <p className="text-[11px] text-gray-400 mb-0.5">单价</p>
            <p className="text-sm font-bold text-primary-600">¥{purchase.price.toFixed(2)}</p>
          </div>
          <div className="h-7 w-px bg-gray-200" />
          <div className="text-center">
            <p className="text-[11px] text-gray-400 mb-0.5">小计</p>
            <p className="text-sm font-bold text-orange-500">¥{total.toFixed(2)}</p>
          </div>
        </div>

        {/* 底部：渠道 + 时间 */}
        <div className="flex items-center justify-between mt-2.5">
          <div className="flex items-center gap-1.5">
            <ChannelIcon channel={purchase.channel} size={15} />
            <span className="text-xs text-gray-500">{purchase.channel}</span>
          </div>
          <span className="text-[11px] text-gray-400">{formatDate(purchase.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
