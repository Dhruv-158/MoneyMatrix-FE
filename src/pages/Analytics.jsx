import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import html2pdf from 'html2pdf.js';
import { fetchReport } from '@/redux/slices/reportSlice';

// Components
import PageHeader from '@/components/dashboard/PageHeader';
import StatCard from '@/components/cards/StatCard';
import InsightCard from '@/components/dashboard/InsightCard';
import AnalyticsSkeleton from '@/components/analytics/AnalyticsSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import { ChartCard, GlobalPieChart, GlobalBarChart, GlobalLineChart, GlobalAreaChart } from '@/components/charts';

// Icons & Utilities
import { formatCurrency } from '@/utils/helpers';
import { CHART_COLORS } from '@/constants';
import { TrendingUp, TrendingDown, PiggyBank, Download, Wallet, BarChart2, ShieldAlert, Sparkles, Building2, PieChart } from 'lucide-react';
import toastService from '@/services/toastService';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function Analytics() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((s) => s.reports);
  const { isInitialized } = useSelector((s) => s.auth);
  const { lastUpdated } = useSelector((s) => s.transactions);

  const today = new Date().toISOString().split('T')[0];
  const currentMonth = today.slice(0, 7);
  const currentYear = today.slice(0, 4);

  const [activeTab, setActiveTab] = useState('monthly');
  const [dailyDate, setDailyDate] = useState(today);
  const [monthlyDate, setMonthlyDate] = useState(currentMonth);
  const [yearlyDate, setYearlyDate] = useState(currentYear);
  const [chartFilter, setChartFilter] = useState('both');

  const getDateParam = () => {
    if (activeTab === 'daily') return dailyDate;
    if (activeTab === 'monthly') return `${monthlyDate}-01`;
    if (activeTab === 'yearly') return `${yearlyDate}-01-01`;
    return today;
  };

  useEffect(() => {
    if (isInitialized) {
      const dateParam = getDateParam();
      dispatch(fetchReport({ type: activeTab, params: { date: dateParam } }));
    }
  }, [dispatch, isInitialized, activeTab, dailyDate, monthlyDate, yearlyDate, lastUpdated]);

  const handleDownloadPdf = async () => {
    const element = document.getElementById('analytics-content');
    if (!element) return toastService.error('Analytics content not found');

    const dateParam = getDateParam();
    const opt = {
      margin: [0.3, 0.3, 0.3, 0.3],
      filename: `analytics-${activeTab}-${dateParam}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#0f172a' },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    };

    const loadingToast = toastService.loading('Generating Analytics PDF...');
    try {
      await html2pdf().set(opt).from(element).save();
      toastService.dismiss(loadingToast);
      toastService.success('Analytics PDF downloaded');
    } catch (err) {
      toastService.dismiss(loadingToast);
      console.error(err);
      toastService.error('Failed to generate PDF');
    }
  };

  const tabs = ['daily', 'monthly', 'yearly'];
  const inputClass =
    'px-3 py-2 rounded-xl bg-card border border-border text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm';

  const categoryWise = (data?.categoryWiseExpenses || []).map((c, i) => ({
    name: c.name || c.category || c._id || 'Uncategorized',
    value: c.total ?? c.value ?? 0,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const bankWise = (data?.bankWiseExpenses || []).map((b, i) => ({
    name: b.bankName || 'Unknown',
    value: b.total,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const summary = data?.summary || { income: 0, expense: 0, transfer: 0 };
  const netSavings = data?.netSavings || 0;
  const savingsRate = data?.savingsRate || (summary.income > 0 ? Math.round((netSavings / summary.income) * 100) : 0);

  const cashFlow = [
    { name: 'Income', value: summary.income || 0, color: '#22c55e' },
    { name: 'Expense', value: summary.expense || 0, color: '#ef4444' },
    { name: 'Savings', value: netSavings, color: '#3b82f6' },
  ];

  const savingsData = [
    { month: 'Current Period', savings: netSavings, income: summary.income || 0, expense: summary.expense || 0 },
  ];

  if (loading && !data) {
    return <AnalyticsSkeleton />;
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      {/* 1. PAGE HEADER */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Financial Analytics & Intelligence"
          subtitle="Analyze financial performance, identify spending patterns, and monitor long-term growth using interactive reports."
          onExport={handleDownloadPdf}
        />
      </motion.div>

      {/* 2. ANALYTICS CONTROLS & TIMEFRAME SELECTOR */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-border">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                activeTab === t
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t} Report
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {activeTab === 'daily' && (
            <input
              type="date"
              value={dailyDate}
              onChange={(e) => setDailyDate(e.target.value)}
              className={inputClass}
              title="Select date"
            />
          )}

          {activeTab === 'monthly' && (
            <input
              type="month"
              value={monthlyDate}
              onChange={(e) => setMonthlyDate(e.target.value)}
              className={inputClass}
              title="Select month"
            />
          )}

          {activeTab === 'yearly' && (
            <input
              type="number"
              value={yearlyDate}
              onChange={(e) => setYearlyDate(e.target.value)}
              min="2000"
              max="2099"
              className={inputClass}
              title="Select year"
              placeholder="YYYY"
            />
          )}

          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-500/25 active:scale-95"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </motion.div>

      {/* 3. KPI OVERVIEW (6 METRICS) */}
      <motion.div variants={itemVariants} id="analytics-content" className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Total Income"
            value={summary.income}
            icon={TrendingUp}
            color="emerald"
            subtitle="Total revenue generated"
          />
          <StatCard
            title="Total Expenses"
            value={summary.expense}
            icon={TrendingDown}
            color="rose"
            subtitle="Total expenses incurred"
          />
          <StatCard
            title="Net Savings"
            value={netSavings}
            icon={PiggyBank}
            color="blue"
            subtitle={`Savings Rate: ${savingsRate}%`}
          />
          <StatCard
            title="Transfers & Swaps"
            value={summary.transfer}
            icon={Wallet}
            color="purple"
            subtitle="Inter-account transfer volume"
          />
          <StatCard
            title="Savings Rate"
            value={`${savingsRate}%`}
            icon={Sparkles}
            color="cyan"
            subtitle="Percentage of income saved"
          />
          <StatCard
            title="Account Allocation"
            value={bankWise.length}
            icon={Building2}
            color="amber"
            subtitle="Active bank accounts connected"
          />
        </div>

        {/* 4. FINANCIAL INSIGHTS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InsightCard
            icon={Sparkles}
            headline="Savings Rate Target Met"
            explanation={`Your savings rate is currently sitting at ${savingsRate}%. Maintaining over 20% indicates healthy financial discipline.`}
            color="emerald"
          />
          <InsightCard
            icon={ShieldAlert}
            headline="Expense Monitoring"
            explanation={`Total spending for this ${activeTab} period is ${formatCurrency(summary.expense)}. Review category allocations for optimization.`}
            color="amber"
          />
        </div>

        {/* 5. CHARTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income vs Expense Trend Chart */}
          {data?.dailyBreakdown && data.dailyBreakdown.length > 0 && (
            <ChartCard title="Income vs Expense Trend">
              <div className="mb-4 flex gap-2">
                {['both', 'income', 'expense'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setChartFilter(filter)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition ${
                      chartFilter === filter
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-border'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <GlobalLineChart
                data={data.dailyBreakdown}
                xKey="date"
                height={300}
                showLegend={true}
                series={[
                  { key: 'income', name: 'Income', color: '#10b981' },
                  { key: 'expense', name: 'Expense', color: '#ef4444' },
                ].filter((s) => chartFilter === 'both' || chartFilter === s.key)}
              />
            </ChartCard>
          )}

          {/* Category-wise Expenses */}
          <ChartCard title="Category-wise Expense Breakdown">
            <GlobalPieChart
              data={categoryWise}
              height={300}
              innerRadius={65}
              outerRadius={105}
              showLabels={true}
              emptyMessage="No category expense data"
            />
          </ChartCard>

          {/* Bank-wise Expenses */}
          <ChartCard title="Bank Account Allocation">
            <GlobalBarChart
              data={bankWise}
              height={300}
              xKey="name"
              bars={[{ key: 'value', name: 'Expense' }]}
              emptyMessage="No bank expense data"
            />
          </ChartCard>

          {/* Cash Flow Distribution */}
          <ChartCard title="Cash Flow Overview">
            <GlobalBarChart
              data={cashFlow}
              height={300}
              xKey="name"
              bars={[{ key: 'value', name: 'Amount' }]}
            />
          </ChartCard>
        </div>
      </motion.div>
    </motion.div>
  );
}
