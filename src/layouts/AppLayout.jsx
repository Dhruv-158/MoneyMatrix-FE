import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import AddTransactionModal from '@/components/modals/AddTransactionModal';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [txModalOpen, setTxModalOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
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
          onAddTransaction={() => setTxModalOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
          <Outlet />
        </main>
      </div>

      {/* Floating action button - mobile */}
      <button
        onClick={() => setTxModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 md:hidden w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-lg shadow-blue-500/25 flex items-center justify-center text-2xl hover:scale-110 transition-transform"
        title="Add transaction"
      >
        +
      </button>

      <AddTransactionModal open={txModalOpen} onClose={() => setTxModalOpen(false)} />
    </div>
  );
}
