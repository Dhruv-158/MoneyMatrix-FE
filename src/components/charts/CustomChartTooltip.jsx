import { formatCurrency } from '@/utils/helpers';

export default function CustomChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-slate-900/95 border border-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-xl text-xs space-y-1 z-50">
      {label && <p className="font-semibold text-slate-300 border-b border-white/10 pb-1 mb-1">{label}</p>}
      {payload.map((item, idx) => {
        const formattedVal = formatter
          ? formatter(item.value, item.name, item)
          : typeof item.value === 'number'
          ? formatCurrency(item.value)
          : item.value;
        const name = item.name || item.dataKey;
        const color = item.fill || item.color || item.stroke || '#3b82f6';

        return (
          <div key={idx} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-slate-400 capitalize">{name}:</span>
            </div>
            <span className="font-semibold text-white">{formattedVal}</span>
          </div>
        );
      })}
    </div>
  );
}
