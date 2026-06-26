import { useEffect, useState } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);

  useEffect(() => {
    loadPurchases();
    
    if (isNativeApp()) {
      setShowUpdateBanner(true);
      updateService.init();
    }
  }, [loadPurchases]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {showUpdateBanner && <UpdateBanner />}
      <Header />
      <main className={`${isMobile ? 'pt-4 pb-4' : 'pt-6 pb-6'}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/add" element={<AddPage />} />
          <Route path="/edit/:id" element={<EditPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </main>
      {isMobile && <BottomNav />}
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
