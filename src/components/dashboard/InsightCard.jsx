import React from 'react';

export default function InsightCard({ icon: Icon, headline, explanation, actionText, onAction, color = 'blue' }) {
  const colorStyles = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  };

  return (
    <div className="p-4 rounded-2xl bg-card border border-border flex items-start gap-3.5 shadow-sm hover:shadow-md transition-all">
      {Icon && (
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${colorStyles[color] || colorStyles.blue}`}>
          <Icon className="w-4 h-4" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
          {headline}
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          {explanation}
        </p>
        {actionText && onAction && (
          <button
            onClick={onAction}
            className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            {actionText} →
          </button>
        )}
      </div>
    </div>
  );
}
