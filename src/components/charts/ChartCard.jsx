export default function ChartCard({ title, children, action }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {action && action}
      </div>
      {children}
    </div>
  );
}
