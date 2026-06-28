import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { usePurchaseStore } from '@/store/purchaseStore';
import { Header } from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import UpdateBanner from '@/components/UpdateBanner';
import { HomePage } from '@/pages/HomePage';
import { AddPage } from '@/pages/AddPage';
import { EditPage } from '@/pages/EditPage';
import { StatsPage } from '@/pages/StatsPage';
import { isNativeApp } from '@/utils/platform';
import { updateService } from '@/services/updateService';
import './index.css';

function AppContent() {
  const loadPurchases = usePurchaseStore((state) => state.loadPurchases);

  useEffect(() => {
    loadPurchases();

    if (isNativeApp()) {
      updateService.init();
    }
  }, [loadPurchases]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {isNativeApp() && <UpdateBanner />}
      <Header />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/add" element={<AddPage />} />
          <Route path="/edit/:id" element={<EditPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
