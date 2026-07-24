import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import CustomChartTooltip from './CustomChartTooltip';

export default function GlobalPieChart({
  data = [],
  height = 280,
  innerRadius = 60,
  outerRadius = 100,
  showLabels = false,
  emptyMessage = "No data available",
}) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-slate-500 text-center py-12">{emptyMessage}</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={3}
          dataKey="value"
          label={showLabels ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%` : false}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
          ))}
        </Pie>
        <Tooltip content={<CustomChartTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
