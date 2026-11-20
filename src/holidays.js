// Bangladesh public holidays from the official gazette (one file per year in data/).
import { loadJson } from "./load.js";

let YEARS;
function years() {
  if (!YEARS) YEARS = { 2026: loadJson("../data/holidays-2026.json") };
  return YEARS;
}
export const holidayYears = [2026];

function yearData(year) {
  const y = years()[year];
  if (!y) throw new RangeError(`No holiday list for ${year} yet. Available: ${holidayYears.join(", ")}`);
  return y;
}

/**
 * Holidays for a year. type: "general" | "executive" | "optional" | "public" (general + executive, the days offices close).
 * month: 1-12 to filter.
 */
export function listHolidays(year = new Date().getFullYear(), { type = "public", month } = {}) {
  const y = yearData(year);
  return y.holidays
    .filter((h) => (type === "all" ? true : type === "public" ? h.type !== "optional" : h.type === type))
    .filter((h) => !month || Number(h.date.slice(5, 7)) === month)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Is this date (YYYY-MM-DD) a public holiday? Returns the matching holidays (empty when not). Weekends are not included. */
export function holidaysOn(date) {
  const year = Number(String(date).slice(0, 4));
  return listHolidays(year, { type: "all" }).filter((h) => h.date === date);
}

/** Source of a year's list. */
export const holidaySource = (year) => { const y = yearData(year); return { url: y.source, publisher: y.publisher, note: y.note }; };
