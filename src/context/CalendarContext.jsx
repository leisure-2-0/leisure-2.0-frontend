import { useState } from 'react';
import { CalendarContext } from './calendar-context.js';

export function CalendarProvider({ children }) {
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
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
