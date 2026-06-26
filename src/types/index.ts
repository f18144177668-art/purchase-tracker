export interface Purchase {
  id: string;
  model: string;
  quantity: number;
  price: number;
  channel: string;
  trackingNumber: string;
  antiCounterfeit: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseFormData {
  model: string;
  quantity: number;
  price: number;
  channel: string;
  trackingNumber: string;
  antiCounterfeit: string;
  orderNumber: string;
}

export interface ModelStats {
  model: string;
  totalQuantity: number;
  totalPrice: number;
  avgPrice: number;
  maxPrice: number;
  minPrice: number;
  count: number;
}

export interface ChannelStats {
  channel: string;
  totalQuantity: number;
  totalPrice: number;
  count: number;
}

export interface TypeStats {
  type: string;
  totalQuantity: number;
  totalPrice: number;
  avgPrice: number;
  count: number;
}

export interface PurchaseSummary {
  totalQuantity: number;
  totalPrice: number;
  totalCount: number;
}
