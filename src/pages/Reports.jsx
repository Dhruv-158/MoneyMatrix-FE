import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import html2pdf from 'html2pdf.js';
import { fetchReport, setActiveTab } from '@/redux/slices/reportSlice';
import { fetchDashboard } from '@/redux/slices/dashboardSlice';

// Components
import PageHeader from '@/components/dashboard/PageHeader';
import StatCard from '@/components/cards/StatCard';
import InsightCard from '@/components/dashboard/InsightCard';
import PdfReportDocument from '@/components/reports/PdfReportDocument';
import EmptyState from '@/components/ui/EmptyState';
import { ChartCard, GlobalBarChart, GlobalLineChart, GlobalPieChart } from '@/components/charts';

// Icons & Utilities
import { formatCurrency } from '@/utils/helpers';
import { CHART_COLORS } from '@/constants';
import { TrendingUp, TrendingDown, PiggyBank, Download, Wallet, Building2, FileText, Sparkles, ShieldAlert } from 'lucide-react';
import toastService from '@/services/toastService';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function Reports() {
  const dispatch = useDispatch();
  const { activeTab, data, loading } = useSelector((s) => s.reports);
  const { user } = useSelector((s) => s.auth);
  const { isInitialized } = useSelector((s) => s.auth);
  const { lastUpdated } = useSelector((s) => s.transactions);

  const today = new Date().toISOString().split('T')[0];
  const currentMonth = today.slice(0, 7);
  const currentYear = today.slice(0, 4);

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
      dispatch(fetchDashboard());
      const dateParam = getDateParam();
      dispatch(fetchReport({ type: activeTab, params: { date: dateParam } }));
    }
  }, [dispatch, isInitialized, activeTab, dailyDate, monthlyDate, yearlyDate, lastUpdated]);

  const handleDownloadPdf = async () => {
    const element = document.getElementById('pdf-report-document');
    if (!element) return toastService.error('PDF report template element not found');

    const dateParam = getDateParam();
    const opt = {
      margin: [0.15, 0.15, 0.15, 0.15],
      filename: `financial-report-${activeTab}-${dateParam}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#020617', windowWidth: 800 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    };

    const loadingToast = toastService.loading('Generating Executive PDF Report...');
    try {
      await html2pdf().set(opt).from(element).save();
      toastService.dismiss(loadingToast);
      toastService.success('Executive PDF Report downloaded');
    } catch (err) {
      toastService.dismiss(loadingToast);
      console.error(err);
      toastService.error('Failed to generate PDF Report');
    }
  };

  const tabs = ['daily', 'monthly', 'yearly'];
  const inputClass =
    'px-3.5 py-2 rounded-xl bg-card border border-border text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm';

  const summary = data?.summary || { income: 0, expense: 0, transfer: 0 };
  const netSavings = data?.netSavings || 0;
  const savingsRate = data?.savingsRate || (summary.income > 0 ? Math.round((netSavings / summary.income) * 100) : 0);

  const bankWise = (data?.bankWiseExpenses || []).map((b, i) => ({
    name: b.bankName || 'Unknown',
    value: b.total,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const categoryWise = (data?.categoryWiseExpenses || []).map((c, i) => ({
    name: c.name || c.category || c._id || 'Uncategorized',
    value: c.total ?? c.value ?? 0,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      {/* 1. PAGE HEADER */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Executive Financial Reports"
          subtitle="Generate structured, presentation-ready monthly statements and PDF financial summaries."
          onExport={handleDownloadPdf}
        />
      </motion.div>

      {/* 2. REPORT CONTROLS BAR */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-border">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => dispatch(setActiveTab(t))}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                activeTab === t
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t} Statement
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
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-500/25 active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Generate PDF Statement</span>
          </button>
        </div>
      </motion.div>

      {/* 3. REPORT SUMMARY CONTENT */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Income" value={summary.income} icon={TrendingUp} color="emerald" subtitle="Gross income received" />
            <StatCard title="Expense" value={summary.expense} icon={TrendingDown} color="rose" subtitle="Total operating expenses" />
            <StatCard title="Transfers" value={summary.transfer} icon={Wallet} color="blue" subtitle="Internal transfers volume" />
            <StatCard title="Net Savings" value={netSavings} icon={PiggyBank} color="purple" subtitle={`Savings Rate: ${savingsRate}%`} />
          </div>

          {/* Financial Insights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InsightCard
              icon={Sparkles}
              headline="Savings Pacing Analysis"
              explanation={`During this period, your net savings efficiency rate was ${savingsRate}%. Total retained cash balance is ${formatCurrency(netSavings)}.`}
              color="emerald"
            />
            <InsightCard
              icon={ShieldAlert}
              headline="Expense Outflow Statement"
              explanation={`Total outflows recorded for this period were ${formatCurrency(summary.expense)}. Outflows are split across connected accounts.`}
              color="amber"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Bank-wise Expenses">
              <GlobalBarChart
                layout="vertical"
                data={bankWise}
                xKey="name"
                height={260}
                bars={[{ key: 'value', name: 'Expense', color: '#3b82f6' }]}
                emptyMessage="No bank expense data"
              />
            </ChartCard>

            <ChartCard title="Category Expense Breakdown">
              <GlobalPieChart
                data={categoryWise}
                height={260}
                innerRadius={60}
                outerRadius={100}
                showLabels={true}
                emptyMessage="No category expense data"
              />
            </ChartCard>
          </div>
        </div>
      )}

      {/* HIDDEN / OFF-SCREEN EXECUTIVE PDF DOCUMENT TEMPLATE FOR HTML2PDF */}
      <div className="fixed -left-[9999px] -top-[9999px]">
        <PdfReportDocument
          data={data}
          activeTab={activeTab}
          dateParam={getDateParam()}
          user={user}
        />
      </div>
    </motion.div>
  );
}
