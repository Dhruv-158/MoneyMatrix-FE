import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import html2pdf from 'html2pdf.js';
import { fetchReport, setActiveTab } from '@/redux/slices/reportSlice';
import { fetchDashboard } from '@/redux/slices/dashboardSlice';
import StatCard from '@/components/cards/StatCard';
import { ChartCard, GlobalBarChart, GlobalLineChart } from '@/components/charts';
import { formatCurrency } from '@/utils/helpers';
import { CHART_COLORS } from '@/constants';
import { TrendingUp, TrendingDown, PiggyBank, Download, Wallet, Building2, Banknote } from 'lucide-react';
import { pdfService } from '@/services/endpoints';
import toast from 'react-hot-toast';

export default function Reports() {
  const dispatch = useDispatch();
  const { activeTab, data, loading } = useSelector((s) => s.reports);
  const { isInitialized } = useSelector((s) => s.auth);
  const { lastUpdated } = useSelector((s) => s.transactions);
  const { totalBalance, cashBalance, totalBankBalance } = useSelector((s) => s.dashboard);
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = today.slice(0, 7); // YYYY-MM
  const currentYear = today.slice(0, 4); // YYYY
  
  const [dailyDate, setDailyDate] = useState(today);
  const [monthlyDate, setMonthlyDate] = useState(currentMonth);
  const [yearlyDate, setYearlyDate] = useState(currentYear);
  const [chartFilter, setChartFilter] = useState('both'); // 'income', 'expense', 'both'

  const getDateParam = () => {
    if (activeTab === 'daily') return dailyDate;
    if (activeTab === 'monthly') return `${monthlyDate}-01`; // API expects YYYY-MM-DD
    if (activeTab === 'yearly') return `${yearlyDate}-01-01`; // API expects YYYY-MM-DD
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
    const element = document.getElementById('report-content');
    if (!element) return toast.error('Report content not found');

    const dateParam = getDateParam();
    const opt = {
      margin:       [0.3, 0.3, 0.3, 0.3],
      filename:     `report-${activeTab}-${dateParam}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#0f172a' },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    const loadingToast = toast.loading('Generating PDF...');
    try {
      await html2pdf().set(opt).from(element).save();
      toast.dismiss(loadingToast);
      toast.success('PDF downloaded');
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error(err);
      toast.error('Failed to generate PDF');
    }
  };

  const tabs = ['daily', 'monthly', 'yearly'];
  const inputClass = 'px-3 py-2 rounded-lg bg-card border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50';

  const summary = data?.summary || { income: 0, expense: 0, transfer: 0 };
  const bankWise = (data?.bankWiseExpenses || []).map((b, i) => ({ name: b.bankName || 'Unknown', value: b.total, color: CHART_COLORS[i % CHART_COLORS.length] }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Tab Buttons */}
        <div className="flex gap-2">
          {tabs.map(t => (
            <button key={t} onClick={() => dispatch(setActiveTab(t))} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${activeTab === t ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-slate-400 border border-white/5 hover:border-white/10'}`}>{t}</button>
          ))}
        </div>

        {/* Dynamic Filter Controls */}
        <div className="flex gap-2 flex-wrap">
          {activeTab === 'daily' && (
            <input 
              type="date" 
              value={dailyDate} 
              onChange={e => setDailyDate(e.target.value)} 
              className={inputClass}
              title="Select a specific date"
            />
          )}
          
          {activeTab === 'monthly' && (
            <input 
              type="month" 
              value={monthlyDate} 
              onChange={e => setMonthlyDate(e.target.value)} 
              className={inputClass}
              title="Select a month"
            />
          )}
          
          {activeTab === 'yearly' && (
            <input 
              type="number" 
              value={yearlyDate} 
              onChange={e => setYearlyDate(e.target.value)} 
              min="2000"
              max="2099"
              className={inputClass}
              title="Select a year"
              placeholder="YYYY"
            />
          )}

          <button 
            onClick={handleDownloadPdf} 
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white text-sm transition" 
            title="Download PDF"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      {loading ? <div className="py-16 text-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></div> : (
        <div id="report-content" className="space-y-6 p-4 rounded-xl bg-slate-900/60 border border-white/5">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Income" value={summary.income} icon={TrendingUp} color="green" />
            <StatCard title="Expense" value={summary.expense} icon={TrendingDown} color="red" />
            <StatCard title="Transfers" value={summary.transfer} icon={TrendingUp} color="blue" />
            <StatCard title="Net Savings" value={data?.netSavings || 0} icon={PiggyBank} color="amber" />
          </div>

          {/* Cash Flow Overview - Cash Inflow vs Outflow */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">💵 Cash Wallet Overview</p>
                <p className="text-3xl font-bold text-cyan-400">{formatCurrency(data?.cashBalance || 0)}</p>
              </div>
              <Wallet className="w-12 h-12 text-cyan-400/30" />
            </div>
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 text-sm">
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Cash Inflow (From Bank)</p>
                <p className="text-emerald-400 font-bold text-base mt-0.5">+{formatCurrency(data?.cashWithdrawals || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Cash Outflow (Expenses)</p>
                <p className="text-red-400 font-bold text-base mt-0.5">-{formatCurrency(data?.cashExpenses || 0)}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs text-slate-400 uppercase font-semibold">Total Transfers Activity</p>
                <p className="text-blue-400 font-bold text-base mt-0.5">{formatCurrency(data?.transfers || 0)}</p>
              </div>
            </div>
          </motion.div>

          {/* Total Balance Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-2">💎 Total Balance</p>
                <p className="text-3xl font-bold text-blue-400">
                  {formatCurrency(data?.netSavings || 0)}
                </p>
              </div>
              <PiggyBank className="w-12 h-12 text-blue-400/30" />
            </div>
            <div className="mt-4 flex gap-4 text-sm">
              <div>
                <p className="text-slate-500">Total Cash Balance</p>
                <p className="text-cyan-400 font-semibold">{formatCurrency(data?.cashBalance || 0)}</p>
              </div>
              <div>
                <p className="text-slate-500">Total Bank Balance</p>
                <p className="text-blue-400 font-semibold">{formatCurrency(data?.bankBalances?.reduce((sum, b) => sum + (b.balance || 0), 0) || 0)}</p>
              </div>
            </div>
          </motion.div>

          {/* Bank-wise Expenses Chart (Horizontal Bar Chart) */}
          <ChartCard title="Bank-wise Expenses">
            <GlobalBarChart
              layout="vertical"
              data={bankWise}
              xKey="name"
              height={Math.max(200, bankWise.length * 60)}
              bars={[{ key: 'value', name: 'Expense', color: '#3b82f6' }]}
              emptyMessage="No data"
            />
          </ChartCard>

          {/* Income vs Expense Trend - Grouped Bar Chart for sparse dates, LineChart for continuous data */}
          {(activeTab === 'monthly' || activeTab === 'yearly') && data?.dailyBreakdown && data.dailyBreakdown.length > 0 && (
            <ChartCard title="Income vs Expense Trend">
              <div className="mb-4 flex gap-2">
                <button onClick={() => setChartFilter('both')} className={`px-3 py-1 rounded-lg text-sm transition ${chartFilter === 'both' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20'}`}>Both</button>
                <button onClick={() => setChartFilter('income')} className={`px-3 py-1 rounded-lg text-sm transition ${chartFilter === 'income' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20'}`}>Income</button>
                <button onClick={() => setChartFilter('expense')} className={`px-3 py-1 rounded-lg text-sm transition ${chartFilter === 'expense' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20'}`}>Expense</button>
              </div>
              {data.dailyBreakdown.length <= 4 ? (
                <GlobalBarChart
                  data={data.dailyBreakdown}
                  xKey="date"
                  height={320}
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
                  height={320}
                  showLegend={true}
                  series={[
                    { key: 'income', name: 'Income', color: '#10b981' },
                    { key: 'expense', name: 'Expense', color: '#ef4444' },
                  ].filter((s) => chartFilter === 'both' || chartFilter === s.key)}
                />
              )}
            </ChartCard>
          )}

          {/* Bank Balances Grid */}
          {data?.bankBalances?.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-4">🏦 Bank Balances</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {data.bankBalances.map(b => (
                  <div key={b._id} className="p-4 rounded-lg bg-background/50 border border-white/5 hover:border-white/10 transition">
                    <p className="text-xs text-slate-500 mb-2">{b.bankName}</p>
                    <p className="text-lg font-semibold text-blue-400">{formatCurrency(b.currentBalance)}</p>
                    <p className="text-xs text-slate-600 mt-1">{b.accountType}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Transaction Summary */}
          {data?.transactionCount && data.transactionCount.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Transaction Count</h3>
              <div className="grid grid-cols-3 gap-3">
                {data.transactionCount.map(t => (
                  <div key={t._id} className="p-3 rounded-lg bg-background/50 border border-white/5 text-center">
                    <p className="text-xs text-slate-500 capitalize">{t._id}</p>
                    <p className="text-lg font-semibold text-white mt-1">{t.count}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}
