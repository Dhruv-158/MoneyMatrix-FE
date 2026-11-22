import { useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/redux/slices/authSlice';
import { toggleTheme } from '@/redux/slices/themeSlice';
import { Menu, Search, Bell, Plus, LogOut, User, Sun, Moon, X, AlertCircle, TrendingUp, CreditCard, Users } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveMediaUrl } from '@/utils/helpers';
import { useMoneyFormat } from '@/hooks/useMoneyFormat';

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
  '/assistant': 'AI Assistant',
  '/settings': 'Settings',
};

export default function Navbar({ onMenuClick, onAddTransaction }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { mode } = useSelector((s) => s.theme);
  const { items: transactions } = useSelector((s) => s.transactions);
  const { monthlyExpense, monthlyIncome, categoryExpenses } = useSelector((s) => s.dashboard);
  const { list: categories } = useSelector((s) => s.categories);
  const { formatMoney } = useMoneyFormat();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState([]);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const title = pageTitles[location.pathname] || 'MoneyMatrix';

  const dynamicNotifs = useMemo(() => {
    const notifList = [];

    const pendingFriendTx = (transactions || []).filter(
      (t) => t.friendDetails?.status === 'pending'
    );
    if (pendingFriendTx.length > 0) {
      const topFriend = pendingFriendTx[0];
      notifList.push({
        id: `friend-${topFriend._id}`,
        title: 'Pending Friend Settlement',
        message: `${topFriend.friendDetails.name} has a pending settlement of ${formatMoney(topFriend.amount)}.`,
        time: 'Active',
        type: 'friend',
        unread: true,
      });
    }

    if (monthlyExpense > 0 && monthlyIncome > 0) {
      const utilRate = Math.round((monthlyExpense / monthlyIncome) * 100);
      if (utilRate >= 70) {
        notifList.push({
          id: 'budget-high-utilization',
          title: 'High Budget Utilization',
          message: `Total spending is currently at ${utilRate}% of your monthly income limit.`,
          time: 'Live Pace',
          type: 'alert',
          unread: true,
        });
      }
    }

    if (categoryExpenses && categoryExpenses.length > 0) {
      const topCat = categoryExpenses[0];
      notifList.push({
        id: `cat-${topCat._id || topCat.name}`,
        title: 'Highest Spending Category',
        message: `Category "${topCat.name}" is your highest outflow group (${formatMoney(topCat.total)}).`,
        time: 'This Month',
        type: 'alert',
        unread: false,
      });
    }

    const recentLargeTx = (transactions || []).find((t) => t.amount >= 5000);
    if (recentLargeTx) {
      notifList.push({
        id: `tx-large-${recentLargeTx._id}`,
        title: 'High Value Transaction',
        message: `A transaction of ₹${recentLargeTx.amount} (${recentLargeTx.type}) was recently logged.`,
        time: 'Recent',
        type: 'bill',
        unread: false,
      });
    }

    return notifList.filter((n) => !dismissedIds.includes(n.id));
  }, [transactions, monthlyExpense, monthlyIncome, categoryExpenses, dismissedIds]);

  const unreadCount = dynamicNotifs.filter((n) => n.unread).length;

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="relative z-20 h-16 flex items-center justify-between px-4 md:px-6 border-b border-border bg-card/70 backdrop-blur-xl flex-shrink-0 transition-colors duration-300">
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
          aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {mode === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-600 transition-transform hover:-rotate-12" />
          )}
        </button>

        {/* Interactive Notifications Bell & Popover Center */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((prev) => !prev)}
            className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
            title="Notifications"
            aria-label="Open notifications"
            aria-expanded={notifOpen}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-card animate-pulse" />
            )}
          </button>

          {/* Notifications Popover Dropdown */}
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-border"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                        {unreadCount} Dynamic
                      </span>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <button
                      onClick={() => setDismissedIds(dynamicNotifs.map((n) => n.id))}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Dynamic Notification List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-border scrollbar-thin">
                  {dynamicNotifs.length > 0 ? (
                    dynamicNotifs.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3.5 flex items-start gap-3 transition hover:bg-slate-50 dark:hover:bg-slate-900/50 ${
                          n.unread ? 'bg-blue-500/5' : ''
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                          {n.type === 'alert' && <AlertCircle className="w-4 h-4 text-amber-500" />}
                          {n.type === 'bill' && <CreditCard className="w-4 h-4 text-rose-500" />}
                          {n.type === 'friend' && <Users className="w-4 h-4 text-emerald-500" />}
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{n.title}</h4>
                            <span className="text-[10px] text-slate-400 font-medium">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">{n.message}</p>
                        </div>

                        <button
                          onClick={() => setDismissedIds((prev) => [...prev, n.id])}
                          className="text-slate-400 hover:text-rose-500 transition p-1 cursor-pointer"
                          title="Dismiss"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 font-medium">
                      No notifications available right now. All budgets and settlements are up to date!
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition"
            title="Profile menu"
          >
            {user?.avatarUrl ? (
              <img
                src={resolveMediaUrl(user.avatarUrl)}
                alt=""
                className="w-8 h-8 rounded-full object-cover shadow-sm border border-border"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-extrabold shadow-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-white/5">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => dispatch(logout())}
                className="flex items-center gap-2.5 w-full px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition cursor-pointer"
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
