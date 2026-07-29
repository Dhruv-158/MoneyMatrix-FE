import React from 'react';

export default function ActiveFilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold transition"
        title="Remove filter"
      >
        ×
      </button>
    </span>
  );
}
