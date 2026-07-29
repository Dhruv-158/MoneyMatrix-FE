import React from 'react';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center pb-4 border-b border-border">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-4 w-80 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-9 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 p-5 rounded-2xl bg-card border border-border flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>

      {/* Analytics Chart Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 h-80 rounded-2xl bg-card border border-border p-5" />
        <div className="h-80 rounded-2xl bg-card border border-border p-5" />
      </div>

      {/* Bottom Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 h-72 rounded-2xl bg-card border border-border p-5" />
        <div className="h-72 rounded-2xl bg-card border border-border p-5" />
      </div>
    </div>
  );
}
