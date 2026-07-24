import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({ label, error, options = [], children, className = '', containerClassName = '', ...props }, ref) => {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && <label className="pretty-label">{label}</label>}
      <div className="relative flex items-center">
        <select
          ref={ref}
          className={`pretty-select ${error ? '!border-red-500 !ring-red-500/20' : ''} ${className}`}
          {...props}
        >
          {children ? children : options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 pointer-events-none" />
      </div>
      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
