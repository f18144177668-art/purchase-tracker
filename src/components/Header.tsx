import { BarChart3, Home, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { isNativeApp } from '@/utils/platform';

export function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isStats = location.pathname === '/stats';
  const isAdd = location.pathname === '/add';

  // APP 端使用更紧凑的头部
  if (isNativeApp()) {
    return (
      <header className="bg-white border-b border-gray-100 safe-area-top z-20">
        <div className="flex items-center justify-between px-4 h-12">
          <h1 className="text-lg font-bold text-gray-900">采购记录</h1>
          <div className="flex items-center gap-1">
            <Link
              to="/stats"
              className={`p-2 rounded-lg transition-colors ${
                isStats ? 'bg-primary-50 text-primary-600' : 'text-gray-500'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
            </Link>
            <Link
              to="/add"
              className={`p-2 rounded-lg transition-colors ${
                isAdd ? 'bg-primary-50 text-primary-600' : 'text-gray-500'
              }`}
            >
              <Plus className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>
    );
  }

  // 桌面端保持原来的导航栏
  return (
    <header className="bg-primary-600 text-white shadow-md safe-area-top z-20">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Home className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold">采购记录管理</h1>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${
              isHome ? 'bg-white/20' : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>记录</span>
          </Link>
          <Link
            to="/stats"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${
              isStats ? 'bg-white/20' : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>统计</span>
          </Link>
          <Link
            to="/add"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              isAdd ? 'bg-warning-500' : 'bg-white text-primary-600 hover:bg-gray-100'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>添加</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
