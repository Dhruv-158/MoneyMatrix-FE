import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { logout, updateUserProfile } from '@/redux/slices/authSlice';
import { setTheme } from '@/redux/slices/themeSlice';

// Components
import PageHeader from '@/components/dashboard/PageHeader';

// Icons & Utilities
import {
  User, ShieldCheck, Bell, Palette, Globe, Layers, ShieldAlert, Database,
  Search, LogOut, Key, Download, Check, Moon, Sun, 
  Send, Copy, Mail, RefreshCw} from 'lucide-react';
import toastService from '@/services/toastService';

import { authService, reportService } from '@/services/endpoints';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function Settings() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { mode } = useSelector((s) => s.theme);

  const [activeTab, setActiveTab] = useState('profile');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currency, setCurrency] = useState(user?.settings?.currency || 'INR');
  const [aiProvider, setAiProvider] = useState(user?.settings?.aiProvider || 'groq');
  const [aiApiKey, setAiApiKey] = useState(user?.settings?.aiApiKey || '');
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });

  // Notifications State
  const [notifications, setNotifications] = useState(
    user?.settings?.notifications || {
      transactions: true,
      budgetAlerts: true,
      billReminders: true,
      security: true,
    }
  );

  // Telegram Integration State
  const [telegramCode, setTelegramCode] = useState('');
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [telegramCopied, setTelegramCopied] = useState(false);
  const [telegramEmailSent, setTelegramEmailSent] = useState(false);
  const [telegramEmail, setTelegramEmail] = useState('');

  const handleGenerateTelegramCode = async () => {
    setTelegramLoading(true);
    setTelegramCopied(false);
    try {
      const { data: res } = await authService.generateTelegramCode();
      const code = res.data?.code;
      setTelegramCode(code);
      setTelegramEmailSent(res.data?.emailSent || false);
      setTelegramEmail(res.data?.email || user?.email || '');
      toastService.success(`Linking code generated! ${res.data?.emailSent ? 'Also sent to your email.' : ''}`);
    } catch (err) {
      toastService.error(err.errorMessage || 'Failed to generate Telegram code');
    } finally {
      setTelegramLoading(false);
    }
  };

  const navItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security & Auth', icon: ShieldCheck },
    { id: 'ai', label: 'AI & LLM Keys', icon: Key },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'integrations', label: 'Integrations', icon: Layers },
    { id: 'data', label: 'Data & Privacy', icon: Database },
    { id: 'danger', label: 'Account Controls', icon: ShieldAlert },
  ];

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: res } = await authService.updateProfile({ name, email });
      dispatch(updateUserProfile(res.data.user));
      toastService.success(res.data.message);
    } catch (err) {
      toastService.error(err.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = async (newSettings) => {
    try {
      const { data: res } = await authService.updateProfile({ settings: newSettings });
      dispatch(updateUserProfile(res.data.user));
      toastService.success(res.data.message);
    } catch (err) {
      toastService.error(err.errorMessage);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.next !== passwordForm.confirm) {
      return toastService.error('New passwords do not match');
    }
    setLoading(true);
    try {
      const { data: res } = await authService.updatePassword({
        currentPassword: passwordForm.current,
        newPassword: passwordForm.next,
      });
      toastService.success(res.data.message);
      setPasswordForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      toastService.error(err.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredNav = navItems.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 max-w-6xl">
      {/* 1. PAGE HEADER */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Account & Settings Center"
          subtitle="Manage your personal profile, security preferences, appearance, notification alerts, and data exports."
        />
      </motion.div>

      {/* 2. SETTINGS LAYOUT WITH SEARCH & SIDEBAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* SIDEBAR NAVIGATION */}
        <motion.div variants={itemVariants} className="md:col-span-1 space-y-4">
          {/* Settings Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search settings..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-card border border-border text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-sm"
            />
          </div>

          <div className="flex flex-col gap-1 p-1 bg-card border border-border rounded-2xl shadow-sm">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* MAIN SETTINGS CONTENT PANEL */}
        <motion.div variants={itemVariants} className="md:col-span-3 space-y-6">
          {/* PROFILE SECTION */}
          {activeTab === 'profile' && (
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{user?.name || 'User Profile'}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{user?.email || 'User Email'}</p>
                  <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Verified Account
                  </span>
                </div>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setHasChanges(true);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setHasChanges(true);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md shadow-blue-500/25 active:scale-95"
                  >
                    Save Profile Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SECURITY SECTION */}
          {activeTab === 'security' && (
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Security & Password</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Update your password and security credentials.</p>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.next}
                    onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md shadow-blue-500/25 active:scale-95"
                >
                  Update Password
                </button>
              </form>
            </div>
          )}

          {/* APPEARANCE SECTION */}
          {activeTab === 'appearance' && (
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Appearance & Theme</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Select your preferred application color theme.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => dispatch(setTheme('light'))}
                  className={`p-5 rounded-2xl border flex items-center justify-between transition cursor-pointer ${
                    mode === 'light'
                      ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'bg-background border-border text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sun className="w-5 h-5" />
                    <span className="text-xs font-bold">Light Mode</span>
                  </div>
                  {mode === 'light' && <Check className="w-4 h-4 text-blue-600" />}
                </button>

                <button
                  onClick={() => dispatch(setTheme('dark'))}
                  className={`p-5 rounded-2xl border flex items-center justify-between transition cursor-pointer ${
                    mode === 'dark'
                      ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'bg-background border-border text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Moon className="w-5 h-5" />
                    <span className="text-xs font-bold">Dark Mode</span>
                  </div>
                  {mode === 'dark' && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              </div>
            </div>
          )}

          {/* AI & LLM CONFIGURATION */}
          {activeTab === 'ai' && (
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">AI Assistant & LLM Keys</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Configure your personal LLM provider and paste your API key. It will be stored in your settings and used for all your AI chat & assistant tasks automatically.
                </p>
              </div>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">
                    AI LLM Provider
                  </label>
                  <select
                    value={aiProvider}
                    onChange={(e) => setAiProvider(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    <option value="groq" className="bg-card text-foreground">Groq (Llama 3.3 70B - Ultra Fast)</option>
                    <option value="gemini" className="bg-card text-foreground">Google Gemini (Gemini 2.0 Flash)</option>
                    <option value="openai" className="bg-card text-foreground">OpenAI (GPT-4o mini)</option>
                    <option value="grok" className="bg-card text-foreground">xAI Grok (Grok-2)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={aiApiKey}
                    onChange={(e) => setAiApiKey(e.target.value)}
                    placeholder={`Paste your ${aiProvider.toUpperCase()} API key here...`}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Your key is saved securely in your profile and never shared.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSettingsUpdate({ aiProvider, aiApiKey })}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
                >
                  Save AI Settings
                </button>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS SECTION */}
          {activeTab === 'notifications' && (
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Notification Preferences</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Choose what email and push alerts you receive.</p>
              </div>

              <div className="space-y-4">
                {Object.entries(notifications).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Receive alerts regarding {key.toLowerCase()} updates.</p>
                    </div>
                    <button
                      onClick={() => {
                        const updated = { ...notifications, [key]: !enabled };
                        setNotifications(updated);
                        handleSettingsUpdate({ notifications: updated });
                      }}
                      className={`w-11 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                        enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PREFERENCES SECTION */}
          {activeTab === 'preferences' && (
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Application Preferences</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Configure display currency and regional settings.</p>
              </div>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Display Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCurrency(val);
                      handleSettingsUpdate({ currency: val });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                  >
                    <option value="INR" className="bg-card text-foreground">₹ INR (Indian Rupee)</option>
                    <option value="USD" className="bg-card text-foreground">$ USD (US Dollar)</option>
                    <option value="EUR" className="bg-card text-foreground">€ EUR (Euro)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* DATA MANAGEMENT */}
          {activeTab === 'data' && (
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Data Export & Backup</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Download a complete JSON copy of your financial records.</p>
              </div>

              <button
                onClick={async () => {
                  try {
                    const { data: res } = await reportService.getMonthly();
                    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
                      JSON.stringify({ user, exportDate: new Date().toISOString(), reportData: res.data }, null, 2)
                    )}`;
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute('href', jsonString);
                    downloadAnchor.setAttribute('download', `FinTrack_Account_Data_${Date.now()}.json`);
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                    toastService.success('Account Data JSON exported successfully!');
                  } catch (err) {
                    toastService.error(err.errorMessage || 'Failed to generate export JSON');
                  }
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md shadow-blue-500/25 active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Account Data (JSON)</span>
              </button>
            </div>
          )}

          {/* DANGER ZONE / LOGOUT */}
          {activeTab === 'danger' && (
            <div className="p-6 rounded-2xl bg-card border border-rose-500/20 shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-rose-600 dark:text-rose-400">Account Controls & Danger Zone</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sign out or terminate account sessions.</p>
              </div>

              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => dispatch(logout())}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-500/20 transition active:scale-95 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Account</span>
                </button>

                <button
                  onClick={() => toastService.error('Account deletion feature disabled')}
                  className="px-5 py-2.5 rounded-xl border border-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-500/10 transition cursor-pointer"
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {/* INTEGRATIONS SECTION */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              {/* TELEGRAM BOT INTEGRATION CARD */}
              <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-6">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-sm">
                      <Send className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Telegram AI Assistant Bot</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          Active Integration
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        Log expenses, check balances, and receive budget alerts directly inside Telegram.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-background border border-border">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Account Linking Verification Code</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Generate a 6-digit code to link your FinTrack account. The code will be displayed here and sent to your email.
                      </p>
                    </div>
                    <button
                      onClick={handleGenerateTelegramCode}
                      disabled={telegramLoading}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md shadow-blue-500/25 active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {telegramLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Key className="w-4 h-4" />
                      )}
                      <span>{telegramCode ? 'Regenerate Code' : 'Generate Link Code & Send Email'}</span>
                    </button>
                  </div>

                  {/* DISPLAY GENERATED CODE & INSTRUCTIONS */}
                  {telegramCode && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Your 6-Digit Linking Code</span>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-2xl font-black tracking-[0.25em] text-blue-600 dark:text-blue-400 font-mono">
                              {telegramCode}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`/start ${telegramCode}`);
                                setTelegramCopied(true);
                                toastService.success('Command copied to clipboard!');
                                setTimeout(() => setTelegramCopied(false), 3000);
                              }}
                              className="p-1.5 rounded-lg bg-background border border-border text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                              title="Copy Telegram Command"
                            >
                              {telegramCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                          <Mail className="w-4 h-4" />
                          <span>Code sent to {telegramEmail}</span>
                        </div>
                      </div>

                      {/* INSTRUCTIONS */}
                      <div className="pt-3 border-t border-blue-500/10 space-y-2">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">How to complete linking:</p>
                        <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-decimal list-inside font-medium">
                          <li>Open <strong>Telegram</strong> on your phone or desktop.</li>
                          <li>Search for <strong className="text-blue-600 dark:text-blue-400">@moneymatrix_ai_bot</strong>.</li>
                          <li>Send the command: <code className="px-2 py-0.5 rounded bg-background border border-border font-mono font-bold text-blue-600 dark:text-blue-400">/start {telegramCode}</code></li>
                        </ol>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
