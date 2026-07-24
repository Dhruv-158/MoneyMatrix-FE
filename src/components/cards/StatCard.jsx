import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCountUp } from 'react-countup';

function AnimatedNumber({ value, prefix = '' }) {
  const countUpRef = useRef(null);
  const { update } = useCountUp({
    ref: countUpRef,
    start: 0,
    end: value || 0,
    duration: 1.2,
    separator: ',',
    decimals: 0,
  });

  useEffect(() => { update(value || 0); }, [value, update]);

  return <><span>{prefix}</span><span ref={countUpRef} /></>;
}

export default function StatCard({ title, value, icon: Icon, trend, trendValue, color = 'blue', prefix = '₹' }) {
  const iconColorMap = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    green: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    red: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="glass-card p-5 border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 shadow-sm dark:shadow-none rounded-2xl flex flex-col justify-between"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
            <AnimatedNumber value={value} prefix={prefix} />
          </p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                trend === 'up' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' : 'text-rose-600 bg-rose-50 dark:bg-rose-500/10'
              }`}>
                {trend === 'up' ? '↑' : '↓'} {trendValue}
              </span>
              <span className="text-[11px] text-slate-400">vs last month</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-2xl border ${iconColorMap[color]} shadow-sm flex-shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
