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
  Send, Mail, RefreshCw, Eye, EyeOff
} from 'lucide-react';
import toastService from '@/services/toastService';
import { resolveMediaUrl } from '@/utils/helpers';
import { testLlmConnection } from '@/services/aiClient';

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
  const [currencySymbol, setCurrencySymbol] = useState(user?.settings?.currencySymbol || '');
  const [language, setLanguage] = useState(user?.settings?.language || 'en');
  const [recoveryEmail, setRecoveryEmail] = useState(user?.settings?.recoveryEmail || '');
  const [reminderLeadDays, setReminderLeadDays] = useState(
    user?.settings?.reminderLeadDays ?? 3
  );
  const [quietHours, setQuietHours] = useState(
    user?.settings?.quietHours || {
      enabled: false,
      start: '22:00',
      end: '08:00',
      timezone: 'Asia/Kolkata',
    }
  );
  const [privacy, setPrivacy] = useState(
    user?.settings?.privacy || { maskBalances: false, hideFriendEmails: false }
  );
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [llmTesting, setLlmTesting] = useState(false);
  const DEFAULT_MODELS = {
    groq: 'llama-3.3-70b-versatile',
    gemini: 'gemini-2.0-flash',
    openai: 'gpt-4o-mini',
    grok: 'grok-2-latest',
    anthropic: 'claude-sonnet-4-5',
    huggingface: 'meta-llama/Llama-3.3-70B-Instruct',
    custom: '',
  };
  const HF_DEFAULT_BASE_URL = 'https://router.huggingface.co/v1';

  const [aiProvider, setAiProvider] = useState(user?.settings?.aiProvider || 'groq');
  const [aiApiKey, setAiApiKey] = useState('');
  const [aiModel, setAiModel] = useState(
    user?.settings?.aiModel || DEFAULT_MODELS[user?.settings?.aiProvider || 'groq'] || ''
  );
  const [aiBaseUrl, setAiBaseUrl] = useState(user?.settings?.aiBaseUrl || '');
  const [hasSavedAiKey, setHasSavedAiKey] = useState(
    Boolean(user?.settings?.hasAiApiKey || user?.settings?.aiApiKey)
  );
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });

  const needsBaseUrl = aiProvider === 'huggingface' || aiProvider === 'custom';

  const handleAiProviderChange = (nextProvider) => {
    setAiProvider(nextProvider);
    const nextDefault = DEFAULT_MODELS[nextProvider] || '';
    setAiModel((prev) => {
      const wasDefault = Object.values(DEFAULT_MODELS).includes(prev) || !prev;
      return wasDefault ? nextDefault : prev;
    });
    if (nextProvider === 'huggingface' && !aiBaseUrl.trim()) {
      setAiBaseUrl(HF_DEFAULT_BASE_URL);
    }
    if (nextProvider !== 'huggingface' && nextProvider !== 'custom') {
      setAiBaseUrl('');
    }
  };

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
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [telegramEmailSent, setTelegramEmailSent] = useState(false);
  const [telegramEmail, setTelegramEmail] = useState('');

  const handleGenerateTelegramCode = async () => {
    setTelegramLoading(true);
    try {
      const { data: res } = await authService.generateTelegramCode();
      setTelegramEmailSent(Boolean(res.data?.emailed || res.data?.emailSent));
      setTelegramEmail(res.data?.email || user?.email || '');
      toastService.success('Linking code sent to your email. Check your inbox to finish Telegram linking.');
    } catch (err) {
      toastService.error(err.errorMessage || 'Failed to generate Telegram code');
    } finally {
      setTelegramLoading(false);
    }
  };

  const handleSaveAiSettings = async () => {
    if (aiProvider === 'custom' && !aiBaseUrl.trim()) {
      toastService.error('Custom provider needs a Base URL (OpenAI-compatible endpoint).');
      return;
    }
    if (!aiModel.trim() && aiProvider === 'custom') {
      toastService.error('Custom provider needs a model name.');
      return;
    }
    const resolvedBaseUrl =
      aiProvider === 'huggingface'
        ? (aiBaseUrl.trim() || HF_DEFAULT_BASE_URL)
        : needsBaseUrl
          ? aiBaseUrl.trim()
          : '';
    const payload = {
      aiProvider,
      aiModel: aiModel.trim() || DEFAULT_MODELS[aiProvider] || '',
      aiBaseUrl: resolvedBaseUrl,
    };
    if (aiApiKey.trim()) {
      payload.aiApiKey = aiApiKey.trim();
    }
    await handleSettingsUpdate(payload);
    if (aiApiKey.trim()) {
      setHasSavedAiKey(true);
      setAiApiKey('');
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
      toastService.success(res.message || res.data?.message || 'Profile updated');
    } catch (err) {
      toastService.error(err.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const { data: res } = await authService.uploadAvatar(file);
      dispatch(updateUserProfile(res.data.user));
      toastService.success(res.message || 'Avatar updated');
    } catch (err) {
      toastService.error(err.errorMessage || 'Avatar upload failed');
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  const handleTestLlm = async () => {
    setLlmTesting(true);
    try {
      const result = await testLlmConnection(localStorage.getItem('token'));
      toastService.success(result?.message || 'LLM connection OK');
    } catch (err) {
      toastService.error(err.errorMessage || 'LLM test failed');
    } finally {
      setLlmTesting(false);
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
                <label className="relative cursor-pointer group">
                  {user?.avatarUrl ? (
                    <img
                      src={resolveMediaUrl(user.avatarUrl)}
                      alt=""
                      className="w-16 h-16 rounded-2xl object-cover shadow-lg border border-border"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={avatarUploading}
                  />
                  <span className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold text-white transition">
                    {avatarUploading ? '…' : 'Change'}
                  </span>
                </label>
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
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                    onChange={(e) => handleAiProviderChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    <option value="groq" className="bg-card text-foreground">Groq (Llama 3.3 70B)</option>
                    <option value="gemini" className="bg-card text-foreground">Google Gemini</option>
                    <option value="openai" className="bg-card text-foreground">OpenAI</option>
                    <option value="anthropic" className="bg-card text-foreground">Anthropic Claude</option>
                    <option value="grok" className="bg-card text-foreground">xAI Grok</option>
                    <option value="huggingface" className="bg-card text-foreground">HuggingFace</option>
                    <option value="custom" className="bg-card text-foreground">Custom (OpenAI-compatible)</option>
                  </select>
                  {aiProvider === 'custom' && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                      Works with any OpenAI-compatible chat API (OpenRouter, Ollama, Together, etc.).
                      Cursor IDE is not a chat API key — use a real provider endpoint.
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">
                    Model
                  </label>
                  <input
                    type="text"
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    placeholder={DEFAULT_MODELS[aiProvider] || 'model-id'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>

                {needsBaseUrl && (
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">
                      Base URL
                    </label>
                    <input
                      type="url"
                      value={aiBaseUrl}
                      onChange={(e) => setAiBaseUrl(e.target.value)}
                      placeholder={
                        aiProvider === 'huggingface'
                          ? HF_DEFAULT_BASE_URL
                          : 'https://api.example.com/v1'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={aiApiKey}
                    onChange={(e) => setAiApiKey(e.target.value)}
                    placeholder={
                      hasSavedAiKey
                        ? '•••• saved — enter a new key to replace'
                        : `Paste your ${aiProvider.toUpperCase()} API key here...`
                    }
                    autoComplete="off"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {hasSavedAiKey
                      ? 'A key is already saved. Leave blank to keep it, or paste a new key to replace.'
                      : 'Your key is stored in your profile. Leave blank on save to avoid overwriting later.'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleSaveAiSettings}
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
                  >
                    {loading ? 'Saving…' : 'Save AI Settings'}
                  </button>
                  <button
                    type="button"
                    onClick={handleTestLlm}
                    disabled={llmTesting}
                    className="px-5 py-2.5 rounded-xl border border-border text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
                  >
                    {llmTesting ? 'Testing…' : 'Test connection'}
                  </button>
                </div>
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

              <div className="pt-4 border-t border-border space-y-4 max-w-md">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Quiet hours (Telegram)</h4>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-slate-500">Pause proactive Telegram reminders overnight</p>
                  <button
                    type="button"
                    onClick={() => {
                      const next = { ...quietHours, enabled: !quietHours.enabled };
                      setQuietHours(next);
                      handleSettingsUpdate({ quietHours: next });
                    }}
                    className={`w-11 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                      quietHours.enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${quietHours.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Start</label>
                    <input
                      type="time"
                      value={quietHours.start || '22:00'}
                      onChange={(e) => setQuietHours({ ...quietHours, start: e.target.value })}
                      onBlur={() => handleSettingsUpdate({ quietHours })}
                      className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">End</label>
                    <input
                      type="time"
                      value={quietHours.end || '08:00'}
                      onChange={(e) => setQuietHours({ ...quietHours, end: e.target.value })}
                      onBlur={() => handleSettingsUpdate({ quietHours })}
                      className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-semibold"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Timezone</label>
                  <input
                    type="text"
                    value={quietHours.timezone || 'Asia/Kolkata'}
                    onChange={(e) => setQuietHours({ ...quietHours, timezone: e.target.value })}
                    onBlur={() => handleSettingsUpdate({ quietHours })}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-semibold"
                    placeholder="Asia/Kolkata"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">EMI / subscription reminder lead (days)</label>
                  <input
                    type="number"
                    min={0}
                    max={14}
                    value={reminderLeadDays}
                    onChange={(e) => setReminderLeadDays(Number(e.target.value))}
                    onBlur={() => handleSettingsUpdate({ reminderLeadDays })}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PREFERENCES SECTION */}
          {activeTab === 'preferences' && (
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Application Preferences</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Language, currency, and recovery contact.</p>
              </div>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Language</label>
                  <select
                    value={language}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLanguage(val);
                      handleSettingsUpdate({ language: val });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                  >
                    <option value="en" className="bg-card text-foreground">English</option>
                    <option value="hi" className="bg-card text-foreground">Hindi (hi-IN numbers/dates)</option>
                  </select>
                </div>
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
                    <option value="INR" className="bg-card text-foreground">INR — Indian Rupee</option>
                    <option value="USD" className="bg-card text-foreground">USD — US Dollar</option>
                    <option value="EUR" className="bg-card text-foreground">EUR — Euro</option>
                    <option value="GBP" className="bg-card text-foreground">GBP — British Pound</option>
                    <option value="AED" className="bg-card text-foreground">AED — UAE Dirham</option>
                    <option value="SGD" className="bg-card text-foreground">SGD — Singapore Dollar</option>
                    <option value="AUD" className="bg-card text-foreground">AUD — Australian Dollar</option>
                    <option value="JPY" className="bg-card text-foreground">JPY — Japanese Yen</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Custom symbol (optional)</label>
                  <input
                    type="text"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    onBlur={() => handleSettingsUpdate({ currencySymbol })}
                    placeholder="e.g. ₹ or Rs."
                    maxLength={6}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Recovery / backup email</label>
                  <input
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    onBlur={() => handleSettingsUpdate({ recoveryEmail })}
                    placeholder="backup@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Telegram linking codes are also CC’d here when set.</p>
                </div>
              </div>
            </div>
          )}

          {/* DATA MANAGEMENT */}
          {activeTab === 'data' && (
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Data Export & Privacy</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Export records and control what appears on screen.</p>
              </div>

              <div className="space-y-4 max-w-md">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Mask balances</p>
                      <p className="text-[11px] text-slate-500">Hide amounts on dashboard when tab is public</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = { ...privacy, maskBalances: !privacy.maskBalances };
                      setPrivacy(next);
                      handleSettingsUpdate({ privacy: next });
                    }}
                    className={`w-11 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                      privacy.maskBalances ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${privacy.maskBalances ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Hide friend emails</p>
                      <p className="text-[11px] text-slate-500">Omit friend emails in transaction UI/API</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = { ...privacy, hideFriendEmails: !privacy.hideFriendEmails };
                      setPrivacy(next);
                      handleSettingsUpdate({ privacy: next });
                    }}
                    className={`w-11 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                      privacy.hideFriendEmails ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${privacy.hideFriendEmails ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
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
                    downloadAnchor.setAttribute('download', `MoneyMatrix_Account_Data_${Date.now()}.json`);
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
                        Generate a one-time linking code. For security it is emailed only — it is not shown in the app.
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
                      <span>{telegramEmailSent ? 'Resend Code to Email' : 'Send Link Code to Email'}</span>
                    </button>
                  </div>

                  {telegramEmailSent && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-4"
                    >
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold w-fit">
                        <Mail className="w-4 h-4" />
                        <span>Code sent to {telegramEmail}</span>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">How to complete linking:</p>
                        <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-decimal list-inside font-medium">
                          <li>Open the email and copy the linking code.</li>
                          <li>Open <strong>Telegram</strong> on your phone or desktop.</li>
                          <li>Search for <strong className="text-blue-600 dark:text-blue-400">@moneymatrix_ai_bot</strong>.</li>
                          <li>Send: <code className="px-2 py-0.5 rounded bg-background border border-border font-mono font-bold text-blue-600 dark:text-blue-400">/start YOUR_CODE</code></li>
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
