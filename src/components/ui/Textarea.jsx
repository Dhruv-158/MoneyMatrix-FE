import React, { forwardRef } from 'react';

const Textarea = forwardRef(({ label, error, className = '', containerClassName = '', ...props }, ref) => {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && <label className="pretty-label">{label}</label>}
      <textarea
        ref={ref}
        className={`pretty-input resize-none ${error ? '!border-red-500 !ring-red-500/20' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;
