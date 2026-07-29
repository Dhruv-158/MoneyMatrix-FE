import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchDashboard } from '@/redux/slices/dashboardSlice';
import { fetchBanks } from '@/redux/slices/bankSlice';
import { fetchEmis } from '@/redux/slices/emiSlice';
import { openModal } from '@/redux/slices/modalSlice';

// Components
import PageHeader from '@/components/dashboard/PageHeader';
import StatCard from '@/components/cards/StatCard';
import QuickActionCard from '@/components/dashboard/QuickActionCard';
import BudgetCard from '@/components/dashboard/BudgetCard';
import InsightCard from '@/components/dashboard/InsightCard';
import UpcomingBillsWidget from '@/components/dashboard/UpcomingBillsWidget';
import ActivityTimeline from '@/components/dashboard/ActivityTimeline';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import { ChartCard } from '@/components/charts';

// Icons & Helpers
import { formatCurrency, formatDate } from '@/utils/helpers';
import { CHART_COLORS } from '@/constants';
import {
  Wallet, Banknote, Building2, TrendingUp, TrendingDown, PiggyBank,
  PlusCircle, ArrowLeftRight, FileText, ShoppingBag, Utensils,
  Car, ShieldAlert, Sparkles, ArrowUpRight, ArrowDownRight, CreditCard
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip
} from 'recharts';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isInitialized } = useSelector((s) => s.auth);
  const {
    totalBalance, cashBalance, totalBankBalance, monthlyIncome, monthlyExpense, savings,
    recentTransactions, analytics, categoryExpenses: rawCategoryExpenses, loading
  } = useSelector((s) => s.dashboard);
  const { list: banks } = useSelector((s) => s.banks);
  const { list: emis } = useSelector((s) => s.emis);
  const { lastUpdated } = useSelector((s) => s.transactions);

  const [timeframe, setTimeframe] = useState('monthly'); // 'weekly' | 'monthly' | 'yearly'

  useEffect(() => {
    if (isInitialized) {
      dispatch(fetchDashboard());
      dispatch(fetchBanks());
      dispatch(fetchEmis());
    }
  }, [dispatch, isInitialized, lastUpdated]);

  // Compute monthly trend line chart data
  const monthlyTrend = [];
  if (analytics?.length) {
    const monthMap = {};
    analytics.forEach((a) => {
      if (!monthMap[a.month]) monthMap[a.month] = { month: a.month, income: 0, expense: 0 };
      if (a.type === 'income') monthMap[a.month].income = a.total;
      if (a.type === 'expense') monthMap[a.month].expense = a.total;
    });
    const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    Object.values(monthMap)
      .sort((a, b) => a.month - b.month)
      .forEach((m) => {
        monthlyTrend.push({ month: months[m.month] || m.month, income: m.income, expense: m.expense });
      });
  }

  // Compute category breakdown data
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

  // Sample activities compiled from recent transactions
  const activityList = (recentTransactions || []).slice(0, 5).map((tx) => ({
    id: tx._id,
    title: tx.type === 'income' ? 'Income Received' : tx.type === 'expense' ? 'Expense Paid' : 'Transfer Completed',
    description: `${tx.note || tx.type} (${formatCurrency(tx.amount)})`,
    timestamp: tx.date,
    dotColor: tx.type === 'income' ? 'bg-emerald-500' : tx.type === 'expense' ? 'bg-rose-500' : 'bg-blue-500',
  }));

  const typeIcon = (type) => {
    if (type === 'income') return <ArrowUpRight className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />;
    if (type === 'expense') return <ArrowDownRight className="w-4 h-4 text-rose-500 dark:text-rose-400" />;
    return <ArrowLeftRight className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      {/* 1. PAGE HEADER */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Dashboard"
          subtitle="Monitor your financial health, spending habits, budgets and recent activity from one place."
          onAddTransaction={() => dispatch(openModal('addTransaction'))}
          onTransfer={() => navigate('/transactions')}
          onExport={() => navigate('/reports')}
        />
      </motion.div>

      {/* 2. FINANCIAL OVERVIEW (KPI CARDS) */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Current Balance"
          value={totalBalance}
          icon={Wallet}
          color="blue"
          subtitle="Total liquid assets across accounts"
        />
        <StatCard
          title="Cash Wallet"
          value={cashBalance}
          icon={Banknote}
          color="cyan"
          subtitle="Physical cash balance on hand"
        />
        <StatCard
          title="Bank Balance"
          value={totalBankBalance}
          icon={Building2}
          color="purple"
          subtitle="Combined total in bank accounts"
        />
        <StatCard
          title="Total Savings"
          value={savings || Math.max(monthlyIncome - monthlyExpense, 0)}
          icon={PiggyBank}
          color="emerald"
          subtitle="Net savings accumulated"
        />
      </motion.div>

      {/* 3. QUICK ACTIONS */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            icon={PlusCircle}
            title="Add Transaction"
            description="Record a new expense, income or cash movement"
            color="blue"
            onClick={() => dispatch(openModal('addTransaction'))}
          />
          <QuickActionCard
            icon={ArrowLeftRight}
            title="Transfer Funds"
            description="Move money between bank accounts or cash"
            color="purple"
            onClick={() => navigate('/transactions')}
          />
          <QuickActionCard
            icon={FileText}
            title="View Reports"
            description="Analyze detailed cash flow & export statements"
            color="emerald"
            onClick={() => navigate('/reports')}
          />
          <QuickActionCard
            icon={CreditCard}
            title="Manage EMIs"
            description="Track upcoming recurring bills and auto-debits"
            color="rose"
            onClick={() => navigate('/emis')}
          />
        </div>
      </motion.div>

      {/* 4. SPENDING ANALYTICS (MAIN CENTERPIECE CHART) */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard title="Income vs Expense Trend">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-border">
                {['weekly', 'monthly', 'yearly'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeframe(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                      timeframe === t
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: '#0F172A',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#incomeGrad)" strokeWidth={2.5} name="Income" />
                  <Area type="monotone" dataKey="expense" stroke="#f43f5e" fill="url(#expenseGrad)" strokeWidth={2.5} name="Expense" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={TrendingUp} title="No trend data" description="Add transactions to visualize financial trends." />
            )}
          </ChartCard>
        </div>

        <div>
          <ChartCard title="Category Breakdown">
            {categoryExpenses.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryExpenses} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={4} dataKey="value">
                    {categoryExpenses.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#0F172A',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={ShoppingBag} title="No category expenses" description="Expense categories will appear here." />
            )}
          </ChartCard>
        </div>
      </motion.div>

      {/* 5. BUDGET PROGRESS */}
      {categoryExpenses.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
            Category Spending Progress
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryExpenses.slice(0, 3).map((cat) => (
              <BudgetCard
                key={cat.name}
                category={cat.name}
                spent={cat.value}
                limit={cat.value * 1.25}
                icon={ShoppingBag}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* 6. RECENT TRANSACTIONS TABLE */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Recent Transactions
            </h3>
            <button
              onClick={() => navigate('/transactions')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All Transactions →
            </button>
          </div>

          <div className="glass-card overflow-hidden border border-border bg-card shadow-sm">
            {recentTransactions.length > 0 ? (
              <div className="divide-y divide-border">
                {recentTransactions.slice(0, 6).map((tx) => (
                  <div key={tx._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                        tx.type === 'income' ? 'bg-emerald-500/10 border-emerald-500/20' : tx.type === 'expense' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-blue-500/10 border-blue-500/20'
                      }`}>
                        {typeIcon(tx.type)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{tx.note || tx.type}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          {formatDate(tx.date)} • {tx.paymentMethod === 'cash' ? 'Cash Wallet' : tx.bankId?.bankName || 'Bank'}
                        </p>
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
              <EmptyState icon={FileText} title="No transactions recorded" description="Start logging expenses or income to track history." />
            )}
          </div>
        </div>

        {/* 8. UPCOMING BILLS WIDGET */}
        <div>
          <UpcomingBillsWidget
            emis={emis}
            onViewAll={() => navigate('/emis')}
            onPay={() => navigate('/emis')}
          />
        </div>
      </motion.div>

      {/* 7. FINANCIAL INSIGHTS & 9. RECENT ACTIVITY TIMELINE */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
            Financial Insights
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InsightCard
              icon={Sparkles}
              headline="Savings Rate Healthy"
              explanation="You saved 24% of your total income this month. Keep it up!"
              color="emerald"
            />
            <InsightCard
              icon={ShieldAlert}
              headline="Shopping Near Budget Limit"
              explanation="You have utilized 94% of your shopping category budget."
              actionText="Adjust Budget"
              onAction={() => navigate('/categories')}
              color="amber"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
            Recent Activity
          </h3>
          <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
            <ActivityTimeline activities={activityList} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
