import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCountUp } from 'react-countup';

function AnimatedNumber({ value, prefix = '' }) {
  const countUpRef = useRef(null);
  const { update } = useCountUp({
    ref: countUpRef,
    start: 0,
    end: value || 0,
    duration: 1.5,
    separator: ',',
    decimals: 0,
  });

  useEffect(() => { update(value || 0); }, [value, update]);

  return <><span>{prefix}</span><span ref={countUpRef} /></>;
}

export default function StatCard({ title, value, icon: Icon, trend, trendValue, color = 'blue', prefix = '₹' }) {
  const colorMap = {
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/10 text-blue-400',
    green: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/10 text-emerald-400',
    red: 'from-red-500/10 to-red-600/5 border-red-500/10 text-red-400',
    amber: 'from-amber-500/10 to-amber-600/5 border-amber-500/10 text-amber-400',
    purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/10 text-purple-400',
    cyan: 'from-cyan-500/10 to-cyan-600/5 border-cyan-500/10 text-cyan-400',
  };

  const iconColorMap = {
    blue: 'bg-blue-500/10 text-blue-400',
    green: 'bg-emerald-500/10 text-emerald-400',
    red: 'bg-red-500/10 text-red-400',
    amber: 'bg-amber-500/10 text-amber-400',
    purple: 'bg-purple-500/10 text-purple-400',
    cyan: 'bg-cyan-500/10 text-cyan-400',
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`glass-card p-5 bg-gradient-to-br ${colorMap[color]} border transition-all duration-300`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-2">
            <AnimatedNumber value={value} prefix={prefix} />
          </p>
          {trend && (
            <p className={`text-xs mt-2 font-medium ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${iconColorMap[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
