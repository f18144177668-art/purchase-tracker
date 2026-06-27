import { create } from 'zustand';
import { Purchase, PurchaseFormData, ModelStats, ChannelStats, TypeStats, PurchaseSummary } from '@/types';
import { getSwitchType } from '@/utils/modelUtils';
import { supabase } from '@/utils/supabase';

const TABLE_NAME = 'purchases';

interface PurchaseStore {
  purchases: Purchase[];
  loading: boolean;
  searchTerm: string;
  channelFilter: string;
  cloudStatus: 'connected' | 'disconnected' | 'checking';
  cloudError: string | null;
  lastSyncTime: string | null;
  loadPurchases: () => Promise<void>;
  addPurchase: (data: PurchaseFormData) => Promise<boolean>;
  updatePurchase: (id: string, data: PurchaseFormData) => Promise<boolean>;
  deletePurchase: (id: string) => Promise<boolean>;
  setSearchTerm: (term: string) => void;
  setChannelFilter: (channel: string) => void;
  getFilteredPurchases: () => Purchase[];
  getModelStats: () => ModelStats[];
  getChannelStats: () => ChannelStats[];
  getTypeStats: () => TypeStats[];
  getSummary: () => PurchaseSummary;
  refreshCloud: () => Promise<void>;
}

export const usePurchaseStore = create<PurchaseStore>((set, get) => ({
  purchases: [],
  loading: false,
  searchTerm: '',
  channelFilter: '',
  cloudStatus: 'checking',
  cloudError: null,
  lastSyncTime: null,

  loadPurchases: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Load purchases failed:', error);
        set({ cloudStatus: 'disconnected', cloudError: error.message || String(error), loading: false });
        return;
      }

      const normalizedData: Purchase[] = (data || []).map((item: Record<string, unknown>) => ({
        id: item.id as string,
        model: item.model as string,
        quantity: item.quantity as number,
        price: item.price as number,
        channel: item.channel as string,
        trackingNumber: item.tracking_number as string,
        antiCounterfeit: item.anti_counterfeit as string,
        orderNumber: item.order_number as string,
        createdAt: item.created_at as string,
        updatedAt: item.updated_at as string,
      }));

      set({
        purchases: normalizedData,
        cloudStatus: 'connected',
        lastSyncTime: new Date().toISOString(),
        loading: false,
      });
    } catch (error) {
      console.error('Load purchases error:', error);
      set({ cloudStatus: 'disconnected', cloudError: error instanceof Error ? error.message : String(error), loading: false });
    }
  },

  addPurchase: async (data) => {
    const newPurchaseDb = {
      id: crypto.randomUUID(),
      model: data.model,
      quantity: data.quantity,
      price: data.price,
      channel: data.channel,
      tracking_number: data.trackingNumber,
      anti_counterfeit: data.antiCounterfeit,
      order_number: data.orderNumber,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from(TABLE_NAME).insert(newPurchaseDb);

      if (error) {
        console.error('Add purchase failed:', error);
        return false;
      }

      const newPurchase: Purchase = {
        id: newPurchaseDb.id,
        model: newPurchaseDb.model,
        quantity: newPurchaseDb.quantity,
        price: newPurchaseDb.price,
        channel: newPurchaseDb.channel,
        trackingNumber: newPurchaseDb.tracking_number,
        antiCounterfeit: newPurchaseDb.anti_counterfeit,
        orderNumber: newPurchaseDb.order_number,
        createdAt: newPurchaseDb.created_at,
        updatedAt: newPurchaseDb.updated_at,
      };

      set((state) => ({ purchases: [newPurchase, ...state.purchases] }));
      return true;
    } catch (error) {
      console.error('Add purchase error:', error);
      return false;
    }
  },

  updatePurchase: async (id, data) => {
    const updatedPurchase = {
      model: data.model,
      quantity: data.quantity,
      price: data.price,
      channel: data.channel,
      tracking_number: data.trackingNumber,
      anti_counterfeit: data.antiCounterfeit,
      order_number: data.orderNumber,
      updated_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from(TABLE_NAME)
        .update(updatedPurchase)
        .eq('id', id);

      if (error) {
        console.error('Update purchase failed:', error);
        return false;
      }

      set((state) => ({
        purchases: state.purchases.map((p) =>
          p.id === id ? {
            ...p,
            model: data.model,
            quantity: data.quantity,
            price: data.price,
            channel: data.channel,
            trackingNumber: data.trackingNumber,
            antiCounterfeit: data.antiCounterfeit,
            orderNumber: data.orderNumber,
            updatedAt: new Date().toISOString(),
          } : p
        ),
      }));
      return true;
    } catch (error) {
      console.error('Update purchase error:', error);
      return false;
    }
  },

  deletePurchase: async (id) => {
    try {
      const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

      if (error) {
        console.error('Delete purchase failed:', error);
        return false;
      }

      set((state) => ({
        purchases: state.purchases.filter((p) => p.id !== id),
      }));
      return true;
    } catch (error) {
      console.error('Delete purchase error:', error);
      return false;
    }
  },

  setSearchTerm: (term) => {
    set({ searchTerm: term });
  },

  setChannelFilter: (channel) => {
    set({ channelFilter: channel });
  },

  getFilteredPurchases: () => {
    const { purchases, searchTerm, channelFilter } = get();
    return purchases.filter((p) => {
      const matchesSearch =
        searchTerm === '' ||
        p.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.antiCounterfeit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesChannel =
        channelFilter === '' || p.channel === channelFilter;
      return matchesSearch && matchesChannel;
    });
  },

  getModelStats: () => {
    const { purchases } = get();
    const stats: Record<string, ModelStats> = {};

    purchases.forEach((p) => {
      if (!stats[p.model]) {
        stats[p.model] = {
          model: p.model,
          totalQuantity: 0,
          totalPrice: 0,
          avgPrice: 0,
          maxPrice: 0,
          minPrice: Infinity,
          count: 0,
        };
      }
      stats[p.model].totalQuantity += p.quantity;
      stats[p.model].totalPrice += p.price * p.quantity;
      stats[p.model].count += 1;
      stats[p.model].maxPrice = Math.max(stats[p.model].maxPrice, p.price);
      stats[p.model].minPrice = Math.min(stats[p.model].minPrice, p.price);
    });

    Object.values(stats).forEach((stat) => {
      stat.avgPrice = stat.totalPrice / stat.totalQuantity;
      if (stat.minPrice === Infinity) stat.minPrice = 0;
    });

    return Object.values(stats).sort((a, b) => b.totalQuantity - a.totalQuantity);
  },

  getChannelStats: () => {
    const { purchases } = get();
    const stats: Record<string, ChannelStats> = {};

    purchases.forEach((p) => {
      if (!stats[p.channel]) {
        stats[p.channel] = {
          channel: p.channel,
          totalQuantity: 0,
          totalPrice: 0,
          count: 0,
        };
      }
      stats[p.channel].totalQuantity += p.quantity;
      stats[p.channel].totalPrice += p.price * p.quantity;
      stats[p.channel].count += 1;
    });

    return Object.values(stats).sort((a, b) => b.totalQuantity - a.totalQuantity);
  },

  getTypeStats: () => {
    const { purchases } = get();
    const stats: Record<string, TypeStats> = {};

    purchases.forEach((p) => {
      const type = getSwitchType(p.model);
      if (!stats[type]) {
        stats[type] = {
          type,
          totalQuantity: 0,
          totalPrice: 0,
          avgPrice: 0,
          count: 0,
        };
      }
      stats[type].totalQuantity += p.quantity;
      stats[type].totalPrice += p.price * p.quantity;
      stats[type].count += 1;
    });

    Object.values(stats).forEach((stat) => {
      stat.avgPrice = stat.totalPrice / stat.totalQuantity;
    });

    return Object.values(stats).sort((a, b) => b.totalQuantity - a.totalQuantity);
  },

  getSummary: () => {
    const { purchases } = get();
    return purchases.reduce(
      (acc, p) => ({
        totalQuantity: acc.totalQuantity + p.quantity,
        totalPrice: acc.totalPrice + p.price * p.quantity,
        totalCount: acc.totalCount + 1,
      }),
      { totalQuantity: 0, totalPrice: 0, totalCount: 0 }
    );
  },

  refreshCloud: async () => {
    set({ cloudError: null });
    await get().loadPurchases();
  },
}));
