import { Home, PlusCircle, BarChart3 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: Home, label: '记录' },
    { path: '/add', icon: PlusCircle, label: '添加' },
    { path: '/stats', icon: BarChart3, label: '统计' },
  ];

  return (
    <nav
      className="shrink-0 z-30"
      style={{
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex justify-around items-center h-[60px]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const isAddButton = item.path === '/add';

          if (isAddButton) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center flex-1 h-full active:scale-90 transition-transform"
              >
                <div
                  className="w-[52px] h-[52px] -mt-6 rounded-[18px] flex items-center justify-center shadow-lg active:shadow-md transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    boxShadow: '0 8px 20px rgba(37,99,235,0.4)',
                  }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-[11px] mt-1.5 font-medium text-primary-600">{item.label}</span>
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center flex-1 h-full active:scale-95 transition-all"
            >
              <div
                className={`w-10 h-8 rounded-xl flex items-center justify-center mb-0.5 transition-all ${
                  isActive ? 'bg-primary-50' : ''
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-primary-600' : 'text-gray-400'
                  }`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
              </div>
              <span
                className={`text-[11px] font-medium transition-colors ${
                  isActive ? 'text-primary-600' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
