import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Scan } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePurchaseStore } from '@/store/purchaseStore';
import { PurchaseFormData } from '@/types';
import { channels, brands, switchTypes } from '@/data/initialData';
import { ChannelIcon } from './ChannelIcon';
import { getSwitchIcon } from '@/utils/modelUtils';
import BarcodeScanner from './BarcodeScanner';
import AntiCounterfeitModal from './AntiCounterfeitModal';

interface ScanInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onScan: () => void;
  extraAction?: React.ReactNode;
}

function ScanInput({ label, name, value, onChange, onScan, extraAction }: ScanInputProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center gap-2">
          {extraAction}
          <button
            type="button"
            onClick={onScan}
            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium active:opacity-70"
          >
            <Scan className="w-3.5 h-3.5" />
            <span>扫码</span>
          </button>
        </div>
      </div>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={`输入${label}`}
        className="input text-sm"
      />
    </div>
  );
}

export function PurchaseForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const purchases = usePurchaseStore((state) => state.purchases);
  const addPurchase = usePurchaseStore((state) => state.addPurchase);
  const updatePurchase = usePurchaseStore((state) => state.updatePurchase);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<PurchaseFormData>({
    model: '',
    quantity: 1,
    price: 0,
    channel: '',
    trackingNumber: '',
    antiCounterfeit: '',
    orderNumber: '',
  });
  const [priceDisplay, setPriceDisplay] = useState('');

  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanningField, setScanningField] = useState<'trackingNumber' | 'antiCounterfeit' | 'orderNumber'>('trackingNumber');
  const [showAntiCounterfeitModal, setShowAntiCounterfeitModal] = useState(false);

  const isEditing = !!id;

  useEffect(() => {
    if (isEditing && id) {
      const purchase = purchases.find((p) => p.id === id);
      if (purchase) {
        setFormData({
          model: purchase.model,
          quantity: purchase.quantity,
          price: purchase.price,
          channel: purchase.channel,
          trackingNumber: purchase.trackingNumber,
          antiCounterfeit: purchase.antiCounterfeit,
          orderNumber: purchase.orderNumber,
        });
        setPriceDisplay(purchase.price.toFixed(2).replace(/\.?0+$/, ''));
        const parts = purchase.model.split(' ');
        if (parts.length >= 2) {
          const brand = parts[0];
          const type = parts.slice(1).join(' ');
          if (brands.includes(brand) && switchTypes.includes(type)) {
            setSelectedBrand(brand);
            setSelectedType(type);
          } else {
            setIsCustom(true);
            setCustomModel(purchase.model);
          }
        } else {
          setIsCustom(true);
          setCustomModel(purchase.model);
        }
      }
    }
  }, [isEditing, id, purchases]);

  useEffect(() => {
    if (!isCustom && selectedBrand && selectedType) {
      setFormData((prev) => ({ ...prev, model: `${selectedBrand} ${selectedType}` }));
    } else if (isCustom) {
      setFormData((prev) => ({ ...prev, model: customModel }));
    }
  }, [selectedBrand, selectedType, customModel, isCustom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.model.trim()) {
      alert('请选择或输入型号');
      return;
    }
    if (!formData.channel) {
      alert('请选择采购渠道');
      return;
    }
    if (formData.quantity <= 0 || !Number.isInteger(formData.quantity)) {
      alert('数量必须是大于0的整数');
      return;
    }
    if (formData.price < 0) {
      alert('价格不能为负数');
      return;
    }

    setSubmitting(true);

    let success = false;
    if (isEditing && id) {
      success = await updatePurchase(id, formData);
    } else {
      success = await addPurchase(formData);
    }

    setSubmitting(false);

    if (success) {
      navigate('/');
    } else {
      alert('保存失败，请检查网络连接后重试');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'price') {
      if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
        setPriceDisplay(value);
        setFormData((prev) => ({ ...prev, price: value === '' ? 0 : Number(value) }));
      }
    } else if (name === 'quantity') {
      if (value === '' || /^\d+$/.test(value)) {
        setFormData((prev) => ({ ...prev, quantity: value === '' ? 1 : Number(value) }));
      }
    } else if (name === 'antiCounterfeit') {
      const cleanValue = value.replace(/\s/g, '').toUpperCase();
      setFormData((prev) => ({ ...prev, [name]: cleanValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleScan = (field: 'trackingNumber' | 'antiCounterfeit' | 'orderNumber') => {
    setScanningField(field);
    setShowScanner(true);
  };

  const handleScanResult = (code: string) => {
    setFormData((prev) => ({
      ...prev,
      [scanningField]: code,
    }));
    setShowScanner(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-gray-900">
          {isEditing ? '编辑记录' : '添加记录'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="card p-4 space-y-5">
        {/* 型号选择 */}
        <div className="space-y-3">
          <label className="input-label">
            型号 <span className="text-danger-500">*</span>
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsCustom(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors active:scale-[0.98] ${
                !isCustom
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 active:bg-gray-200'
              }`}
            >
              选择型号
            </button>
            <button
              type="button"
              onClick={() => setIsCustom(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors active:scale-[0.98] ${
                isCustom
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 active:bg-gray-200'
              }`}
            >
              自定义
            </button>
          </div>

          {!isCustom ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">品牌</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="input py-2.5 text-sm"
                >
                  <option value="">选择品牌</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">类型</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="input py-2.5 text-sm"
                >
                  <option value="">选择类型</option>
                  {switchTypes.map((type) => (
                    <option key={type} value={type}>
                      {getSwitchIcon(type)} {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <input
              type="text"
              value={customModel}
              onChange={(e) => setCustomModel(e.target.value)}
              placeholder="输入完整型号名称"
              className="input text-sm"
            />
          )}

          {formData.model && (
            <div className="p-3 bg-primary-50 rounded-lg">
              <p className="text-sm text-gray-600">
                当前型号：<span className="font-semibold text-gray-900">{formData.model}</span>
              </p>
            </div>
          )}
        </div>

        {/* 渠道选择 */}
        <div className="space-y-3">
          <label className="input-label">
            渠道 <span className="text-danger-500">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {channels.map((channel) => (
              <button
                key={channel}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, channel }))}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-all active:scale-[0.98] ${
                  formData.channel === channel
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-white active:bg-gray-50'
                }`}
              >
                <ChannelIcon channel={channel} size={28} />
                <span className="text-xs font-medium text-gray-700">{channel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 数量和价格 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="input-label">
              数量 <span className="text-danger-500">*</span>
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              min="1"
              className="input text-sm"
            />
          </div>
          <div>
            <label className="input-label">
              单价 <span className="text-danger-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">¥</span>
              <input
                type="text"
                name="price"
                value={priceDisplay}
                onChange={handleInputChange}
                placeholder="0.00"
                className="input pl-8 text-sm"
              />
            </div>
          </div>
        </div>

        {/* 其他信息 */}
        <div className="space-y-4">
          <ScanInput
            label="快递单号"
            name="trackingNumber"
            value={formData.trackingNumber}
            onChange={handleInputChange}
            onScan={() => handleScan('trackingNumber')}
          />
          <ScanInput
            label="防伪码"
            name="antiCounterfeit"
            value={formData.antiCounterfeit}
            onChange={handleInputChange}
            onScan={() => handleScan('antiCounterfeit')}
            extraAction={
              formData.antiCounterfeit ? (
                <button
                  type="button"
                  onClick={() => setShowAntiCounterfeitModal(true)}
                  className="text-xs text-success-600 hover:text-success-700 font-medium"
                >
                  查询真伪
                </button>
              ) : null
            }
          />
          <ScanInput
            label="订单编号"
            name="orderNumber"
            value={formData.orderNumber}
            onChange={handleInputChange}
            onScan={() => handleScan('orderNumber')}
          />
        </div>

        {/* 小计 */}
        <div className="bg-warning-50 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">小计金额</span>
            <span className="text-xl font-bold text-warning-600">
              ¥{(formData.price * formData.quantity).toFixed(2)}
            </span>
          </div>
        </div>

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full text-sm active:scale-[0.98] disabled:opacity-50"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{submitting ? '保存中...' : isEditing ? '保存修改' : '保存记录'}</span>
        </button>
      </form>

      {showScanner && (
        <BarcodeScanner
          onScan={handleScanResult}
          onClose={() => setShowScanner(false)}
        />
      )}

      {showAntiCounterfeitModal && (
        <AntiCounterfeitModal
          antiCounterfeitCode={formData.antiCounterfeit}
          onClose={() => setShowAntiCounterfeitModal(false)}
        />
      )}
    </div>
  );
}
