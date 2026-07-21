import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchDashboard } from '@/redux/slices/dashboardSlice';
import { fetchBanks } from '@/redux/slices/bankSlice';
import StatCard from '@/components/cards/StatCard';
import ChartCard from '@/components/charts/ChartCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { CHART_COLORS } from '@/constants';
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank, Building2, Banknote,
  ArrowUpRight, ArrowDownRight, ArrowLeftRight
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const dispatch = useDispatch();
  const { isInitialized } = useSelector((s) => s.auth);
  const {
    totalBalance, cashBalance, totalBankBalance,
    monthlyIncome, monthlyExpense, savings,
    recentTransactions, analytics, loading
  } = useSelector((s) => s.dashboard);
  const { list: banks } = useSelector((s) => s.banks);
  const { lastUpdated } = useSelector((s) => s.transactions);

  useEffect(() => {
    // Only fetch data after auth is initialized
    if (isInitialized) {
      dispatch(fetchDashboard());
      dispatch(fetchBanks());
    }
  }, [dispatch, isInitialized, lastUpdated]);

  // Transform analytics for the area chart: [{ type, month, total }] -> [{ month, income, expense }]
  const monthlyTrend = [];
  // console.log("🚀 ~ Dashboard ~ analytics:", analytics)
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
  // console.log("🚀 ~ Dashboard ~ monthlyTrend:", monthlyTrend)

  // Category-wise expenses for pie chart (from analytics)
  const categoryExpenses = analytics?.filter(a => a.type === 'expense').map((a, i) => ({
    name: `Category ${a.month}`,
    value: a.total,
    color: CHART_COLORS[i % CHART_COLORS.length],
  })) || [];

  const typeIcon = (type) => {
    if (type === 'income') return <ArrowUpRight className="w-4 h-4 text-emerald-400" />;
    if (type === 'expense') return <ArrowDownRight className="w-4 h-4 text-red-400" />;
    return <ArrowLeftRight className="w-4 h-4 text-blue-400" />;
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
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Balance" value={totalBalance} icon={Wallet} color="blue" />
        <StatCard title="Cash Balance" value={cashBalance} icon={Banknote} color="cyan" />
        <StatCard title="Bank Balance" value={totalBankBalance} icon={Building2} color="purple" />
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Income vs Expense area chart */}
        <div className="lg:col-span-2">
          <ChartCard title="Income vs Expense">
            {monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: 12 }} />
                  <Area type="monotone" dataKey="income" stroke="#22c55e" fill="url(#incomeGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#expenseGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-500 text-center py-12">No data yet. Add transactions to see trends.</p>
            )}
          </ChartCard>
        </div>

        {/* Category pie chart */}
        <ChartCard title="Expense by Category">
          {categoryExpenses.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={categoryExpenses} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                  {categoryExpenses.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500 text-center py-12">No expense data yet.</p>
          )}
        </ChartCard>
      </motion.div>

      {/* Bank overview + Recent transactions */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bank overview cards */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Bank Accounts</h3>
          {banks.length > 0 ? banks.map((bank) => (
            <div key={bank._id} className="glass-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{bank.bankName}</p>
                  <p className="text-xs text-slate-500 capitalize">{bank.accountType} • {bank.accountNumberLast4}</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-white">{formatCurrency(bank.currentBalance)}</p>
            </div>
          )) : (
            <div className="glass-card p-6 text-center">
              <p className="text-sm text-slate-500">No banks added yet.</p>
            </div>
          )}
        </div>

        {/* Recent transactions */}
        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-white mb-3">Recent Transactions</h3>
          <div className="glass-card overflow-hidden">
            {recentTransactions.length > 0 ? (
              <div className="divide-y divide-white/5">
                {recentTransactions.slice(0, 8).map((tx) => (
                  <div key={tx._id} className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        tx.type === 'income' ? 'bg-emerald-500/10' : tx.type === 'expense' ? 'bg-red-500/10' : 'bg-blue-500/10'
                      }`}>
                        {typeIcon(tx.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{tx.note || tx.type}</p>
                        <p className="text-xs text-slate-500">{formatDate(tx.date)}</p>
                      </div>
                    </div>
                    <p className={`text-sm font-semibold ${
                      tx.type === 'income' ? 'text-emerald-400' : tx.type === 'expense' ? 'text-red-400' : 'text-blue-400'
                    }`}>
                      {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                      {formatCurrency(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-sm text-slate-500">No transactions yet.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
