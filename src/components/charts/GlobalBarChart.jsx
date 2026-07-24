import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import CustomChartTooltip from './CustomChartTooltip';

export default function GlobalBarChart({
  data = [],
  height = 300,
  layout = 'horizontal',
  xKey = 'name',
  bars = [{ key: 'value', name: 'Amount', color: '#3b82f6' }],
  cellColors = null,
  showLegend = false,
  maxBarSize = 40,
  margin = { top: 10, right: 20, left: 10, bottom: 5 },
  emptyMessage = "No data available",
}) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-slate-500 text-center py-12">{emptyMessage}</p>;
  }

  const isVertical = layout === 'vertical';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart layout={layout} data={data} margin={margin}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.05)"
          horizontal={!isVertical}
          vertical={isVertical}
        />

        {isVertical ? (
          <>
            <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v}`} />
            <YAxis type="category" dataKey={xKey} stroke="#64748b" fontSize={12} width={100} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
          </>
        )}

        <Tooltip content={<CustomChartTooltip />} />
        {showLegend && <Legend />}

        {bars.map((barItem) => (
          <Bar
            key={barItem.key}
            dataKey={barItem.key}
            name={barItem.name || barItem.key}
            fill={barItem.color || '#3b82f6'}
            radius={isVertical ? [0, 6, 6, 0] : [6, 6, 0, 0]}
            maxBarSize={maxBarSize}
          >
            {cellColors &&
              data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={cellColors[index % cellColors.length] || entry.color || barItem.color}
                />
              ))}
            {!cellColors &&
              data[0]?.color &&
              data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || barItem.color} />
              ))}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
