import { createContext, useContext } from 'react';

export const CalendarContext = createContext(null);

export function useCalendar() {
  return useContext(CalendarContext);
}
