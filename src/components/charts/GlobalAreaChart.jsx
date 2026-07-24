import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import CustomChartTooltip from './CustomChartTooltip';

export default function GlobalAreaChart({
  data = [],
  height = 280,
  xKey = 'month',
  series = [
    { key: 'income', name: 'Income', color: '#22c55e', gradId: 'incomeGrad' },
    { key: 'expense', name: 'Expense', color: '#ef4444', gradId: 'expenseGrad' }
  ],
  showLegend = false,
  emptyMessage = "No data available",
}) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-slate-500 text-center py-12">{emptyMessage}</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={s.gradId || `${s.key}Grad`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey={xKey} stroke="#64748b" fontSize={12} />
        <YAxis stroke="#64748b" fontSize={12} />
        <Tooltip content={<CustomChartTooltip />} />
        {showLegend && <Legend />}
        {series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name || s.key}
            stroke={s.color}
            fill={`url(#${s.gradId || `${s.key}Grad`})`}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
