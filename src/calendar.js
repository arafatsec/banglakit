// Bangla (Bongabdo) calendar as used officially in Bangladesh since the 2019 revision:
// the year starts on 14 April; Boishakh to Ashwin have 31 days; Kartik to Magh and Chaitra have 30;
// Falgun has 29 days, or 30 when it falls in a Gregorian leap year.
// So 21 February = 8 Falgun, 26 March = 12 Chaitra, 16 December = 1 Poush every year.
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

const monthLengths = (falgunInLeapYear) => [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, falgunInLeapYear ? 30 : 29, 30];

/** Gregorian date -> Bangla date. */
export function toBanglaDate(input = new Date()) {
  const { y, m, d } = ymd(input);
  const startYear = m > 4 || (m === 4 && d >= 14) ? y : y - 1; // Gregorian year in which this Bangla year began
  let days = Math.round((utc(y, m, d) - utc(startYear, 4, 14)) / DAY);
  const lengths = monthLengths(isLeap(startYear + 1)); // Falgun falls in Feb/Mar of the next Gregorian year
  let month = 0;
  while (days >= lengths[month]) days -= lengths[month++];
  const day = days + 1;
  const year = startYear - 593;
  const weekday = WEEKDAYS[new Date(utc(y, m, d)).getUTCDay()];
  return {
    year, month: month + 1, day,
    monthName: MONTHS[month], monthNameEn: MONTHS_EN[month], weekday, season: SEASONS[Math.floor(month / 2)],
    text: `${toBanglaDigits(day)} ${MONTHS[month]} ${toBanglaDigits(year)} বঙ্গাব্দ`,
    long: `${weekday}, ${toBanglaDigits(day)} ${MONTHS[month]} ${toBanglaDigits(year)} বঙ্গাব্দ, ${SEASONS[Math.floor(month / 2)]}কাল`,
  };
}

/** Bangla date -> Gregorian "YYYY-MM-DD". month is 1-12 (1 = Boishakh). */
export function fromBanglaDate(year, month, day) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day) || month < 1 || month > 12) throw new RangeError("Give year, month 1-12 and day as whole numbers");
  const startYear = year + 593;
  const lengths = monthLengths(isLeap(startYear + 1));
  if (day < 1 || day > lengths[month - 1]) throw new RangeError(`${MONTHS[month - 1]} ${year} has ${lengths[month - 1]} days`);
  let offset = day - 1;
  for (let i = 0; i < month - 1; i++) offset += lengths[i];
  return new Date(utc(startYear, 4, 14) + offset * DAY).toISOString().slice(0, 10);
}

/** Gregorian date written in Bangla: "২০ নভেম্বর ২০২৬, শুক্রবার". */
const G_MONTHS = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
export function gregorianInBangla(input = new Date()) {
  const { y, m, d } = ymd(input);
  return `${toBanglaDigits(d)} ${G_MONTHS[m - 1]} ${toBanglaDigits(y)}, ${WEEKDAYS[new Date(utc(y, m, d)).getUTCDay()]}`;
}
