import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { openModal } from '@/redux/slices/modalSlice';
import { fetchDashboard } from '@/redux/slices/dashboardSlice';
import { fetchBanks } from '@/redux/slices/bankSlice';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import GlobalModalManager from '@/components/modals/GlobalModalManager';

export default function AppLayout() {
  const dispatch = useDispatch();
  const { isInitialized, token } = useSelector((s) => s.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  useEffect(() => {
    if (token && isInitialized) {
      dispatch(fetchDashboard());
      dispatch(fetchBanks());
    }
  }, [dispatch, token, isInitialized]);

  const handleOpenAddTx = () => {
    dispatch(openModal('addTransaction'));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar
        collapsed={!sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        mobileOpen={mobileSidebar}
        onMobileClose={() => setMobileSidebar(false)}
      />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          onMenuClick={() => setMobileSidebar(true)}
          onAddTransaction={handleOpenAddTx}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin relative z-10">
          <Outlet />
        </main>
      </div>

      {/* Floating action button - mobile */}
      <button
        onClick={handleOpenAddTx}
        className="fixed bottom-6 right-6 z-40 md:hidden w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-xl shadow-blue-500/30 flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-transform"
        title="Add transaction"
      >
        +
      </button>

      <GlobalModalManager />
    </div>
  );
}
