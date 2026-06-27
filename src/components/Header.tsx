import { Plus, BarChart3, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isStats = location.pathname === '/stats';
  const isAdd = location.pathname === '/add';

  return (
    <header
      className="bg-primary-600 text-white shadow-lg"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-500 rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold">采购记录管理</h1>
          </Link>
          
          <nav className="hidden md:flex items-center gap-2">
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isHome
                  ? 'bg-white/20 text-white'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>记录</span>
            </Link>
            <Link
              to="/stats"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isStats
                  ? 'bg-white/20 text-white'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>统计</span>
            </Link>
            <Link
              to="/add"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isAdd
                  ? 'bg-accent-500 shadow-md'
                  : 'bg-accent-500 hover:bg-accent-600 shadow-md hover:shadow-lg'
              }`}
            >
              <Plus className="w-5 h-5" />
              <span>添加采购</span>
            </Link>
          </nav>

          <div className="md:hidden flex items-center gap-2">
            <Link
              to="/stats"
              className={`p-2 rounded-lg transition-all ${
                isStats ? 'bg-white/20' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <BarChart3 className="w-6 h-6" />
            </Link>
            <Link
              to="/add"
              className="p-2 bg-accent-500 rounded-lg"
            >
              <Plus className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
