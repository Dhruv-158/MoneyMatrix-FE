import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '@/redux/slices/authSlice';
import { formatCurrency } from '@/utils/helpers';
import { SIDEBAR_SECTIONS } from '@/constants';
import {
  LayoutDashboard, ArrowLeftRight, Building2, Wallet, CalendarClock,
  RefreshCw, Tags, FileBarChart, TrendingUp, Settings, LogOut,
  ChevronLeft, ChevronRight, X
} from 'lucide-react';

const iconMap = {
  LayoutDashboard, ArrowLeftRight, Building2, Wallet, CalendarClock,
  RefreshCw, Tags, FileBarChart, TrendingUp, Settings,
};

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { totalBalance } = useSelector((s) => s.dashboard);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-lg">F</span>
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-bold text-white"
          >
            FinTrack
          </motion.span>
        )}
      </div>

      {/* Balance mini card */}
      {!collapsed && (
        <div className="mx-3 mt-4 p-3 rounded-xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/10">
          <p className="text-[11px] uppercase tracking-wider text-blue-300/70 font-medium">Total Balance</p>
          <p className="text-lg font-bold text-white mt-0.5">{formatCurrency(totalBalance)}</p>
        </div>
      )}

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto mt-4 px-2 scrollbar-thin">
        {SIDEBAR_SECTIONS.map((section) => (
          <div key={section.title} className="mb-4">
            {!collapsed && (
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
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
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group mb-0.5 ${
                      isActive
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute left-0 w-[3px] h-6 rounded-r-full bg-blue-400"
                        />
                      )}
                      {Icon && <Icon className="w-[18px] h-[18px] flex-shrink-0" />}
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
      <div className="border-t border-white/5 p-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
          title="Logout"
        >
          <LogOut className="w-[18px] h-[18px]" />
          {!collapsed && <span>Logout</span>}
        </button>

        {!collapsed && user && (
          <div className="flex items-center gap-3 mt-3 px-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
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
          className="absolute -right-3 top-7 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-slate-400 hover:text-white transition z-10"
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
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-[260px] glass-sidebar z-50 md:hidden"
            >
              <button
                onClick={onMobileClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
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
