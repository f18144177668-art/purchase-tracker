import { Home, PlusCircle, BarChart3 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isNativeApp } from '@/utils/platform';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // 桌面端不显示底部导航
  if (!isNativeApp()) {
    return null;
  }

  const navItems = [
    { path: '/', icon: Home, label: '记录' },
    { path: '/add', icon: PlusCircle, label: '添加' },
    { path: '/stats', icon: BarChart3, label: '统计' },
  ];

  return (
    <nav className="bg-white border-t border-gray-100 safe-area-bottom z-30 shrink-0">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const isAddButton = item.path === '/add';

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors active:scale-95 ${
                isActive ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              {isAddButton ? (
                <div className="w-12 h-12 -mt-4 bg-primary-600 rounded-full flex items-center justify-center shadow-md active:bg-primary-700">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              ) : (
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              )}
              <span className={`text-[11px] mt-1 ${isAddButton ? 'mt-0.5' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
