import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, error, icon: Icon, className = '', containerClassName = '', ...props }, ref) => {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && <label className="pretty-label">{label}</label>}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          className={`pretty-input ${Icon ? 'pl-10' : ''} ${error ? '!border-red-500 !ring-red-500/20' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
