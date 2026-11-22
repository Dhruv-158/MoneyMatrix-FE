import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '@/redux/slices/authSlice';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';
import { SIDEBAR_SECTIONS } from '@/constants';
import {
  LayoutDashboard, ArrowLeftRight, Building2, Wallet, CalendarClock,
  RefreshCw, Tags, FileBarChart, TrendingUp, Settings, LogOut,
  ChevronLeft, ChevronRight, X, Bot
} from 'lucide-react';

const iconMap = {
  LayoutDashboard, ArrowLeftRight, Building2, Wallet, CalendarClock,
  RefreshCw, Tags, FileBarChart, TrendingUp, Settings, Bot,
};

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { totalBalance } = useSelector((s) => s.dashboard);
  const { formatMoney } = useMoneyFormat();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20 border border-blue-500/20 bg-slate-900">
          <img src="/logo.png" alt="MoneyMatrix Logo" className="w-full h-full object-cover" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col"
          >
            <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              MoneyMatrix
            </span>
            <span className="text-[10px] font-bold text-blue-500 tracking-widest uppercase">
              Financial Suite
            </span>
          </motion.div>
        )}
      </div>

      {/* Balance mini card */}
      {!collapsed && (
        <div className="mx-3 mt-4 p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-sm">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Total Balance</p>
          <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{formatMoney(totalBalance)}</p>
        </div>
      )}

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto mt-4 px-3 scrollbar-thin space-y-4">
        {SIDEBAR_SECTIONS.map((section) => (
          <div key={section.title} className="mb-2">
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const Icon = iconMap[item.icon];
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onMobileClose}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group mb-1 ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute left-0 w-[3px] h-5 rounded-r-full bg-blue-600 dark:bg-blue-400"
                        />
                      )}
                      {Icon && <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />}
                      {!collapsed && <span>{item.label}</span>}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-border p-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Sign Out</span>}
        </button>

        {!collapsed && user && (
          <div className="flex items-center gap-3 mt-2 px-3 py-1">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-[11px] font-black">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.2 }}
        className="hidden md:flex flex-col h-full glass-sidebar relative flex-shrink-0"
      >
        {sidebarContent}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-7 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-md transition z-10"
          title="Toggle sidebar"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-[260px] glass-sidebar z-50 md:hidden shadow-2xl"
            >
              <button
                onClick={onMobileClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"
                title="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
