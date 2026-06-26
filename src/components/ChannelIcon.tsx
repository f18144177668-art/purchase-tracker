interface ChannelIconProps {
  channel: string;
  size?: number;
}

export function ChannelIcon({ channel, size = 20 }: ChannelIconProps) {
  const iconStyle = { width: size, height: size };

  switch (channel) {
    case '拼多多':
      return (
        <div
          style={iconStyle}
          className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xs"
        >
          拼
        </div>
      );
    case '淘宝':
      return (
        <div
          style={iconStyle}
          className="bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs"
        >
          淘
        </div>
      );
    case '京东':
      return (
        <div
          style={iconStyle}
          className="bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-xs"
        >
          京
        </div>
      );
    case '抖音':
      return (
        <div
          style={iconStyle}
          className="bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center text-white font-bold text-[10px]"
        >
          抖
        </div>
      );
    default:
      return (
        <div
          style={iconStyle}
          className="bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-xs"
        >
          ?
        </div>
      );
  }
}
