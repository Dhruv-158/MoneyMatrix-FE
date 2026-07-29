import React from 'react';

export default function QuickActionCard({ icon: Icon, title, description, onClick, color = 'blue' }) {
  const colorStyles = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500 group-hover:text-white',
  };

  return (
    <button
      onClick={onClick}
      className="group text-left p-4 rounded-2xl bg-card border border-border hover:border-blue-500/30 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center justify-between"
    >
      <div className="flex items-center gap-3.5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200 ${colorStyles[color] || colorStyles.blue}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium line-clamp-1">
            {description}
          </p>
        </div>
      </div>
      <span className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all text-xs font-bold pl-2">
        →
      </span>
    </button>
  );
}
