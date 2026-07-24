import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import html2pdf from 'html2pdf.js';
import { fetchReport } from '@/redux/slices/reportSlice';
import { ChartCard, GlobalPieChart, GlobalBarChart, GlobalLineChart, GlobalAreaChart } from '@/components/charts';
import StatCard from '@/components/cards/StatCard';
import { formatCurrency } from '@/utils/helpers';
import { CHART_COLORS } from '@/constants';
import { TrendingUp, TrendingDown, PiggyBank, Download, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Analytics() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((s) => s.reports);
  const { isInitialized } = useSelector((s) => s.auth);
  const { lastUpdated } = useSelector((s) => s.transactions);

  const today = new Date().toISOString().split('T')[0];
  const currentMonth = today.slice(0, 7); // YYYY-MM
  const currentYear = today.slice(0, 4); // YYYY

  const [activeTab, setActiveTab] = useState('monthly');
  const [dailyDate, setDailyDate] = useState(today);
  const [monthlyDate, setMonthlyDate] = useState(currentMonth);
  const [yearlyDate, setYearlyDate] = useState(currentYear);
  const [chartFilter, setChartFilter] = useState('both'); // 'income', 'expense', 'both'

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
    if (!element) return toast.error('Analytics content not found');

    const dateParam = getDateParam();
    const opt = {
      margin:       [0.3, 0.3, 0.3, 0.3],
      filename:     `analytics-${activeTab}-${dateParam}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#0f172a' },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    const loadingToast = toast.loading('Generating Analytics PDF...');
    try {
      await html2pdf().set(opt).from(element).save();
      toast.dismiss(loadingToast);
      toast.success('Analytics PDF downloaded');
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error(err);
      toast.error('Failed to generate PDF');
    }
  };

  const tabs = ['daily', 'monthly', 'yearly'];
  const inputClass = 'px-3 py-2 rounded-lg bg-card border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50';

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
  const cashFlow = [
    { name: 'Income', value: summary.income || 0, color: '#22c55e' },
    { name: 'Expense', value: summary.expense || 0, color: '#ef4444' },
    { name: 'Savings', value: data?.netSavings || 0, color: '#3b82f6' },
  ];

  const savingsData = [{ month: 'Current', savings: data?.netSavings || 0, income: summary.income || 0, expense: summary.expense || 0 }];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header controls: Tabs, Date Pickers, PDF Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Tab Buttons */}
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                activeTab === t
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 border border-white/5 hover:border-white/10'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Date Filter & Actions */}
        <div className="flex gap-2 flex-wrap items-center">
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
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white text-sm transition"
            title="Download Analytics PDF"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div id="analytics-content" className="space-y-6 p-4 rounded-xl bg-slate-900/60 border border-white/5">
          {/* Summary Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Income" value={summary.income} icon={TrendingUp} color="green" />
            <StatCard title="Expense" value={summary.expense} icon={TrendingDown} color="red" />
            <StatCard title="Transfers" value={summary.transfer} icon={TrendingUp} color="blue" />
            <StatCard title="Net Savings" value={data?.netSavings || 0} icon={PiggyBank} color="amber" />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Income vs Expense Trend Chart with Both / Income / Expense Filter Toggles */}
            {data?.dailyBreakdown && data.dailyBreakdown.length > 0 && (
              <ChartCard title="Income vs Expense Trend">
                <div className="mb-4 flex gap-2">
                  <button
                    onClick={() => setChartFilter('both')}
                    className={`px-3 py-1 rounded-lg text-sm transition ${
                      chartFilter === 'both'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    Both
                  </button>
                  <button
                    onClick={() => setChartFilter('income')}
                    className={`px-3 py-1 rounded-lg text-sm transition ${
                      chartFilter === 'income'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    Income
                  </button>
                  <button
                    onClick={() => setChartFilter('expense')}
                    className={`px-3 py-1 rounded-lg text-sm transition ${
                      chartFilter === 'expense'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    Expense
                  </button>
                </div>
                {data.dailyBreakdown.length <= 4 ? (
                  <GlobalBarChart
                    data={data.dailyBreakdown}
                    xKey="date"
                    height={300}
                    showLegend={true}
                    bars={[
                      { key: 'income', name: 'Income', color: '#10b981' },
                      { key: 'expense', name: 'Expense', color: '#ef4444' },
                    ].filter((s) => chartFilter === 'both' || chartFilter === s.key)}
                  />
                ) : (
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
                )}
              </ChartCard>
            )}

            {/* Category-wise Expenses */}
            <ChartCard title="Category-wise Expenses">
              <GlobalPieChart
                data={categoryWise}
                height={300}
                innerRadius={60}
                outerRadius={110}
                showLabels={true}
                emptyMessage="No category expense data"
              />
            </ChartCard>

            {/* Bank-wise Expenses */}
            <ChartCard title="Bank-wise Expenses">
              <GlobalBarChart
                data={bankWise}
                height={300}
                xKey="name"
                bars={[{ key: 'value', name: 'Expense' }]}
                emptyMessage="No bank expense data"
              />
            </ChartCard>

            {/* Cash Flow Overview */}
            <ChartCard title="Cash Flow Overview">
              <GlobalBarChart
                data={cashFlow}
                height={300}
                xKey="name"
                bars={[{ key: 'value', name: 'Amount' }]}
              />
            </ChartCard>

            {/* Savings Trend */}
            <ChartCard title="Savings Trend">
              <GlobalAreaChart
                data={savingsData}
                height={300}
                xKey="month"
                series={[{ key: 'savings', name: 'Savings', color: '#3b82f6', gradId: 'sg' }]}
              />
            </ChartCard>
          </div>
        </div>
      )}
    </motion.div>
  );
}


