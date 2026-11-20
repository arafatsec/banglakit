// Bangla (Bongabdo) calendar as used officially in Bangladesh.
// From 14 April 2019 (1 Boishakh 1426): Boishakh to Ashwin have 31 days; Kartik to Magh and
// Choitro have 30; Falgun has 29, or 30 when it falls in a Gregorian leap year.
// So, from 2019 on, 21 February = 8 Falgun, 26 March = 12 Choitro and 16 December = 1 Poush.
// From 14 April 1995 until that revision, Boishakh to Bhadro had 31 days and the rest 30,
// with the leap day on Falgun (Bangla Academy, reported by Dhaka Tribune, New Age and BBC Bangla).
import { toBanglaDigits } from "./numbers.js";

export const MONTHS = ["বৈশাখ", "জ্যৈষ্ঠ", "আষাঢ়", "শ্রাবণ", "ভাদ্র", "আশ্বিন", "কার্তিক", "অগ্রহায়ণ", "পৌষ", "মাঘ", "ফাল্গুন", "চৈত্র"];
export const MONTHS_EN = ["Boishakh", "Joishtho", "Asharh", "Shrabon", "Bhadro", "Ashwin", "Kartik", "Ogrohayon", "Poush", "Magh", "Falgun", "Choitro"];
export const WEEKDAYS = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
export const SEASONS = ["গ্রীষ্ম", "বর্ষা", "শরৎ", "হেমন্ত", "শীত", "বসন্ত"]; // two months each, from Boishakh

const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const DAY = 864e5;
const utc = (y, m, d) => Date.UTC(y, m - 1, d);

/** Parse "2026-11-20" or a Date into {y, m, d} (calendar date, no time zone shift). */
function ymd(input) {
  if (input instanceof Date) return { y: input.getFullYear(), m: input.getMonth() + 1, d: input.getDate() };
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(input).trim());
  if (!m) throw new RangeError("Give a date as YYYY-MM-DD");
  const [y, mo, d] = m.slice(1).map(Number);
  const t = new Date(utc(y, mo, d));
  if (t.getUTCFullYear() !== y || t.getUTCMonth() !== mo - 1 || t.getUTCDate() !== d) throw new RangeError("That date does not exist");
  return { y, m: mo, d };
}

// The 2019 revision applies from 14 April 2019 (1 Boishakh 1426). From 14 April 1995
// (1 Boishakh 1402) until then, the official calendar had 31-day months for Boishakh–Bhadro
// and 30-day months afterwards, with the leap day added to Falgun.
const REVISED_2019 = Date.UTC(2019, 3, 14);
const REVISED_1402 = Date.UTC(1995, 3, 14);
const monthLengths = (falgunInLeapYear, revised) => revised
  ? [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, falgunInLeapYear ? 30 : 29, 30]
  : [31, 31, 31, 31, 31, 30, 30, 30, 30, 30, falgunInLeapYear ? 31 : 30, 30];

export const RITU = [
  { bn: "গ্রীষ্ম", en: "Summer", months: [1, 2] },
  { bn: "বর্ষা", en: "Monsoon", months: [3, 4] },
  { bn: "শরৎ", en: "Autumn", months: [5, 6] },
  { bn: "হেমন্ত", en: "Late autumn", months: [7, 8] },
  { bn: "শীত", en: "Winter", months: [9, 10] },
  { bn: "বসন্ত", en: "Spring", months: [11, 12] },
];
export const WEEKDAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const GREGORIAN_MONTHS = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

/** Gregorian date -> Bangla date. */
export function toBanglaDate(input = new Date()) {
  const { y, m, d } = ymd(input);
  const stamp = utc(y, m, d);
  const startYear = m > 4 || (m === 4 && d >= 14) ? y : y - 1; // Gregorian year in which this Bangla year began
  let days = Math.round((stamp - utc(startYear, 4, 14)) / DAY);
  const revised = stamp >= REVISED_2019;
  const lengths = monthLengths(isLeap(startYear + 1), revised); // Falgun falls in Feb/Mar of the next Gregorian year
  let month = 0;
  while (days >= lengths[month]) days -= lengths[month++];
  const day = days + 1;
  const year = startYear - 593;
  const weekday = WEEKDAYS[new Date(stamp).getUTCDay()];
  const season = SEASONS[Math.floor(month / 2)];
  const result = {
    year, month: month + 1, day,
    monthName: MONTHS[month], monthNameEn: MONTHS_EN[month], weekday, season,
    rules: revised ? "revised-2019" : "revised-1402",
    text: `${toBanglaDigits(day)} ${MONTHS[month]} ${toBanglaDigits(year)} বঙ্গাব্দ`,
    long: `${weekday}, ${toBanglaDigits(day)} ${MONTHS[month]} ${toBanglaDigits(year)} বঙ্গাব্দ, ${season}কাল`,
  };
  if (stamp < REVISED_1402) result.note = "Dates before 14 April 1995 use the 1402–1425 month lengths. Earlier official reforms are not modelled.";
  return result;
}

/** Bangla date -> Gregorian "YYYY-MM-DD". month is 1-12 (1 = Boishakh). */
export function fromBanglaDate(year, month, day) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day) || month < 1 || month > 12) throw new RangeError("Give year, month 1-12 and day as whole numbers");
  const startYear = year + 593;
  const lengths = monthLengths(isLeap(startYear + 1), startYear >= 2019);
  if (day < 1 || day > lengths[month - 1]) throw new RangeError(`${MONTHS[month - 1]} ${year} has ${lengths[month - 1]} days`);
  let offset = day - 1;
  for (let i = 0; i < month - 1; i++) offset += lengths[i];
  return new Date(utc(startYear, 4, 14) + offset * DAY).toISOString().slice(0, 10);
}

/** Gregorian date written in Bangla: "২০ নভেম্বর ২০২৬, শুক্রবার". */
export function gregorianInBangla(input = new Date()) {
  const { y, m, d } = ymd(input);
  return `${toBanglaDigits(d)} ${GREGORIAN_MONTHS[m - 1]} ${toBanglaDigits(y)}, ${WEEKDAYS[new Date(utc(y, m, d)).getUTCDay()]}`;
}
