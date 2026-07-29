import React from 'react';
import { CalendarClock, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/helpers';

export default function UpcomingBillsWidget({ emis = [], onPay, onViewAll }) {
  const activeEmis = emis.filter((e) => e.isActive).slice(0, 4);

  return (
    <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <CalendarClock className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
            Upcoming Bills & EMIs
          </h3>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {activeEmis.length > 0 ? (
        <div className="divide-y divide-border">
          {activeEmis.map((bill) => (
            <div key={bill._id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {bill.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium capitalize">
                    Due: {formatDate(bill.nextDueDate)} • {bill.frequency}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {formatCurrency(bill.amount)}
                </span>
                {onPay && (
                  <button
                    onClick={() => onPay(bill)}
                    className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-[11px] transition"
                  >
                    Pay
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
          No upcoming bills or EMI auto-debits scheduled.
        </div>
      )}
    </div>
  );
}
