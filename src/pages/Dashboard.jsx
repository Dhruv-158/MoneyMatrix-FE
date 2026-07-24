import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchDashboard } from '@/redux/slices/dashboardSlice';
import { fetchBanks } from '@/redux/slices/bankSlice';
import StatCard from '@/components/cards/StatCard';
import { ChartCard, GlobalAreaChart, GlobalPieChart } from '@/components/charts';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { CHART_COLORS } from '@/constants';
import {
  Wallet, Building2, Banknote,
  ArrowUpRight, ArrowDownRight, ArrowLeftRight
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip
} from 'recharts';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const dispatch = useDispatch();
  const { isInitialized } = useSelector((s) => s.auth);
  const {
    totalBalance, cashBalance, totalBankBalance,
    recentTransactions, analytics, categoryExpenses: rawCategoryExpenses, loading
  } = useSelector((s) => s.dashboard);
  const { list: banks } = useSelector((s) => s.banks);
  const { lastUpdated } = useSelector((s) => s.transactions);

  useEffect(() => {
    if (isInitialized) {
      dispatch(fetchDashboard());
      dispatch(fetchBanks());
    }
  }, [dispatch, isInitialized, lastUpdated]);

  const monthlyTrend = [];
  if (analytics?.length) {
    const monthMap = {};
    analytics.forEach((a) => {
      if (!monthMap[a.month]) monthMap[a.month] = { month: a.month, income: 0, expense: 0 };
      if (a.type === 'income') monthMap[a.month].income = a.total;
      if (a.type === 'expense') monthMap[a.month].expense = a.total;
    });
    const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    Object.values(monthMap).sort((a, b) => a.month - b.month).forEach((m) => {
      monthlyTrend.push({ month: months[m.month] || m.month, income: m.income, expense: m.expense });
    });
  }

  const categoryExpenses = (() => {
    if (rawCategoryExpenses?.length) {
      return rawCategoryExpenses.map((c, i) => ({
        name: c.name,
        value: c.total,
        color: CHART_COLORS[i % CHART_COLORS.length],
      }));
    }
    const catMap = {};
    if (recentTransactions?.length) {
      recentTransactions.forEach((tx) => {
        if (tx.type === 'expense') {
          const catName = tx.categoryId?.name || (tx.paymentMethod === 'cash' ? 'Cash Expense' : 'Other');
          catMap[catName] = (catMap[catName] || 0) + (tx.amount || 0);
        }
      });
    }
    return Object.entries(catMap).map(([name, value], i) => ({
      name,
      value,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));
  })();

  const typeIcon = (type) => {
    if (type === 'income') return <ArrowUpRight className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />;
    if (type === 'expense') return <ArrowDownRight className="w-4 h-4 text-rose-500 dark:text-rose-400" />;
    return <ArrowLeftRight className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <SkeletonCard count={6} />
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Stat cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard title="Total Balance" value={totalBalance} icon={Wallet} color="blue" />
        <StatCard title="Cash Wallet" value={cashBalance} icon={Banknote} color="cyan" />
        <StatCard title="Bank Balance" value={totalBankBalance} icon={Building2} color="purple" />
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ChartCard title="Income vs Expense Trend">
            {monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: 12 }} />
                  <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#incomeGrad)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="expense" stroke="#f43f5e" fill="url(#expenseGrad)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400 text-center py-12">No transaction trends to display yet.</p>
            )}
          </ChartCard>
        </div>

        <ChartCard title="Expense Category Breakdown">
          {categoryExpenses.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={categoryExpenses} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
                  {categoryExpenses.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-slate-400 text-center py-12">No expense categories yet.</p>
          )}
        </ChartCard>
      </motion.div>

      {/* Bank overview + Recent transactions */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">Bank Accounts</h3>
          {banks.length > 0 ? banks.map((bank) => (
            <div key={bank._id} className="glass-card p-4 flex items-center justify-between border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{bank.bankName}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize font-medium">{bank.accountType} • •••• {bank.accountNumberLast4}</p>
                </div>
              </div>
              <p className="text-xs font-extrabold text-slate-900 dark:text-white">{formatCurrency(bank.currentBalance)}</p>
            </div>
          )) : (
            <div className="glass-card p-6 text-center border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80">
              <p className="text-xs text-slate-400">No bank accounts added.</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 px-1">Recent Transactions</h3>
          <div className="glass-card overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 shadow-sm">
            {recentTransactions.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {recentTransactions.slice(0, 8).map((tx) => (
                  <div key={tx._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                        tx.type === 'income' ? 'bg-emerald-500/10 border-emerald-500/20' : tx.type === 'expense' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-blue-500/10 border-blue-500/20'
                      }`}>
                        {typeIcon(tx.type)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{tx.note || tx.type}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{formatDate(tx.date)}</p>
                      </div>
                    </div>
                    <p className={`text-xs font-extrabold ${
                      tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : tx.type === 'expense' ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'
                    }`}>
                      {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                      {formatCurrency(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-xs text-slate-400">No recent transactions recorded.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
