import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Select = forwardRef(({
  label,
  error,
  options = [],
  children,
  value,
  onChange,
  placeholder = 'Select an option...',
  className = '',
  containerClassName = '',
  name,
  disabled = false,
  required = false,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Extract option objects either from `options` prop or `children` <option> elements
  const parsedOptions = React.useMemo(() => {
    if (options && options.length > 0) {
      return options.map((opt) =>
        typeof opt === 'object' ? opt : { value: opt, label: String(opt) }
      );
    }
    if (children) {
      const childArray = React.Children.toArray(children);
      return childArray
        .filter((child) => React.isValidElement(child) && child.type === 'option')
        .map((child) => ({
          value: child.props.value !== undefined ? child.props.value : child.props.children,
          label: child.props.children,
          disabled: child.props.disabled,
        }));
    }
    return [];
  }, [options, children]);

  // Find currently selected option
  const selectedOption = parsedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelectOption = (optValue) => {
    if (disabled) return;
    if (onChange) {
      // Synthesize event to remain 100% compatible with native onChange event listeners
      const syntheticEvent = {
        target: { name, value: optValue },
        currentTarget: { name, value: optValue },
      };
      onChange(syntheticEvent);
    }
    setIsOpen(false);
  };

  return (
    <div className={`w-full ${containerClassName}`} ref={dropdownRef}>
      {label && (
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Custom Trigger Button */}
        <button
          type="button"
          ref={ref}
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
          className={`w-full h-11 px-4 rounded-xl bg-card border border-border text-slate-900 dark:text-white text-xs font-bold flex items-center justify-between transition-all duration-200 cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-blue-500/40 ${
            isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : ''
          } ${error ? '!border-rose-500 !ring-rose-500/20' : ''} ${
            disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-900' : ''
          } ${className}`}
          {...props}
        >
          <span className={`truncate ${!selectedOption ? 'text-slate-400 dark:text-slate-500 font-medium' : ''}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${
              isOpen ? 'rotate-180 text-blue-500' : ''
            }`}
          />
        </button>

        {/* Floating Custom Dropdown Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-60 overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl p-1.5 scrollbar-thin divide-y divide-border/50"
            >
              {parsedOptions.length > 0 ? (
                parsedOptions.map((opt, idx) => {
                  const isSelected = String(opt.value) === String(value);
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => handleSelectOption(opt.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors duration-150 cursor-pointer text-left ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                      } ${opt.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-2" />}
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-3 text-xs text-slate-400 text-center font-medium">
                  No options available
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && <p className="mt-1 text-xs text-rose-500 font-bold">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
