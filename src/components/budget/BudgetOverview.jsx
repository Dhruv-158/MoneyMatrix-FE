import React from 'react';
import { Target, TrendingUp, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';

export default function BudgetOverview({
  totalBudget = 0,
  totalSpent = 0,
  daysRemaining = 0,
  monthlyGoal = 0,
}) {
  const remainingBudget = Math.max(totalBudget - totalSpent, 0);
  const utilizationPercentage = totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;

  const getStatusColor = () => {
    if (utilizationPercentage >= 90) return 'text-rose-500 stroke-rose-500 bg-rose-500';
    if (utilizationPercentage >= 75) return 'text-amber-500 stroke-amber-500 bg-amber-500';
    return 'text-blue-600 stroke-blue-600 bg-blue-600';
  };

  const statusColor = getStatusColor();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Info Column */}
        <div className="space-y-4 flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Target className="w-3.5 h-3.5" />
            <span>July 2026 Monthly Budget Plan</span>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Remaining Budget
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
              {formatCurrency(remainingBudget)}
            </h1>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400 pt-2 border-t border-border">
            <div>
              <span>Total Allocated: </span>
              <strong className="text-slate-900 dark:text-white">{formatCurrency(totalBudget)}</strong>
            </div>
            <span>•</span>
            <div>
              <span>Total Spent: </span>
              <strong className="text-slate-900 dark:text-white">{formatCurrency(totalSpent)}</strong>
            </div>
            <span>•</span>
            <div>
              <span>Days Left: </span>
              <strong className="text-blue-600 dark:text-blue-400">{daysRemaining} Days</strong>
            </div>
          </div>
        </div>

        {/* Right Circular Gauge */}
        <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={`transition-all duration-700 ${statusColor.split(' ')[1]}`}
              strokeDasharray={`${utilizationPercentage}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
              {utilizationPercentage}%
            </span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
              Utilized
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
