import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import CustomChartTooltip from './CustomChartTooltip';

export default function GlobalLineChart({
  data = [],
  height = 320,
  xKey = 'date',
  series = [
    { key: 'income', name: 'Income', color: '#10b981' },
    { key: 'expense', name: 'Expense', color: '#ef4444' }
  ],
  showLegend = true,
  emptyMessage = "No data available",
}) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-slate-500 text-center py-12">{emptyMessage}</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey={xKey} stroke="#64748b" fontSize={11} />
        <YAxis stroke="#64748b" fontSize={11} />
        <Tooltip content={<CustomChartTooltip />} />
        {showLegend && <Legend />}
        {series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name || s.key}
            stroke={s.color}
            dot={{ fill: s.color, r: 4 }}
            activeDot={{ r: 6 }}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
