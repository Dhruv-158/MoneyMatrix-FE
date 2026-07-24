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

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

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

  // Category-wise expenses for pie chart (backend aggregated across all monthly expenses)
  const categoryExpenses = (() => {
    if (rawCategoryExpenses?.length) {
      return rawCategoryExpenses.map((c, i) => ({
        name: c.name,
        value: c.total,
        color: CHART_COLORS[i % CHART_COLORS.length],
      }));
    }
    // Fallback: group from recentTransactions if rawCategoryExpenses is empty
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
            <GlobalAreaChart
              data={monthlyTrend}
              xKey="month"
              height={280}
              series={[
                { key: 'income', name: 'Income', color: '#22c55e', gradId: 'incomeGrad' },
                { key: 'expense', name: 'Expense', color: '#ef4444', gradId: 'expenseGrad' },
              ]}
              emptyMessage="No data yet. Add transactions to see trends."
            />
          </ChartCard>
        </div>

        {/* Category pie chart */}
        <ChartCard title="Expense by Category">
          <GlobalPieChart
            data={categoryExpenses}
            height={280}
            innerRadius={60}
            outerRadius={100}
            emptyMessage="No expense data yet."
          />
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
