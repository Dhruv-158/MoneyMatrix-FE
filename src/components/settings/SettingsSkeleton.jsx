import React from 'react';

export default function SettingsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center pb-4 border-b border-border">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-4 w-80 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>
        <div className="h-10 w-44 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>

      {/* Grid Layout Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-10 rounded-xl bg-slate-200 dark:bg-slate-800 w-full" />
          ))}
        </div>
        <div className="md:col-span-3 space-y-6">
          <div className="h-64 rounded-2xl bg-card border border-border p-6" />
          <div className="h-48 rounded-2xl bg-card border border-border p-6" />
        </div>
      </div>
    </div>
  );
}
