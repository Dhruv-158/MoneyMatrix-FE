import React from 'react';
import { formatDate } from '@/utils/helpers';

export default function ActivityTimeline({ activities = [] }) {
  if (!activities.length) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
        No recent activity record.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
      {activities.map((act, i) => (
        <div key={act.id || i} className="relative flex items-start gap-3 text-xs">
          <div className={`absolute -left-6 top-0.5 w-3 h-3 rounded-full border-2 border-card ${act.dotColor || 'bg-blue-500'}`} />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 dark:text-white leading-snug">
              {act.title}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
              {act.description}
            </p>
          </div>
          <span className="text-[10px] text-slate-400 shrink-0 font-medium">
            {formatDate(act.timestamp)}
          </span>
        </div>
      ))}
    </div>
  );
}
