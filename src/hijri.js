// Tabular (arithmetic) Islamic calendar. The formulas are the civil calendar in
// Calendrical Calculations (Dershowitz and Reingold): epoch Rata Die 227015,
// 30-year cycle, leap years 2, 5, 7, 10, 13, 16, 18, 21, 24, 26 and 29.
// This is the conversion most software uses. It is not Bangladesh moon sighting.
import { toBanglaDigits } from "./numbers.js";

const EPOCH = 227015;
const LEAP = new Set([2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29]);
const GREG_MONTH = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
const isGregLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

export const HIJRI_MONTHS_BN = ["মুহাররম", "সফর", "রবিউল আউয়াল", "রবিউস সানি", "জমাদিউল আউয়াল", "জমাদিউস সানি", "রজব", "শাবান", "রমজান", "শাওয়াল", "জিলকদ", "জিলহজ"];
export const HIJRI_MONTHS_EN = ["Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani", "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Shaban", "Ramadan", "Shawwal", "Dhu al-Qadah", "Dhu al-Hijjah"];
export const HIJRI_NOTE = "Tabular Islamic calendar (arithmetic 30-year cycle). Bangladesh observes Islamic holidays by moon sighting, which can differ by a day or two. Use the holiday list for official dates.";

export const isHijriLeap = (year) => LEAP.has(((year % 30) + 30) % 30);

function gregorianToFixed(y, m, d) {
  const y1 = y - 1;
  const newYear = 365 * y1 + Math.floor(y1 / 4) - Math.floor(y1 / 100) + Math.floor(y1 / 400) + 1;
  return newYear + GREG_MONTH[m - 1] + (m > 2 && isGregLeap(y) ? 1 : 0) + d - 1;
}
function hijriToFixed(year, month, day) {
  return day + 29 * (month - 1) + Math.floor((6 * month - 1) / 11) + (year - 1) * 354 + Math.floor((3 + 11 * year) / 30) + EPOCH - 1;
}
function fixedToGregorian(rd) {
  let year = Math.floor(rd / 365.2425) + 1;
  while (gregorianToFixed(year, 1, 1) > rd) year--;
  while (gregorianToFixed(year + 1, 1, 1) <= rd) year++;
  let month = 1;
  while (month < 12 && gregorianToFixed(year, month + 1, 1) <= rd) month++;
  const day = rd - gregorianToFixed(year, month, 1) + 1;
  return { year, month, day };
}
function fixedToHijri(rd) {
  let year = Math.floor((30 * (rd - EPOCH) + 10646) / 10631);
  if (hijriToFixed(year, 1, 1) > rd) year--;
  while (hijriToFixed(year + 1, 1, 1) <= rd) year++;
  let month = 1;
  while (month < 12 && hijriToFixed(year, month + 1, 1) <= rd) month++;
  const day = rd - hijriToFixed(year, month, 1) + 1;
  return { year, month, day };
}

function ymd(input) {
  if (input instanceof Date) return { y: input.getFullYear(), m: input.getMonth() + 1, d: input.getDate() };
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(input ?? "").trim());
  if (!m) throw new RangeError("Give a date as YYYY-MM-DD");
  const [y, mo, d] = m.slice(1).map(Number);
  const t = new Date(Date.UTC(y, mo - 1, d));
  if (t.getUTCFullYear() !== y || t.getUTCMonth() !== mo - 1 || t.getUTCDate() !== d) throw new RangeError("That date does not exist");
  return { y, m: mo, d };
}

function pack(h) {
  return {
    ...h,
    monthName: HIJRI_MONTHS_BN[h.month - 1],
    monthNameEn: HIJRI_MONTHS_EN[h.month - 1],
    calendar: "tabular-islamic",
    note: HIJRI_NOTE,
    text: `${toBanglaDigits(h.day)} ${HIJRI_MONTHS_BN[h.month - 1]} ${toBanglaDigits(h.year)} হিজরি`,
  };
}

/** Gregorian date -> tabular Hijri date. */
export function toHijri(input = new Date()) {
  const { y, m, d } = ymd(input);
  return pack(fixedToHijri(gregorianToFixed(y, m, d)));
}

/** Tabular Hijri date -> Gregorian "YYYY-MM-DD". month 1 = Muharram. */
export function fromHijri(year, month, day) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day) || month < 1 || month > 12 || year < 1) throw new RangeError("Give a Hijri year, month 1-12 and day");
  const length = month % 2 === 1 ? 30 : month === 12 && isHijriLeap(year) ? 30 : 29;
  if (day < 1 || day > length) throw new RangeError(`${HIJRI_MONTHS_EN[month - 1]} ${year} has ${length} days in the tabular calendar`);
  const g = fixedToGregorian(hijriToFixed(year, month, day));
  return `${String(g.year).padStart(4, "0")}-${String(g.month).padStart(2, "0")}-${String(g.day).padStart(2, "0")}`;
}
