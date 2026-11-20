// Clock times written the way people say them in Bangladesh.
import { toBanglaDigits, toEnglishDigits } from "./numbers.js";

// Everyday names, not a legal definition. The night band wraps past midnight.
const BANDS = [
  [0, 3, "রাত", "Night"],
  [4, 5, "ভোর", "Dawn"],
  [6, 11, "সকাল", "Morning"],
  [12, 14, "দুপুর", "Noon"],
  [15, 17, "বিকাল", "Afternoon"],
  [18, 19, "সন্ধ্যা", "Evening"],
  [20, 23, "রাত", "Night"],
];

/** "15:45" or "১৫:৪৫" -> { text: "বিকাল ৩টা ৪৫ মিনিট", ... }. 24-hour input. */
export function formatTime(input) {
  const s = toEnglishDigits(String(input)).trim();
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(s);
  if (!m) throw new RangeError("Give a time as HH:MM, from 00:00 to 23:59");
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  const band = BANDS.find(([a, b]) => hour >= a && hour <= b);
  const hour12 = hour % 12 || 12;
  const text = `${band[2]} ${toBanglaDigits(hour12)}টা${minute ? ` ${toBanglaDigits(minute)} মিনিট` : ""}`;
  return {
    text,
    digits: `${toBanglaDigits(String(hour).padStart(2, "0"))}:${toBanglaDigits(String(minute).padStart(2, "0"))}`,
    hour, minute, hour12, period: band[2], periodEn: band[3],
    note: "Period names follow everyday Bangladesh usage. They are not a legal definition.",
  };
}
