import React from 'react';
import { Trash2, Download, CheckCircle, Tag, X } from 'lucide-react';

export default function BulkActionToolbar({ selectedCount = 0, onClear, onDelete, onExport }) {
  if (!selectedCount) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-5 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-800 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-2 border-r border-slate-800 pr-4">
        <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[11px] font-bold flex items-center justify-center">
          {selectedCount}
        </span>
        <span className="text-xs font-semibold text-slate-300">Selected</span>
        <button onClick={onClear} className="text-slate-400 hover:text-white ml-1" title="Clear selection">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        )}

        {onDelete && (
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-xs font-semibold text-rose-400 border border-rose-500/30 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        )}
      </div>
    </div>
  );
}
