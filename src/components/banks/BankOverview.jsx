import React from 'react';
import { Building2, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';

export default function BankOverview({ totalBalance = 0, connectedCount = 0, savingsCount = 0, currentCount = 0 }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Section */}
        <div className="space-y-4 flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Building2 className="w-3.5 h-3.5" />
            <span>Bank & Liquidity Overview</span>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Bank Balance
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
              {formatCurrency(totalBalance)}
            </h1>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400 pt-2 border-t border-border">
            <div>
              <span>Connected Accounts: </span>
              <strong className="text-slate-900 dark:text-white">{connectedCount} Banks</strong>
            </div>
            <span>•</span>
            <div>
              <span>Savings Accounts: </span>
              <strong className="text-emerald-600 dark:text-emerald-400">{savingsCount} Accounts</strong>
            </div>
            <span>•</span>
            <div>
              <span>Current Accounts: </span>
              <strong className="text-blue-600 dark:text-blue-400">{currentCount} Accounts</strong>
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
              className="text-blue-600 stroke-blue-600 transition-all duration-700"
              strokeDasharray={`${Math.min(connectedCount * 25, 100)}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
              {connectedCount}
            </span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
              Connected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
