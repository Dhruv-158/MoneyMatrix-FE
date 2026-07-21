import { useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/redux/slices/authSlice';
import { Menu, Search, Bell, Plus, LogOut, User } from 'lucide-react';
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
    <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-white/5 bg-background/80 backdrop-blur-xl flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="md:hidden text-slate-400 hover:text-white" title="Menu">
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search - hidden on very small screens */}
        <div className="hidden sm:flex items-center gap-2 bg-card/50 rounded-lg px-3 py-2 border border-white/5">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-white placeholder-slate-500 outline-none w-40 lg:w-56"
          />
        </div>

        {/* Add transaction button */}
        <button
          onClick={onAddTransaction}
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
          title="Add transaction"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition" title="Notifications">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition"
            title="Profile menu"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-12 w-48 bg-card border border-white/10 rounded-xl shadow-2xl py-1 z-50">
              <div className="px-3 py-2 border-b border-white/5">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition">
                <User className="w-4 h-4" />
                Profile
              </button>
              <button
                onClick={() => dispatch(logout())}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/5 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
