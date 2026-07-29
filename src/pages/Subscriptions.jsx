import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  fetchSubscriptions, createSubscription, updateSubscription, deleteSubscription, toggleSubscriptionStatus
} from '@/redux/slices/subscriptionSlice';
import { fetchBanks } from '@/redux/slices/bankSlice';

// Components
import PageHeader from '@/components/dashboard/PageHeader';
import StatCard from '@/components/cards/StatCard';
import SubscriptionOverview from '@/components/subscriptions/SubscriptionOverview';
import InsightCard from '@/components/dashboard/InsightCard';
import ActivityTimeline from '@/components/dashboard/ActivityTimeline';
import SubscriptionSkeleton from '@/components/subscriptions/SubscriptionSkeleton';
import EmptyState from '@/components/ui/EmptyState';

// Icons & Utilities
import { formatCurrency, formatDate } from '@/utils/helpers';
import {
  RefreshCw, Plus, Pencil, Trash2, X, CheckCircle2, ShieldAlert, Sparkles,
  CalendarClock, CreditCard, Building2, LayoutGrid, List, ShieldCheck
} from 'lucide-react';
import toastService from '@/services/toastService';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function Subscriptions() {
  const dispatch = useDispatch();
  const { list: subs, loading } = useSelector((s) => s.subscriptions);
  const { list: banks } = useSelector((s) => s.banks);
  const { isInitialized } = useSelector((s) => s.auth);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [form, setForm] = useState({
    title: '',
    amount: '',
    frequency: 'monthly',
    startDate: '',
    nextDueDate: '',
    paymentMethod: 'bank',
    bankId: '',
    note: '',
  });

  useEffect(() => {
    if (isInitialized) {
      dispatch(fetchSubscriptions());
      dispatch(fetchBanks());
    }
  }, [dispatch, isInitialized]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editing) {
        await dispatch(updateSubscription({ id: editing._id, ...payload })).unwrap();
        toastService.success('Subscription updated');
      } else {
        await dispatch(createSubscription(payload)).unwrap();
        toastService.success('Subscription created');
      }
      setModalOpen(false);
      setEditing(null);
    } catch (err) {
      toastService.error(err || 'Failed to save subscription');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return;
    try {
      await dispatch(deleteSubscription(id)).unwrap();
      toastService.success('Subscription deleted');
    } catch (err) {
      toastService.error(err || 'Failed to delete subscription');
    }
  };

  const handleToggle = async (sub) => {
    try {
      await dispatch(toggleSubscriptionStatus({ id: sub._id, isActive: !sub.isActive })).unwrap();
      toastService.success(`Subscription marked as ${!sub.isActive ? 'Active' : 'Inactive'}`);
    } catch (err) {
      toastService.error(err || 'Failed to toggle status');
    }
  };

  // Dynamic Financial Calculations from real Redux state
  const activeSubs = subs.filter((s) => s.isActive);
  const inactiveSubs = subs.filter((s) => !s.isActive);

  const monthlyTotal = activeSubs.reduce((sum, s) => {
    if (s.frequency === 'yearly') return sum + (s.amount || 0) / 12;
    if (s.frequency === 'weekly') return sum + (s.amount || 0) * 4.33;
    return sum + (s.amount || 0);
  }, 0);

  const annualTotal = monthlyTotal * 12;
  const avgMonthlyCost = activeSubs.length > 0 ? monthlyTotal / activeSubs.length : 0;

  // Timeline activities
  const activityList = subs.slice(0, 5).map((s) => ({
    id: s._id,
    title: s.isActive ? 'Subscription Active' : 'Subscription Paused',
    description: `${s.title} (${formatCurrency(s.amount)}) • Next renewal: ${formatDate(s.nextDueDate)}`,
    timestamp: s.nextDueDate || new Date().toISOString(),
    dotColor: s.isActive ? 'bg-purple-500' : 'bg-slate-500',
  }));

  const ic =
    'w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-sm';

  if (loading && !subs.length) {
    return <SubscriptionSkeleton />;
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      {/* 1. PAGE HEADER */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Subscription Management"
          subtitle="Manage recurring services, monitor subscription costs, and stay informed about upcoming renewals."
          onAddTransaction={() => {
            setEditing(null);
            setForm({
              title: '',
              amount: '',
              frequency: 'monthly',
              startDate: '',
              nextDueDate: '',
              paymentMethod: 'bank',
              bankId: '',
              note: '',
            });
            setModalOpen(true);
          }}
          onExport={() => toast.success('Subscription plan exported')}
        />
      </motion.div>

      {/* 2. SUBSCRIPTION OVERVIEW HERO */}
      <motion.div variants={itemVariants}>
        <SubscriptionOverview
          monthlyTotal={monthlyTotal}
          annualTotal={annualTotal}
          activeCount={activeSubs.length}
          avgMonthly={avgMonthlyCost}
        />
      </motion.div>

      {/* 3. SUMMARY KPI CARDS */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Recurring Cost"
          value={monthlyTotal}
          icon={RefreshCw}
          color="purple"
          subtitle="Total monthly commitment"
        />
        <StatCard
          title="Annualized Spending"
          value={annualTotal}
          icon={CreditCard}
          color="blue"
          subtitle="Total estimated yearly cost"
        />
        <StatCard
          title="Active Subscriptions"
          value={activeSubs.length}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Active paid subscriptions"
        />
        <StatCard
          title="Paused / Inactive"
          value={inactiveSubs.length}
          icon={ShieldAlert}
          color="rose"
          subtitle="Cancelled or paused services"
        />
      </motion.div>

      {/* 4. FINANCIAL INSIGHTS */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InsightCard
          icon={Sparkles}
          headline="Monthly Pacing"
          explanation={`Your total active monthly recurring cost is ${formatCurrency(monthlyTotal)}. Maintaining an organized view prevents unwanted auto-renewals.`}
          color="purple"
        />
        <InsightCard
          icon={ShieldCheck}
          headline="Active Services"
          explanation={`You have ${activeSubs.length} active service(s) configured. Average monthly cost per service is ${formatCurrency(avgMonthlyCost)}.`}
          color="emerald"
        />
      </motion.div>

      {/* 5. SUBSCRIPTION WORKSPACE GRID & TABLE */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active & Recurring Services ({subs.length})
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 border border-border rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'grid'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'table'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
            </div>

            <button
              onClick={() => {
                setEditing(null);
                setForm({
                  title: '',
                  amount: '',
                  frequency: 'monthly',
                  startDate: '',
                  nextDueDate: '',
                  paymentMethod: 'bank',
                  bankId: '',
                  note: '',
                });
                setModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Subscription
            </button>
          </div>
        </div>

        {subs.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subs.map((sub) => (
                <div
                  key={sub._id}
                  className="p-5 rounded-2xl bg-card border border-border hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                          sub.isActive
                            ? 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400'
                            : 'bg-slate-500/10 border-slate-500/20 text-slate-500'
                        }`}
                      >
                        <RefreshCw className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{sub.title}</h4>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium capitalize">
                          {sub.frequency} • {sub.paymentMethod === 'bank' ? 'Bank Account' : 'Cash Wallet'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditing(sub);
                          setForm({
                            title: sub.title,
                            amount: sub.amount,
                            frequency: sub.frequency,
                            startDate: sub.startDate?.split('T')[0] || '',
                            nextDueDate: sub.nextDueDate?.split('T')[0] || '',
                            paymentMethod: sub.paymentMethod,
                            bankId: sub.bankId || '',
                            note: sub.note || '',
                          });
                          setModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Edit Subscription"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(sub._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete Subscription"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Renewal Amount</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">{formatCurrency(sub.amount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Next Renewal</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{formatDate(sub.nextDueDate)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Status</span>
                      <button
                        onClick={() => handleToggle(sub)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                          sub.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                        }`}
                      >
                        {sub.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card overflow-hidden border border-border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-slate-50/50 dark:bg-slate-900/50 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                      <th className="px-5 py-3.5">Service Name</th>
                      <th className="px-5 py-3.5">Frequency</th>
                      <th className="px-5 py-3.5">Next Renewal</th>
                      <th className="px-5 py-3.5">Payment Method</th>
                      <th className="px-5 py-3.5 text-right">Amount</th>
                      <th className="px-5 py-3.5 text-center">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {subs.map((sub) => {
                      const linkedBank = banks.find((b) => b._id === sub.bankId);
                      return (
                        <tr key={sub._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                          <td className="px-5 py-4 text-xs font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                                  sub.isActive
                                    ? 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400'
                                    : 'bg-slate-500/10 border-slate-500/20 text-slate-500'
                                }`}
                              >
                                <RefreshCw className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{sub.title}</p>
                                {sub.note && <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px] font-normal">{sub.note}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-700 dark:text-slate-300 capitalize font-medium">{sub.frequency}</td>
                          <td className="px-5 py-4 text-xs text-slate-700 dark:text-slate-300 font-medium">{formatDate(sub.nextDueDate)}</td>
                          <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400 capitalize font-medium">
                            {sub.paymentMethod === 'bank' ? linkedBank?.bankName || 'Bank Account' : 'Cash Wallet'}
                          </td>
                          <td className="px-5 py-4 text-right font-extrabold text-xs text-slate-900 dark:text-white">
                            {formatCurrency(sub.amount)}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <button
                              onClick={() => handleToggle(sub)}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                                sub.isActive
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                  : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                              }`}
                            >
                              {sub.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setEditing(sub);
                                  setForm({
                                    title: sub.title,
                                    amount: sub.amount,
                                    frequency: sub.frequency,
                                    startDate: sub.startDate?.split('T')[0] || '',
                                    nextDueDate: sub.nextDueDate?.split('T')[0] || '',
                                    paymentMethod: sub.paymentMethod,
                                    bankId: sub.bankId || '',
                                    note: sub.note || '',
                                  });
                                  setModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                title="Edit Subscription"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(sub._id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition"
                                title="Delete Subscription"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          <EmptyState
            icon={RefreshCw}
            title="You haven't added any subscriptions yet"
            description="Track recurring services to better understand your monthly financial commitments."
            actionText="Add Subscription"
            onAction={() => {
              setEditing(null);
              setForm({
                title: '',
                amount: '',
                frequency: 'monthly',
                startDate: '',
                nextDueDate: '',
                paymentMethod: 'bank',
                bankId: '',
                note: '',
              });
              setModalOpen(true);
            }}
          />
        )}
      </motion.div>

      {/* 6. RECENT SUBSCRIPTION TIMELINE */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
          Subscription Renewal Timeline
        </h3>
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
          <ActivityTimeline activities={activityList} />
        </div>
      </motion.div>

      {/* EDIT / CREATE SUBSCRIPTION MODAL */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {editing ? 'Edit Subscription' : 'Add Subscription'}
                </h2>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white" title="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Subscription Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Netflix, Spotify, Notion, GitHub"
                    className={ic}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Amount (₹) *</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="e.g. 649"
                    className={ic}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Billing Frequency</label>
                  <select
                    value={form.frequency}
                    onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                    className={ic}
                  >
                    <option value="monthly" className="bg-card text-foreground">Monthly</option>
                    <option value="weekly" className="bg-card text-foreground">Weekly</option>
                    <option value="yearly" className="bg-card text-foreground">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Start Date *</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className={ic}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Next Renewal Date *</label>
                  <input
                    type="date"
                    value={form.nextDueDate}
                    onChange={(e) => setForm({ ...form, nextDueDate: e.target.value })}
                    className={ic}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Payment Method</label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    className={ic}
                  >
                    <option value="bank" className="bg-card text-foreground">Bank Account</option>
                    <option value="cash" className="bg-card text-foreground">Cash Wallet</option>
                  </select>
                </div>
                {form.paymentMethod === 'bank' && (
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Select Bank *</label>
                    <select
                      value={form.bankId}
                      onChange={(e) => setForm({ ...form, bankId: e.target.value })}
                      className={ic}
                      required
                    >
                      <option value="" className="bg-card text-foreground">Choose linked bank account</option>
                      {banks.map((b) => (
                        <option key={b._id} value={b._id} className="bg-card text-foreground">
                          {b.bankName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Notes / Plan Details</label>
                  <input
                    type="text"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    placeholder="Optional plan details"
                    className={ic}
                  />
                </div>
                <button type="submit" className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-md shadow-purple-500/25 active:scale-95">
                  {editing ? 'Update Subscription' : 'Create Subscription'}
                </button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
}
