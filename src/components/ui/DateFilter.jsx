import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, isBefore, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import 'react-day-picker/dist/style.css';

export default function DateFilter({ onApply }) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0 - 11

  // 1. Core State
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  
  // State for single day selection or range state:
  // range: { from: Date | undefined, to: Date | undefined }
  // isRangeStarted: boolean (true after 1st double click, waiting for 2nd double click)
  const [range, setRange] = useState({
    from: new Date(),
    to: undefined,
  });
  const [isRangeStarted, setIsRangeStarted] = useState(false);

  const clickTimerRef = useRef(null);

  // Calendar open popover state
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  // Month Names
  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate Year options
  const yearsList = [];
  for (let y = 2020; y <= currentYear + 5; y++) {
    yearsList.push(y);
  }

  // Month displayed inside the calendar (React Day Picker v9 month prop)
  const monthToDisplay = new Date(selectedYear, selectedMonth, 1);

  // Close calendar popover on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Direct Year dropdown change handler
  const handleYearChange = (e) => {
    setSelectedYear(Number(e.target.value));
  };

  // Direct Month dropdown change handler
  const handleMonthChange = (e) => {
    setSelectedMonth(Number(e.target.value));
  };

  /**
   * Click Handling with Timer to distinguish Single Click vs Double Click cleanly:
   * - Single click: selects single date ONLY and clears any range.
   * - Double click (1st time): starts a range (from = date, to = undefined).
   * - Double click (2nd time): completes the range (from = earlier, to = later).
   */
  const handleDayClick = (day) => {
    if (!day) return;
    setSelectedYear(day.getFullYear());
    setSelectedMonth(day.getMonth());

    if (clickTimerRef.current) {
      // Double Click Detected!
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;

      if (!isRangeStarted) {
        // 1st Double Click: Start Range
        setRange({ from: day, to: undefined });
        setIsRangeStarted(true);
      } else {
        // 2nd Double Click: Complete Range
        const start = range.from || day;
        if (isBefore(day, start)) {
          setRange({ from: day, to: start });
        } else {
          setRange({ from: start, to: day });
        }
        setIsRangeStarted(false);
      }
    } else {
      // Set timer to wait for possible 2nd click of double click
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null;
        // Single Click Confirmed: Select single day only, clear range
        setRange({ from: day, to: undefined });
        setIsRangeStarted(false);
      }, 250);
    }
  };

  // Format string for Day field input
  const formatDayInputValue = () => {
    if (range.from && range.to) {
      return `${format(range.from, 'dd MMM yyyy')} → ${format(range.to, 'dd MMM yyyy')}`;
    }
    if (range.from) {
      return format(range.from, 'dd MMM yyyy');
    }
    return 'Select Date';
  };

  // Apply Filter Callback
  const handleApply = () => {
    if (!onApply) return;
    
    let startDateFormatted = '';
    let endDateFormatted = '';

    if (range.from && range.to) {
      startDateFormatted = format(range.from, 'yyyy-MM-dd');
      endDateFormatted = format(range.to, 'yyyy-MM-dd');
    } else if (range.from) {
      startDateFormatted = format(range.from, 'yyyy-MM-dd');
      endDateFormatted = format(range.from, 'yyyy-MM-dd');
    }

    onApply({
      year: selectedYear,
      month: selectedMonth + 1, // 1-indexed (1 = Jan)
      startDate: startDateFormatted,
      endDate: endDateFormatted,
    });

    setIsOpen(false);
  };

  return (
    <div className="w-full space-y-4">
      {/* 3 Fields in One Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        {/* Year Field */}
        <div className="space-y-1">
          <label className="text-xs text-slate-400 font-medium">Year</label>
          <div className="relative">
            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="w-full px-3 py-2 text-sm rounded-lg bg-card border border-white/10 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer pr-8"
            >
              {yearsList.map((y) => (
                <option key={y} value={y} className="bg-slate-900 text-white">
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Month Field */}
        <div className="space-y-1">
          <label className="text-xs text-slate-400 font-medium">Month</label>
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={handleMonthChange}
              className="w-full px-3 py-2 text-sm rounded-lg bg-card border border-white/10 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer pr-8"
            >
              {monthsList.map((m, index) => (
                <option key={m} value={index} className="bg-slate-900 text-white">
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Day Field */}
        <div className="space-y-1 relative" ref={popoverRef}>
          <label className="text-xs text-slate-400 font-medium">Day</label>
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between px-3 py-2 text-sm rounded-lg bg-card border border-white/10 text-white cursor-pointer hover:border-white/20 transition focus:ring-2 focus:ring-blue-500/50"
          >
            <span className="truncate">{formatDayInputValue()}</span>
            <CalendarIcon className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
          </div>

          {/* Calendar Popover using React Day Picker v9 */}
          {isOpen && (
            <div className="absolute top-full left-0 mt-2 z-50 p-4 bg-slate-950/95 border border-white/15 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl ring-1 ring-white/10 min-w-[310px]">
              <DayPicker
                month={monthToDisplay}
                onMonthChange={(newMonth) => {
                  setSelectedYear(newMonth.getFullYear());
                  setSelectedMonth(newMonth.getMonth());
                }}
                onDayClick={handleDayClick}
                startMonth={new Date(2020, 0)}
                endMonth={new Date(currentYear + 5, 11)}
                modifiers={{
                  selected_single: (date) =>
                    Boolean(range.from && !range.to && isSameDay(date, range.from)),
                  range_start: (date) =>
                    Boolean(range.from && range.to && isSameDay(date, range.from)),
                  range_end: (date) =>
                    Boolean(range.from && range.to && isSameDay(date, range.to)),
                  range_middle: (date) =>
                    Boolean(
                      range.from &&
                        range.to &&
                        isBefore(range.from, date) &&
                        isBefore(date, range.to)
                    ),
                }}
                modifiersClassNames={{
                  selected_single: '!bg-gradient-to-r !from-blue-600 !to-blue-500 !text-white !rounded-lg font-bold shadow-lg shadow-blue-500/30 scale-105 transition-all',
                  range_start: '!bg-blue-600 !text-white !rounded-l-lg font-bold shadow-md shadow-blue-600/40',
                  range_end: '!bg-blue-600 !text-white !rounded-r-lg font-bold shadow-md shadow-blue-600/40',
                  range_middle: '!bg-blue-500/20 !text-blue-200 !rounded-none border-y border-blue-500/30',
                }}
                className="text-white p-0"
                classNames={{
                  months: 'flex flex-col space-y-3',
                  month: 'space-y-3',
                  caption: 'flex justify-between items-center px-1 pb-2 border-b border-white/10',
                  caption_label: 'text-sm font-bold text-white tracking-wide', 
                  dropdowns: 'flex items-center gap-1.5',
                  dropdown: 'bg-slate-900 text-slate-200 text-xs font-medium rounded-lg border border-white/10 px-2 py-1 cursor-pointer hover:border-blue-500/50 focus:ring-1 focus:ring-blue-500 transition-all outline-none',
                  nav: 'flex items-center gap-1',
                  button_previous: 'p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all',
                  button_next: 'p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all',
                  month_grid: 'w-full border-collapse space-y-1',
                  weekdays: 'flex justify-between pb-1 border-b border-white/5',
                  weekday: 'text-slate-400 text-xs font-semibold w-9 text-center uppercase tracking-wider',
                  week: 'flex w-full justify-between mt-1.5',
                  day: 'h-9 w-9 p-0 text-xs font-medium hover:bg-blue-500/25 hover:text-white text-slate-200 rounded-lg transition-all flex items-center justify-center cursor-pointer',
                  today: 'text-blue-400 font-bold ring-1 ring-blue-500/60 bg-blue-500/10',
                  outside: 'text-slate-600 opacity-30 pointer-events-none',
                  disabled: 'text-slate-700 opacity-20 cursor-not-allowed',
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Apply Filter Button */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={handleApply}
          className="px-6 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/30 transition shadow-lg shadow-blue-500/20 active:scale-95"
        >
          Apply Filter
        </button>
      </div>
    </div>
  );
}
