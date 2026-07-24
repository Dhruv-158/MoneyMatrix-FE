import { useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/redux/slices/authSlice';
import { toggleTheme } from '@/redux/slices/themeSlice';
import { Menu, Search, Bell, Plus, LogOut, User, Sun, Moon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/banks': 'Banks',
  '/cash-wallet': 'Cash Wallet',
  '/emis': 'EMIs',
  '/subscriptions': 'Subscriptions',
  '/categories': 'Categories',
  '/reports': 'Reports',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

export default function Navbar({ onMenuClick, onAddTransaction }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { mode } = useSelector((s) => s.theme);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const title = pageTitles[location.pathname] || 'FinTrack';

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="relative z-30 h-16 flex items-center justify-between px-4 md:px-6 border-b border-border bg-card/70 backdrop-blur-xl flex-shrink-0 transition-colors duration-300">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden text-slate-500 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg"
          title="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{title}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden sm:flex items-center gap-2.5 bg-slate-100 dark:bg-slate-900/80 rounded-xl px-3.5 py-2 border border-slate-200 dark:border-white/10 transition-all focus-within:ring-2 focus-within:ring-blue-500/40">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search transactions, banks..."
            className="bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none w-40 lg:w-60 font-medium"
          />
        </div>

        {/* Add Transaction */}
        <button
          onClick={onAddTransaction}
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95"
          title="Add transaction"
        >
          <Plus className="w-4 h-4" />
          <span>Add Transaction</span>
        </button>

        {/* Theme Toggle (Light / Dark Mode) */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
          title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {mode === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-600 transition-transform hover:-rotate-12" />
          )}
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition"
            title="Profile menu"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-extrabold shadow-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-white/5">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
              </div>
              <button className="flex items-center gap-2.5 w-full px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition">
                <User className="w-4 h-4 text-blue-500" />
                Profile & Settings
              </button>
              <button
                onClick={() => dispatch(logout())}
                className="flex items-center gap-2.5 w-full px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
