import { switchTypes } from '@/data/initialData';

export const getSwitchType = (model: string): string => {
  for (const type of switchTypes) {
    if (model.includes(type)) {
      return type;
    }
  }
  return '其他';
};

export const getBrand = (model: string): string => {
  const parts = model.split(' ');
  return parts[0] || model;
};

export const getSwitchIcon = (model: string): string => {
  const type = getSwitchType(model);
  const icons: Record<string, string> = {
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
  return icons[type] || '🔌';
};

export const getSwitchTypeColor = (model: string): string => {
  const type = getSwitchType(model);
  const colors: Record<string, string> = {
    '五孔': 'from-blue-400 to-blue-600',
    '斜五孔': 'from-blue-400 to-blue-600',
    '正五孔': 'from-blue-400 to-blue-600',
    '单开单控': 'from-emerald-400 to-emerald-600',
    '单开双控': 'from-emerald-400 to-emerald-600',
    '双开单控': 'from-purple-400 to-purple-600',
    '双开双控': 'from-purple-400 to-purple-600',
    '五孔带开关': 'from-amber-400 to-amber-600',
    '五孔明装插座': 'from-cyan-400 to-cyan-600',
    '16A空调插座': 'from-indigo-400 to-indigo-600',
    '网口插座': 'from-teal-400 to-teal-600',
  };
  return colors[type] || 'from-gray-400 to-gray-600';
};
