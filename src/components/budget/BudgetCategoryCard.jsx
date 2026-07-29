import React from 'react';
import { Pencil, Trash2, Lock, Tag } from 'lucide-react';

export default function BudgetCategoryCard({ category, onEdit, onDelete }) {
  const isBuiltin = category.isBuiltin;

  return (
    <div className="p-5 rounded-2xl bg-card border border-border hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {category.name}
            </h4>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {isBuiltin ? 'Built-in System Category' : 'Custom Category'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(category)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Edit Category"
          >
            <Pencil className="w-4 h-4" />
          </button>
          {!isBuiltin && (
            <button
              onClick={() => onDelete(category)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Delete Category"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
