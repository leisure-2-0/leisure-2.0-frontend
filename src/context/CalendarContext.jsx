import { useState } from 'react';
import { CalendarContext } from './calendar-context.js';

// August 2026, 0-indexed month
const INITIAL_YEAR = 2026;
const INITIAL_MONTH = 7;

export function CalendarProvider({ children }) {
  const [calYear, setCalYear] = useState(INITIAL_YEAR);
  const [calMonth, setCalMonth] = useState(INITIAL_MONTH);
  const [selectedDate, setSelectedDate] = useState(null);

  const goPrevMonth = () => {
    setSelectedDate(null);
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((previousYear) => previousYear - 1);
    } else {
      setCalMonth((previousMonth) => previousMonth - 1);
    }
  };

  const goNextMonth = () => {
    setSelectedDate(null);
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((previousYear) => previousYear + 1);
    } else {
      setCalMonth((previousMonth) => previousMonth + 1);
    }
  };

  return (
    <CalendarContext.Provider
      value={{ calYear, calMonth, selectedDate, setSelectedDate, goPrevMonth, goNextMonth }}
    >
      {children}
    </CalendarContext.Provider>
  );
}
