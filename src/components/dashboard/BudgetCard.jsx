import React from 'react';
import { formatCurrency } from '@/utils/helpers';

export default function BudgetCard({ category, spent = 0, limit = 0, icon: Icon }) {
  const percentage = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;
  const remaining = Math.max(limit - spent, 0);

  const getStatusColor = () => {
    if (percentage >= 90) return 'bg-rose-500 text-rose-500';
    if (percentage >= 75) return 'bg-amber-500 text-amber-500';
    return 'bg-blue-600 text-blue-600';
  };

  const statusColor = getStatusColor();

  return (
    <div className="p-4 rounded-2xl bg-card border border-border hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{category}</h4>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {percentage}% used
            </span>
          </div>
        </div>
        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
          {formatCurrency(spent)} <span className="text-slate-400 font-normal">/ {formatCurrency(limit)}</span>
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${statusColor.split(' ')[0]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between items-center mt-2.5 text-[11px]">
        <span className="text-slate-500 dark:text-slate-400 font-medium">Remaining</span>
        <span className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(remaining)}</span>
      </div>
    </div>
  );
}
