import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchCashWallet, updateCashWallet } from '@/redux/slices/cashSlice';
import { fetchTransactions } from '@/redux/slices/transactionSlice';
import { fetchBanks } from '@/redux/slices/bankSlice';

// Components
import PageHeader from '@/components/dashboard/PageHeader';
import StatCard from '@/components/cards/StatCard';
import QuickActionCard from '@/components/dashboard/QuickActionCard';
import WalletHero from '@/components/wallet/WalletHero';
import CashHoldOverview from '@/components/wallet/CashHoldOverview';
import WalletSkeleton from '@/components/wallet/WalletSkeleton';
import ActivityTimeline from '@/components/dashboard/ActivityTimeline';
import InsightCard from '@/components/dashboard/InsightCard';
import EmptyState from '@/components/ui/EmptyState';
import { ChartCard } from '@/components/charts';

// Icons & Helpers
import { formatCurrency, formatDate } from '@/utils/helpers';
import {
  Wallet, ArrowUpRight, ArrowDownRight, ArrowLeftRight, X, Building2,
  PlusCircle, RefreshCw, FileText, Lock, ShieldCheck, Sparkles, ShieldAlert, Clock, AlertCircle
} from 'lucide-react';
import toastService from '@/services/toastService';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function CashWallet() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { wallet, loading: walletLoading } = useSelector((s) => s.cash);
  const { items: txns, loading: txLoading } = useSelector((s) => s.transactions);
  const { list: banks } = useSelector((s) => s.banks);
  const { isInitialized } = useSelector((s) => s.auth);
  const { lastUpdated } = useSelector((s) => s.transactions);

  const [editOpen, setEditOpen] = useState(false);
  const [balance, setBalance] = useState('');

  useEffect(() => {
    if (isInitialized) {
      dispatch(fetchCashWallet());
      dispatch(fetchTransactions({ limit: 50 }));
      dispatch(fetchBanks());
    }
  }, [dispatch, isInitialized, lastUpdated]);

  const cashTxns = txns.filter((t) => t.paymentMethod === 'cash' || t.transferType?.includes('cash'));
  const pendingTxns = txns.filter((t) => t.status === 'pending' || t.isPending);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateCashWallet(Number(balance))).unwrap();
      toastService.success('Cash Wallet balance updated');
      setEditOpen(false);
    } catch (err) {
      toastService.error(err || 'Failed to update balance');
    }
  };

  // Dynamic Financial Calculations
  const availableBalance = wallet?.balance || 0;
  const holdBalance = pendingTxns.reduce((sum, t) => sum + (t.amount || 0), 0);

  const incomingCash = cashTxns
    .filter((t) => t.type === 'income' || t.transferType === 'bank_to_cash')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const outgoingCash = cashTxns
    .filter((t) => t.type === 'expense' || t.transferType === 'cash_to_bank')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const netCashFlow = incomingCash - outgoingCash;

  // Chart data trend
  const cashTrend = cashTxns.slice(0, 7).reverse().map((t) => ({
    date: formatDate(t.date),
    amount: t.type === 'income' || t.transferType === 'bank_to_cash' ? t.amount : -t.amount,
  }));

  // Timeline activities list
  const activityList = cashTxns.slice(0, 5).map((tx) => ({
    id: tx._id,
    title: tx.type === 'income' || tx.transferType === 'bank_to_cash' ? 'Cash Added / Received' : 'Cash Paid / Transferred',
    description: `${tx.note || 'Cash Transaction'} (${formatCurrency(tx.amount)})`,
    timestamp: tx.date,
    dotColor: tx.type === 'income' || tx.transferType === 'bank_to_cash' ? 'bg-emerald-500' : 'bg-rose-500',
  }));

  if ((walletLoading || txLoading) && !cashTxns.length) {
    return <WalletSkeleton />;
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      {/* 1. PAGE HEADER */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Cash Hold & Wallet Operations"
          subtitle="Monitor funds temporarily unavailable, track release schedules, physical cash balances, and hold history."
          onAddTransaction={() => {
            setBalance(availableBalance);
            setEditOpen(true);
          }}
          onTransfer={() => navigate('/transactions')}
          onExport={() => toastService.success('Cash Hold Report exported')}
        />
      </motion.div>

      {/* 2. CASH HOLD OVERVIEW HERO */}
      <motion.div variants={itemVariants}>
        <CashHoldOverview
          availableBalance={availableBalance}
          holdBalance={holdBalance}
          pendingCount={pendingTxns.length}
        />
      </motion.div>

      {/* 3. SUMMARY KPI CARDS */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Available Cash"
          value={availableBalance}
          icon={Wallet}
          color="emerald"
          subtitle="Physical cash ready for immediate use"
        />
        <StatCard
          title="Held Funds"
          value={holdBalance}
          icon={Lock}
          color="amber"
          subtitle="Pending settlement / verification"
        />
        <StatCard
          title="Active Holds"
          value={pendingTxns.length}
          icon={Clock}
          color="purple"
          subtitle="Count of items currently on hold"
        />
        <StatCard
          title="Net Cash Flow"
          value={netCashFlow}
          icon={RefreshCw}
          color={netCashFlow >= 0 ? 'emerald' : 'rose'}
          subtitle="Net cash balance change"
        />
      </motion.div>

      {/* 4. WALLET HERO & QUICK ACTIONS */}
      <motion.div variants={itemVariants}>
        <WalletHero
          balance={availableBalance}
          onSetBalance={() => {
            setBalance(availableBalance);
            setEditOpen(true);
          }}
          onTransfer={() => navigate('/transactions')}
          onExport={() => toast.success('Statement Export initiated')}
        />
      </motion.div>

      {/* 5. INSIGHTS CARDS */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InsightCard
          icon={Sparkles}
          headline={pendingTxns.length === 0 ? '100% Funds Available' : 'Pending Hold Notice'}
          explanation={
            pendingTxns.length === 0
              ? 'You currently have zero funds on hold. All cash balances are cleared and ready for deployment.'
              : `You have ${pendingTxns.length} transaction(s) totaling ${formatCurrency(holdBalance)} under pending settlement.`
          }
          color={pendingTxns.length === 0 ? 'emerald' : 'amber'}
        />
        <InsightCard
          icon={ShieldCheck}
          headline="Cash Wallet Protection"
          explanation="All cash balances and transfers are tracked with double-entry security logs."
          color="blue"
        />
      </motion.div>

      {/* 6. PENDING HOLDS & CASH TRANSACTIONS TABLE */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Cash Transactions & Hold History
            </h3>
            <button
              onClick={() => navigate('/transactions')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Full Ledger →
            </button>
          </div>

          <div className="glass-card overflow-hidden border border-border bg-card shadow-sm">
            {cashTxns.length ? (
              <div className="divide-y divide-border">
                {cashTxns.slice(0, 8).map((tx) => (
                  <div key={tx._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                          tx.type === 'income' || tx.transferType === 'bank_to_cash'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {tx.type === 'income' || tx.transferType === 'bank_to_cash' ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{tx.note || tx.type}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          {formatDate(tx.date)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-xs font-extrabold ${
                          tx.type === 'income' || tx.transferType === 'bank_to_cash'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {tx.type === 'income' || tx.transferType === 'bank_to_cash' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </p>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Cleared
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Lock}
                title="You currently have no funds on hold"
                description="All available cash funds can be used immediately without restrictions."
              />
            )}
          </div>
        </div>

        {/* 7. ACTIVITY TIMELINE */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
            Cash Hold Operations Timeline
          </h3>
          <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
            <ActivityTimeline activities={activityList} />
          </div>
        </div>
      </motion.div>

      {/* UPDATE CASH BALANCE MODAL */}
      {editOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs" onClick={() => setEditOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Adjust Cash Balance</h2>
                <button onClick={() => setEditOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white" title="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleUpdate} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Current Cash Amount (₹)</label>
                  <input
                    type="number"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Enter cash balance"
                    required
                  />
                </div>
                <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md shadow-blue-500/25 active:scale-95">
                  Save New Balance
                </button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
}
