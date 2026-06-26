import { Purchase } from '@/types';

export const initialPurchases: Purchase[] = [
  {
    id: '1',
    model: '公牛 16A空调插座',
    quantity: 1,
    price: 6.66,
    channel: '拼多多',
    trackingNumber: 'JT5473372128273',
    antiCounterfeit: 'KNMK5LLC1009113',
    orderNumber: '063470313020045',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    model: '公牛 16A空调插座',
    quantity: 1,
    price: 6.57,
    channel: '拼多多',
    trackingNumber: 'JT5473372012448',
    antiCounterfeit: 'KNMK5AMM7009116',
    orderNumber: '311573880380045',
    createdAt: '2024-01-16T14:20:00Z',
    updatedAt: '2024-01-16T14:20:00Z',
  },
  {
    id: '3',
    model: '公牛 16A空调插座',
    quantity: 1,
    price: 0.01,
    channel: '抖音',
    trackingNumber: 'JT2178888825427',
    antiCounterfeit: 'UX0KFJLCX009122',
    orderNumber: '6951842586412324639',
    createdAt: '2024-01-17T09:15:00Z',
    updatedAt: '2024-01-17T09:15:00Z',
  },
  {
    id: '4',
    model: '公牛 单开单控',
    quantity: 1,
    price: 2.64,
    channel: '淘宝',
    trackingNumber: 'JT3158629648590',
    antiCounterfeit: 'PLRYTG26Q003071',
    orderNumber: '4502245176117020344',
    createdAt: '2024-01-18T16:45:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
  },
  {
    id: '5',
    model: '公牛 单开单控',
    quantity: 1,
    price: 5.08,
    channel: '京东',
    trackingNumber: 'JT4005877391320',
    antiCounterfeit: 'BVG46TDFH003010',
    orderNumber: '3460263013270796',
    createdAt: '2024-01-19T11:00:00Z',
    updatedAt: '2024-01-19T11:00:00Z',
  },
  {
    id: '6',
    model: '公牛 单开单控',
    quantity: 1,
    price: 3.47,
    channel: '淘宝',
    trackingNumber: '773414633962723',
    antiCounterfeit: 'HY6718DY6001298',
    orderNumber: '2701827553132058164',
    createdAt: '2024-01-20T08:30:00Z',
    updatedAt: '2024-01-20T08:30:00Z',
  },
  {
    id: '7',
    model: '公牛 斜五孔',
    quantity: 1,
    price: 6.00,
    channel: '抖音',
    trackingNumber: 'JT2178409332659',
    antiCounterfeit: 'EU86A3MR7008634',
    orderNumber: '6951790597508962079',
    createdAt: '2024-01-21T13:20:00Z',
    updatedAt: '2024-01-21T13:20:00Z',
  },
  {
    id: '8',
    model: '公牛 斜五孔',
    quantity: 1,
    price: 5.49,
    channel: '淘宝',
    trackingNumber: '773414206372547',
    antiCounterfeit: 'QAUHH9HE4003428',
    orderNumber: '4502250468032020344',
    createdAt: '2024-01-22T15:10:00Z',
    updatedAt: '2024-01-22T15:10:00Z',
  },
];

export const channels = ['拼多多', '淘宝', '京东', '抖音'];

export const switchTypes = [
  '斜五孔',
  '正五孔',
  '单开单控',
  '单开双控',
  '双开单控',
  '双开双控',
  '五孔带开关',
  '五孔明装插座',
  '16A空调插座',
  '网口插座',
];

export const brands = ['西门子', '公牛'];

export const generateModelNames = (): string[] => {
  const models: string[] = [];
  brands.forEach((brand) => {
    switchTypes.forEach((type) => {
      models.push(`${brand} ${type}`);
    });
  });
  return models;
};

export const channelConfig: Record<string, { color: string; bgColor: string; iconColor: string }> = {
  '拼多多': {
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    iconColor: 'text-orange-500',
  },
  '淘宝': {
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    iconColor: 'text-orange-500',
  },
  '京东': {
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    iconColor: 'text-red-500',
  },
  '抖音': {
    color: 'text-gray-900',
    bgColor: 'bg-gray-900',
    iconColor: 'text-white',
  },
};

export const switchTypeIcons: Record<string, string> = {
  '五孔': '🔌',
  '斜五孔': '🔌',
  '正五孔': '🔌',
  '单开单控': '🔘',
  '单开双控': '🔘',
  '双开单控': '🎛️',
  '双开双控': '🎛️',
  '五孔带开关': '💡',
  '五孔明装插座': '⚡',
  '16A空调插座': '❄️',
  '网口插座': '🌐',
};
