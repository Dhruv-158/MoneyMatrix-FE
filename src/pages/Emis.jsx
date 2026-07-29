import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchEmis, createEmi, updateEmi, deleteEmi, toggleEmiStatus } from '@/redux/slices/emiSlice';
import { fetchBanks } from '@/redux/slices/bankSlice';

// Components
import PageHeader from '@/components/dashboard/PageHeader';
import StatCard from '@/components/cards/StatCard';
import QuickActionCard from '@/components/dashboard/QuickActionCard';
import UpcomingBillsWidget from '@/components/dashboard/UpcomingBillsWidget';
import ActivityTimeline from '@/components/dashboard/ActivityTimeline';
import InsightCard from '@/components/dashboard/InsightCard';
import BillSkeleton from '@/components/bills/BillSkeleton';
import EmptyState from '@/components/ui/EmptyState';

// Icons & Helpers
import { formatCurrency, formatDate } from '@/utils/helpers';
import {
  CalendarClock, Plus, Pencil, Trash2, X, LayoutGrid, List,
  CreditCard, CheckCircle2, AlertCircle, Building2, RefreshCw, Sparkles, ShieldAlert
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

export default function Emis() {
  const dispatch = useDispatch();
  const { list: emis, loading } = useSelector((s) => s.emis);
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
      dispatch(fetchEmis());
      dispatch(fetchBanks());
    }
  }, [dispatch, isInitialized]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editing) {
        await dispatch(updateEmi({ id: editing._id, ...payload })).unwrap();
        toastService.success('Bill / EMI updated');
      } else {
        await dispatch(createEmi(payload)).unwrap();
        toastService.success('Bill / EMI created');
      }
      setModalOpen(false);
      setEditing(null);
    } catch (err) {
      toastService.error(err || 'Failed to save EMI');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this recurring bill?')) return;
    try {
      await dispatch(deleteEmi(id)).unwrap();
      toastService.success('Bill deleted');
    } catch (err) {
      toastService.error(err || 'Failed to delete bill');
    }
  };

  const handleToggle = async (emi) => {
    try {
      await dispatch(toggleEmiStatus({ id: emi._id, isActive: !emi.isActive })).unwrap();
      toastService.success(`Bill marked as ${!emi.isActive ? 'Active' : 'Inactive'}`);
    } catch (err) {
      toastService.error(err || 'Failed to toggle status');
    }
  };

  // Dynamic KPI Computations from real Redux state
  const activeEmis = emis.filter((e) => e.isActive);
  const inactiveEmis = emis.filter((e) => !e.isActive);
  const totalMonthlyObligation = activeEmis.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Frequency Category Groupings
  const monthlyCount = activeEmis.filter((e) => e.frequency === 'monthly').length;
  const weeklyCount = activeEmis.filter((e) => e.frequency === 'weekly').length;
  const yearlyCount = activeEmis.filter((e) => e.frequency === 'yearly').length;

  // Timeline entries
  const activityList = emis.slice(0, 5).map((e) => ({
    id: e._id,
    title: e.isActive ? 'Recurring Bill Active' : 'Bill Paused / Inactive',
    description: `${e.title} (${formatCurrency(e.amount)}) • Due: ${formatDate(e.nextDueDate)}`,
    timestamp: e.nextDueDate || new Date().toISOString(),
    dotColor: e.isActive ? 'bg-blue-500' : 'bg-slate-500',
  }));

  const ic =
    'w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm';

  if (loading && !emis.length) {
    return <BillSkeleton />;
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      {/* 1. PAGE HEADER */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Bills & Auto-Debits"
          subtitle="Manage recurring loans, subscriptions, auto-debits, and monthly bill obligations from one central ledger."
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
          onExport={() => toast.success('Bills schedule exported')}
        />
      </motion.div>

      {/* 2. BILL SUMMARY OVERVIEW KPI CARDS */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Obligations"
          value={totalMonthlyObligation}
          icon={CalendarClock}
          color="rose"
          subtitle="Total active recurring commitments"
        />
        <StatCard
          title="Active Auto-Debits"
          value={activeEmis.length}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Active scheduled payment plans"
        />
        <StatCard
          title="Total Registered Bills"
          value={emis.length}
          icon={CreditCard}
          color="blue"
          subtitle="Total recurring bill records"
        />
        <StatCard
          title="Paused / Inactive"
          value={inactiveEmis.length}
          icon={AlertCircle}
          color="purple"
          subtitle="Paused recurring subscriptions"
        />
      </motion.div>

      {/* 3. UPCOMING BILLS HIGHLIGHT & INSIGHTS */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UpcomingBillsWidget
            emis={emis}
            onViewAll={() => setViewMode('table')}
            onPay={(bill) => {
              setEditing(bill);
              setForm({
                title: bill.title,
                amount: bill.amount,
                frequency: bill.frequency,
                startDate: bill.startDate?.split('T')[0] || '',
                nextDueDate: bill.nextDueDate?.split('T')[0] || '',
                paymentMethod: bill.paymentMethod,
                bankId: bill.bankId || '',
                note: bill.note || '',
              });
              setModalOpen(true);
            }}
          />
        </div>

        {/* 7. INSIGHTS CARDS */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
            Bill Insights
          </h3>
          <div className="space-y-3">
            <InsightCard
              icon={Sparkles}
              headline="Recurring Cash Flow"
              explanation={`Your total active monthly recurring commitments equal ${formatCurrency(totalMonthlyObligation)}.`}
              color="emerald"
            />
            <InsightCard
              icon={ShieldAlert}
              headline="Frequency Breakdown"
              explanation={`${monthlyCount} Monthly, ${weeklyCount} Weekly, and ${yearlyCount} Yearly recurring payment schedules active.`}
              color="amber"
            />
          </div>
        </div>
      </motion.div>

      {/* 4. BILL WORKSPACE & VIEW MODE TOGGLE */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Scheduled Payments & EMI Records ({emis.length})
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 border border-border rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-sm'
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
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="List View"
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Bill
            </button>
          </div>
        </div>

        {/* 6. BILLS TABLE / GRID DISPLAY */}
        {emis.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {emis.map((emi) => (
                <div
                  key={emi._id}
                  className="p-5 rounded-2xl bg-card border border-border hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                          emi.isActive
                            ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
                            : 'bg-slate-500/10 border-slate-500/20 text-slate-500'
                        }`}
                      >
                        <CalendarClock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{emi.title}</h4>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium capitalize">
                          {emi.frequency} • {emi.paymentMethod === 'bank' ? 'Bank Auto-Debit' : 'Cash Wallet'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditing(emi);
                          setForm({
                            title: emi.title,
                            amount: emi.amount,
                            frequency: emi.frequency,
                            startDate: emi.startDate?.split('T')[0] || '',
                            nextDueDate: emi.nextDueDate?.split('T')[0] || '',
                            paymentMethod: emi.paymentMethod,
                            bankId: emi.bankId || '',
                            note: emi.note || '',
                          });
                          setModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Edit EMI"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(emi._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete EMI"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Payment Amount</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">{formatCurrency(emi.amount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Next Due Date</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{formatDate(emi.nextDueDate)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Status</span>
                      <button
                        onClick={() => handleToggle(emi)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                          emi.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                        }`}
                      >
                        {emi.isActive ? 'Active' : 'Inactive'}
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
                      <th className="px-5 py-3.5">Bill Title</th>
                      <th className="px-5 py-3.5">Frequency</th>
                      <th className="px-5 py-3.5">Next Due</th>
                      <th className="px-5 py-3.5">Payment Source</th>
                      <th className="px-5 py-3.5 text-right">Amount</th>
                      <th className="px-5 py-3.5 text-center">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {emis.map((emi) => {
                      const linkedBank = banks.find((b) => b._id === emi.bankId);
                      return (
                        <tr key={emi._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                          <td className="px-5 py-4 text-xs font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                                  emi.isActive
                                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
                                    : 'bg-slate-500/10 border-slate-500/20 text-slate-500'
                                }`}
                              >
                                <CalendarClock className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{emi.title}</p>
                                {emi.note && <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px] font-normal">{emi.note}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-700 dark:text-slate-300 capitalize font-medium">{emi.frequency}</td>
                          <td className="px-5 py-4 text-xs text-slate-700 dark:text-slate-300 font-medium">{formatDate(emi.nextDueDate)}</td>
                          <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400 capitalize font-medium">
                            {emi.paymentMethod === 'bank' ? linkedBank?.bankName || 'Bank' : 'Cash Wallet'}
                          </td>
                          <td className="px-5 py-4 text-right font-extrabold text-xs text-rose-600 dark:text-rose-400">
                            {formatCurrency(emi.amount)}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <button
                              onClick={() => handleToggle(emi)}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                                emi.isActive
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                  : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                              }`}
                            >
                              {emi.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setEditing(emi);
                                  setForm({
                                    title: emi.title,
                                    amount: emi.amount,
                                    frequency: emi.frequency,
                                    startDate: emi.startDate?.split('T')[0] || '',
                                    nextDueDate: emi.nextDueDate?.split('T')[0] || '',
                                    paymentMethod: emi.paymentMethod,
                                    bankId: emi.bankId || '',
                                    note: emi.note || '',
                                  });
                                  setModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                title="Edit EMI"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(emi._id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition"
                                title="Delete EMI"
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
            icon={CalendarClock}
            title="No scheduled bills or EMIs"
            description="Start tracking your recurring subscriptions, auto-debits, and loan installments."
            actionText="Add Bill / EMI"
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

      {/* 5. RECENT BILL ACTIVITY TIMELINE */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
          Bill Due Dates & Activity
        </h3>
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
          <ActivityTimeline activities={activityList} />
        </div>
      </motion.div>

      {/* EDIT / CREATE BILL MODAL */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {editing ? 'Edit Scheduled Bill' : 'Add Scheduled Bill / EMI'}
                </h2>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white" title="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Bill Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Netflix, Car Loan EMI, Rent"
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
                    placeholder="e.g. 1500"
                    className={ic}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Frequency</label>
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
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Next Due Date *</label>
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
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Notes / Reference</label>
                  <input
                    type="text"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    placeholder="Optional notes"
                    className={ic}
                  />
                </div>
                <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md shadow-blue-500/25 active:scale-95">
                  {editing ? 'Update Bill' : 'Create Scheduled Bill'}
                </button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
}
