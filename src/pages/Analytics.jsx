import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchReport } from '@/redux/slices/reportSlice';
import ChartCard from '@/components/charts/ChartCard';
import { CHART_COLORS } from '@/constants';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Analytics() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((s) => s.reports);
  const { isInitialized } = useSelector((s) => s.auth);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => { if (isInitialized) dispatch(fetchReport({ type: 'monthly', params: { date } })); }, [dispatch, isInitialized, date]);

  const categoryWise = (data?.categoryWiseExpenses || []).map((c, i) => ({ name: c.category || 'Unknown', value: c.total, color: CHART_COLORS[i % CHART_COLORS.length] }));
  const bankWise = (data?.bankWiseExpenses || []).map((b, i) => ({ name: b.bankName || 'Unknown', value: b.total, color: CHART_COLORS[i % CHART_COLORS.length] }));
  const summary = data?.summary || {};
  const cashFlow = [{ name: 'Income', value: summary.income || 0 }, { name: 'Expense', value: summary.expense || 0 }, { name: 'Savings', value: data?.netSavings || 0 }];

  const ttStyle = { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: 12 };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Analytics</h2>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="px-3 py-2 rounded-lg bg-card border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
      </div>

      {loading ? <div className="py-16 text-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></div> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Category-wise Expenses">
            {categoryWise.length ? <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={categoryWise} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>{categoryWise.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip contentStyle={ttStyle} /></PieChart></ResponsiveContainer>
            : <p className="text-sm text-slate-500 text-center py-12">No data</p>}
          </ChartCard>

          <ChartCard title="Bank-wise Expenses">
            {bankWise.length ? <ResponsiveContainer width="100%" height={300}><BarChart data={bankWise}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" /><XAxis dataKey="name" stroke="#64748b" fontSize={11} /><YAxis stroke="#64748b" fontSize={11} /><Tooltip contentStyle={ttStyle} /><Bar dataKey="value" radius={[6,6,0,0]}>{bankWise.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar></BarChart></ResponsiveContainer>
            : <p className="text-sm text-slate-500 text-center py-12">No data</p>}
          </ChartCard>

          <ChartCard title="Cash Flow Overview">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cashFlow}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" /><XAxis dataKey="name" stroke="#64748b" fontSize={12} /><YAxis stroke="#64748b" fontSize={12} /><Tooltip contentStyle={ttStyle} /><Bar dataKey="value" radius={[6,6,0,0]}>{cashFlow.map((e, i) => <Cell key={i} fill={['#22c55e','#ef4444','#3b82f6'][i]} />)}</Bar></BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Savings Trend">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={[{ month: 'Current', savings: data?.netSavings || 0, income: summary.income || 0, expense: summary.expense || 0 }]}>
                <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" /><XAxis dataKey="month" stroke="#64748b" fontSize={12} /><YAxis stroke="#64748b" fontSize={12} /><Tooltip contentStyle={ttStyle} /><Area type="monotone" dataKey="savings" stroke="#3b82f6" fill="url(#sg)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </motion.div>
  );
}
