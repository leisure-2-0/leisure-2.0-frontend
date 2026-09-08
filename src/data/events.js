export function pad(number) {
  return number < 10 ? '0' + number : '' + number;
}

export function todayStr() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function defaultDateFor(calendarYear, calendarMonth) {
  const today = todayStr();
  const monthPrefix = `${calendarYear}-${pad(calendarMonth + 1)}`;
  return today.startsWith(monthPrefix) ? today : `${monthPrefix}-01`;
}
