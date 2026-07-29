import React from 'react';
import { Plus, ArrowLeftRight, Download, Calendar } from 'lucide-react';

export default function PageHeader({
  title = 'Dashboard',
  subtitle = 'Monitor your financial health, spending habits, budgets and recent activity from one place.',
  onAddTransaction,
  onTransfer,
  onExport,
}) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-border">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            {currentDate}
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-border text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export Report</span>
          </button>
        )}

        {onTransfer && (
          <button
            onClick={onTransfer}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-border text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all shadow-sm"
          >
            <ArrowLeftRight className="w-4 h-4 text-blue-500" />
            <span>Transfer</span>
          </button>
        )}

        {onAddTransaction && (
          <button
            onClick={onAddTransaction}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/25 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        )}
      </div>
    </div>
  );
}
