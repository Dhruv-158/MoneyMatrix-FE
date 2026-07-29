import React from 'react';

export default function BankSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center pb-4 border-b border-border">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-4 w-72 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>
        <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>

      {/* Overview Skeleton */}
      <div className="h-52 rounded-3xl bg-slate-200 dark:bg-slate-800 w-full" />

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 p-4 rounded-2xl bg-card border border-border flex flex-col justify-between">
            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-[1.586/1] rounded-3xl bg-slate-200 dark:bg-slate-800 p-6" />
        ))}
      </div>
    </div>
  );
}
