import React from 'react';
import { ShieldAlert, Clock, ArrowUpRight, Lock } from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';

export default function CashHoldOverview({ availableBalance = 0, holdBalance = 0, pendingCount = 0 }) {
  const totalBalance = availableBalance + holdBalance;
  const holdPercentage = totalBalance > 0 ? Math.round((holdBalance / totalBalance) * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Info */}
        <div className="space-y-4 flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Lock className="w-3.5 h-3.5" />
            <span>Cash Hold & Pending Settlement Monitor</span>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Currently Held Balance
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
              {formatCurrency(holdBalance)}
            </h1>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400 pt-2 border-t border-border">
            <div>
              <span>Available Cash: </span>
              <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(availableBalance)}</strong>
            </div>
            <span>•</span>
            <div>
              <span>Active Holds: </span>
              <strong className="text-slate-900 dark:text-white">{pendingCount} Items</strong>
            </div>
            <span>•</span>
            <div>
              <span>Hold Ratio: </span>
              <strong className="text-amber-600 dark:text-amber-400">{holdPercentage}%</strong>
            </div>
          </div>
        </div>

        {/* Right Circular Utilization Gauge */}
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
              className="text-amber-500 stroke-amber-500 transition-all duration-700"
              strokeDasharray={`${holdPercentage}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
              {holdPercentage}%
            </span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
              On Hold
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
