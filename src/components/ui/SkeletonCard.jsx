export default function SkeletonCard({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-5 animate-pulse">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="h-3 bg-white/5 rounded w-24" />
              <div className="h-7 bg-white/5 rounded w-36" />
              <div className="h-3 bg-white/5 rounded w-20" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5" />
          </div>
        </div>
      ))}
    </>
  );
}
