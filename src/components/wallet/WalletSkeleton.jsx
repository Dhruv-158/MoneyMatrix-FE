import React from 'react';

export default function WalletSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page Header Skeleton */}
      <div className="flex justify-between items-center pb-4 border-b border-border">
        <div className="space-y-2">
          <div className="h-7 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-4 w-72 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>
        <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>

      {/* Hero Skeleton */}
      <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800 w-full" />

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 p-4 rounded-2xl bg-card border border-border flex flex-col justify-between">
            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>

      {/* Transactions Skeleton */}
      <div className="h-72 rounded-2xl bg-card border border-border p-5" />
    </div>
  );
}
