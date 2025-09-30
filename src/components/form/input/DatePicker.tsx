import { useEffect, useRef, useState } from "react";
import Input from "./InputField";
import { Calendar as CalendarIcon } from "lucide-react";

// Timezone constant (change here if needed)
const TIME_ZONE = "Asia/Kolkata";
// IST offset in milliseconds (UTC+5:30)
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

const pad = (n: number) => String(n).padStart(2, "0");

// Return YYYY-MM-DD for a given year, monthIndex (0-11), day
const ymd = (year: number, monthIndex: number, day: number) => `${year}-${pad(monthIndex + 1)}-${pad(day)}`;

// Parse a YYYY-MM-DD string into a Date object at 00:00 UTC (safe canonical)
const parseYMDToUTCDate = (ymdStr: string): Date | null => {
  if (!ymdStr) return null;
  const [y, m, d] = ymdStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

// Format a YYYY-MM-DD into a readable IST string (e.g. 04 Aug 2025)
const formatYMDForDisplayInIST = (ymdStr: string) => {
  if (!ymdStr) return "";
  const d = parseYMDToUTCDate(ymdStr)!;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(d);
};

// Today's date in YYYY-MM-DD in IST
const getTodayDateInIST = () => {
  // en-CA produces YYYY-MM-DD format
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date());
};

// Get first day of month (0 Sun - 6 Sat) in IST for given year & monthIndex
const getFirstDayOfMonthInIST = (year: number, monthIndex: number) => {
  // create UTC ms of 00:00 UTC of that date, subtract IST offset to get instant that corresponds to 00:00 IST
  const utcMs = Date.UTC(year, monthIndex, 1);
  const istInstantMs = utcMs - IST_OFFSET_MS;
  const inst = new Date(istInstantMs);
  return inst.getUTCDay();
};

// Days in month (use UTC to avoid timezone surprises)
const getDaysInMonthUTC = (year: number, monthIndex: number) => new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

// ---------------- DatePicker Component ----------------
const DatePicker = ({
  value,
  onChange,
  maxDate,
  minDate,
  isOpen,
  onToggle,
}: {
  value: string;
  onChange: (date: string) => void;
  maxDate?: string;
  minDate?: string;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);

  // initialize month/year based on value or IST today
  const initialYearMonth = (() => {
    if (value) {
      const [y, m] = value.split("-").map(Number);
      return { year: y, month: m - 1 };
    }
    const todayParts = getTodayDateInIST().split("-").map(Number);
    return { year: todayParts[0], month: todayParts[1] - 1 };
  })();

  const [currentMonth, setCurrentMonth] = useState<number>(initialYearMonth.month);
  const [currentYear, setCurrentYear] = useState<number>(initialYearMonth.year);
  const [selectedDate, setSelectedDate] = useState<string>(value || "");

  // Keep selectedDate in sync with value prop
  useEffect(() => setSelectedDate(value || ""), [value]);

  // Outside click closes the calendar
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (isOpen && ref.current && !ref.current.contains(e.target as Node)) {
        onToggle();
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen, onToggle]);

  // When opening, align calendar to the selected date if present
  useEffect(() => {
    if (isOpen && selectedDate) {
      const [y, m] = selectedDate.split("-").map(Number);
      setCurrentYear(y);
      setCurrentMonth(m - 1);
    }
  }, [isOpen, selectedDate]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const daysInMonth = getDaysInMonthUTC(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonthInIST(currentYear, currentMonth);

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(<div key={`empty-${i}`} className="h-8" />);

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = ymd(currentYear, currentMonth, day);
    const isSelected = selectedDate === dateStr;
    const isDisabled = (maxDate && dateStr > maxDate) || (minDate && dateStr < minDate);

    cells.push(
      <div
        key={day}
        className={`h-8 flex items-center justify-center rounded-full cursor-pointer text-sm
          ${isSelected ? "bg-blue-500 text-white" : ""}
          ${isDisabled ? "text-gray-400 cursor-not-allowed" : "hover:bg-gray-100"}`}
        onClick={() => {
          if (!isDisabled) {
            setSelectedDate(dateStr);
            onChange(dateStr);
            onToggle(); // Close the calendar after selection
          }
        }}
      >
        {day}
      </div>
    );
  }

  const prevMonth = () => {
    setCurrentMonth(m => {
      if (m === 0) {
        setCurrentYear(y => y - 1);
        return 11;
      }
      return m - 1;
    });
  };
  const nextMonth = () => {
    setCurrentMonth(m => {
      if (m === 11) {
        setCurrentYear(y => y + 1);
        return 0;
      }
      return m + 1;
    });
  };

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <Input
          value={value ? formatYMDForDisplayInIST(value) : ""}
          placeholder="Select date"
          readOnly
          onClick={onToggle}
          className="pr-10 cursor-pointer"
        />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
          <CalendarIcon className="size-5" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-3">
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded">&lt;</button>

            <div className="flex items-center gap-2">
              <select
                className="border rounded p-1 text-sm pr-6"
                value={currentMonth}
                onChange={(e) => setCurrentMonth(Number(e.target.value))}
              >
                {months.map((m, i) => (
                  <option key={i} value={i}>
                    {m}
                  </option>
                ))}
              </select>

              <input
                className="w-20 border rounded p-1 text-sm"
                type="number"
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
              />
            </div>

            <button type="button" onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">&gt;</button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2 text-xs font-medium text-gray-500">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="text-center">{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1">{cells}</div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;