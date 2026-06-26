import { ModelStats, ChannelStats } from '@/types';

interface StatsChartProps {
  title: string;
  data: ModelStats[] | ChannelStats[];
}

export function StatsChart({ title, data }: StatsChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-md text-center">
        <p className="text-gray-500">暂无数据</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.totalQuantity));

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="space-y-4">
        {(data as Array<ModelStats | ChannelStats>).map((item) => {
          const name = 'model' in item ? item.model : item.channel;
          const percentage = (item.totalQuantity / maxValue) * 100;
          
          return (
            <div key={name}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">
                  {name}
                </span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-500">数量: {item.totalQuantity}</span>
                  <span className="text-accent-600 font-semibold">
                    ¥{item.totalPrice.toFixed(2)}
                  </span>
                  {'model' in item && (
                    <span className="text-gray-500">
                      均价: ¥{item.avgPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-primary-500 to-accent-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
