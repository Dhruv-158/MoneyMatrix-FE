import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchBanks, createBank, updateBank, deleteBank } from '@/redux/slices/bankSlice';

// Components
import PageHeader from '@/components/dashboard/PageHeader';
import StatCard from '@/components/cards/StatCard';
import BankCard from '@/components/cards/BankCard';
import BankOverview from '@/components/banks/BankOverview';
import BankSkeleton from '@/components/banks/BankSkeleton';
import EmptyState from '@/components/ui/EmptyState';

// Icons & Utilities
import { formatCurrency } from '@/utils/helpers';
import { Plus, Building2, X, LayoutGrid, List, Pencil, Trash2, ShieldCheck, Wallet, CreditCard, RefreshCw } from 'lucide-react';
import toastService from '@/services/toastService';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function Banks() {
  const dispatch = useDispatch();
  const { list: banks, loading } = useSelector((s) => s.banks);
  const { isInitialized } = useSelector((s) => s.auth);
  const { lastUpdated } = useSelector((s) => s.transactions);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [form, setForm] = useState({
    bankName: '',
    accountType: 'savings',
    currentBalance: '',
    accountNumberLast4: '',
    color: '#3b82f6',
  });

  useEffect(() => {
    if (isInitialized) dispatch(fetchBanks());
  }, [dispatch, isInitialized, lastUpdated]);

  // Dynamic Financial Calculations from real Redux state
  const totalBalance = banks.reduce((sum, b) => sum + (b.currentBalance || 0), 0);
  const savingsCount = banks.filter((b) => b.accountType === 'savings').length;
  const currentCount = banks.filter((b) => b.accountType === 'current').length;

  const openEdit = (bank) => {
    setEditing(bank);
    setForm({
      bankName: bank.bankName,
      accountType: bank.accountType,
      currentBalance: bank.currentBalance,
      accountNumberLast4: bank.accountNumberLast4 || '',
      color: bank.color || '#3b82f6',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await dispatch(updateBank({ id: editing._id, ...form, currentBalance: Number(form.currentBalance) })).unwrap();
        toastService.success('Bank updated successfully!');
      } else {
        await dispatch(createBank({ ...form, currentBalance: Number(form.currentBalance) })).unwrap();
        toastService.success('Bank added successfully!');
      }
      setModalOpen(false);
      setEditing(null);
      setForm({ bankName: '', accountType: 'savings', currentBalance: '', accountNumberLast4: '', color: '#3b82f6' });
    } catch (err) {
      toastService.error(err || 'Failed to save bank account');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this bank account?')) return;
    try {
      await dispatch(deleteBank(id)).unwrap();
      toastService.success('Bank account deleted');
    } catch (err) {
      toastService.error(err || 'Failed to delete bank');
    }
  };

  const ic =
    'w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm';

  if (loading && !banks.length) {
    return <BankSkeleton />;
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      {/* 1. PAGE HEADER */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Bank Accounts & Treasury"
          subtitle="Manage all connected bank accounts, liquidity pools, and account balances from one secure workspace."
          onAddTransaction={() => {
            setEditing(null);
            setForm({ bankName: '', accountType: 'savings', currentBalance: '', accountNumberLast4: '', color: '#3b82f6' });
            setModalOpen(true);
          }}
          onExport={() => toastService.success('Bank Statement exported')}
        />
      </motion.div>

      {/* 2. BANK OVERVIEW HERO */}
      <motion.div variants={itemVariants}>
        <BankOverview
          totalBalance={totalBalance}
          connectedCount={banks.length}
          savingsCount={savingsCount}
          currentCount={currentCount}
        />
      </motion.div>

      {/* 3. SUMMARY KPI CARDS */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Liquidity"
          value={totalBalance}
          icon={Wallet}
          color="emerald"
          subtitle="Total combined bank balance"
        />
        <StatCard
          title="Connected Banks"
          value={banks.length}
          icon={Building2}
          color="blue"
          subtitle="Active connected accounts"
        />
        <StatCard
          title="Savings Accounts"
          value={savingsCount}
          icon={CreditCard}
          color="purple"
          subtitle="Registered savings accounts"
        />
        <StatCard
          title="Current Accounts"
          value={currentCount}
          icon={RefreshCw}
          color="amber"
          subtitle="Commercial checking accounts"
        />
      </motion.div>

      {/* 4. BANK ACCOUNT GRID & VIEW TOGGLE */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Connected Bank Accounts ({banks.length})
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
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
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
            </div>

            <button
              onClick={() => {
                setEditing(null);
                setForm({ bankName: '', accountType: 'savings', currentBalance: '', accountNumberLast4: '', color: '#3b82f6' });
                setModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Bank
            </button>
          </div>
        </div>

        {banks.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {banks.map((bank, i) => (
                <BankCard key={bank._id} bank={bank} index={i} onEdit={openEdit} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <div className="glass-card overflow-hidden border border-border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-slate-50/50 dark:bg-slate-900/50 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                      <th className="px-5 py-3.5">Bank Name</th>
                      <th className="px-5 py-3.5">Account Type</th>
                      <th className="px-5 py-3.5">Account Number</th>
                      <th className="px-5 py-3.5 text-right">Available Balance</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {banks.map((bank) => (
                      <tr key={bank._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                        <td className="px-5 py-4 font-bold text-xs text-slate-900 dark:text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <span>{bank.bankName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-700 dark:text-slate-300 font-medium capitalize">
                          {bank.accountType} Account
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
                          •••• {bank.accountNumberLast4 || '----'}
                        </td>
                        <td className="px-5 py-4 text-right text-xs font-extrabold text-slate-900 dark:text-white">
                          {formatCurrency(bank.currentBalance)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(bank)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                              title="Edit Bank"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(bank._id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                              title="Delete Bank"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          <EmptyState
            icon={Building2}
            title="No bank accounts connected yet"
            description="Connect your first bank account to start managing balances and transactions."
            actionText="Add Bank Account"
            onAction={() => {
              setEditing(null);
              setForm({ bankName: '', accountType: 'savings', currentBalance: '', accountNumberLast4: '', color: '#3b82f6' });
              setModalOpen(true);
            }}
          />
        )}
      </motion.div>

      {/* ADD / EDIT BANK MODAL */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {editing ? 'Edit Bank Account' : 'Add Bank Account'}
                </h2>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer" title="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Bank Name *</label>
                  <input
                    type="text"
                    value={form.bankName}
                    onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                    className={ic}
                    required
                    placeholder="e.g. HDFC Bank, Chase, Revolut"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Account Type *</label>
                  <select
                    value={form.accountType}
                    onChange={(e) => setForm({ ...form, accountType: e.target.value })}
                    className={ic}
                  >
                    <option value="savings" className="bg-card text-foreground">Savings Account</option>
                    <option value="current" className="bg-card text-foreground">Current / Checking Account</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Current Balance (₹) *</label>
                  <input
                    type="number"
                    value={form.currentBalance}
                    onChange={(e) => setForm({ ...form, currentBalance: e.target.value })}
                    className={ic}
                    required
                    placeholder="e.g. 50000"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Last 4 Digits of Account Number *</label>
                  <input
                    type="text"
                    value={form.accountNumberLast4}
                    onChange={(e) => setForm({ ...form, accountNumberLast4: e.target.value })}
                    className={ic}
                    required
                    maxLength={4}
                    minLength={4}
                    placeholder="1234"
                  />
                </div>
                <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md shadow-blue-500/25 active:scale-95 cursor-pointer">
                  {editing ? 'Update Bank Account' : 'Save Bank Account'}
                </button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
}
