import React from 'react';

export default function TransactionSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Search & Filter Header Skeleton */}
      <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 p-4 rounded-2xl bg-card border border-border flex flex-col justify-between">
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-6 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="rounded-2xl border border-border overflow-hidden bg-card">
        <div className="p-4 border-b border-border h-10 bg-slate-100 dark:bg-slate-900/50" />
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-1.5">
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              </div>
              <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
