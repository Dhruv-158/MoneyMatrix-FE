import React from 'react';

export default function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center pb-4 border-b border-border">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-4 w-80 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-24 p-4 rounded-2xl bg-card border border-border flex flex-col justify-between">
            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 rounded-2xl bg-card border border-border p-5" />
        <div className="h-80 rounded-2xl bg-card border border-border p-5" />
      </div>
    </div>
  );
}
