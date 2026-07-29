import React from 'react';
import { Tags, ShieldCheck, Lock, Layers } from 'lucide-react';

export default function CategoryOverview({ totalCats = 0, builtinCount = 0, customCount = 0, topCategory = 'None' }) {
  const builtinPercentage = totalCats > 0 ? Math.round((builtinCount / totalCats) * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Info */}
        <div className="space-y-4 flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Layers className="w-3.5 h-3.5" />
            <span>Category System Workspace</span>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Categories Registered
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
              {totalCats} Categories
            </h1>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400 pt-2 border-t border-border">
            <div>
              <span>Built-in Categories: </span>
              <strong className="text-slate-900 dark:text-white">{builtinCount} System</strong>
            </div>
            <span>•</span>
            <div>
              <span>Custom Categories: </span>
              <strong className="text-blue-600 dark:text-blue-400">{customCount} Custom</strong>
            </div>
            <span>•</span>
            <div>
              <span>Top Category: </span>
              <strong className="text-purple-600 dark:text-purple-400">{topCategory}</strong>
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
              strokeDasharray={`${builtinPercentage}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
              {totalCats}
            </span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
              Active Groups
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
