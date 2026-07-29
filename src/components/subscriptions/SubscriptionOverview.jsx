import React from 'react';
import { RefreshCw, Sparkles, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';

export default function SubscriptionOverview({ monthlyTotal = 0, annualTotal = 0, activeCount = 0, avgMonthly = 0 }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Section */}
        <div className="space-y-4 flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recurring Subscription Hub</span>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Monthly Recurring Total
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
              {formatCurrency(monthlyTotal)}
            </h1>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400 pt-2 border-t border-border">
            <div>
              <span>Annualized Spending: </span>
              <strong className="text-slate-900 dark:text-white">{formatCurrency(annualTotal)}</strong>
            </div>
            <span>•</span>
            <div>
              <span>Active Subscriptions: </span>
              <strong className="text-purple-600 dark:text-purple-400">{activeCount} Services</strong>
            </div>
            <span>•</span>
            <div>
              <span>Avg Monthly Cost: </span>
              <strong className="text-slate-900 dark:text-white">{formatCurrency(avgMonthly)}</strong>
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
              className="text-purple-600 stroke-purple-600 transition-all duration-700"
              strokeDasharray={`${Math.min(activeCount * 20, 100)}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
              {activeCount}
            </span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
              Active Plans
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
