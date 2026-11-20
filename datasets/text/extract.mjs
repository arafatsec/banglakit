// Number spans in real sentences. The same function builds the gold file and scores it.
import { toEnglishDigits } from "../../src/numbers.js";
import { GREGORIAN_MONTHS, MONTHS } from "../../src/calendar.js";

/**
 * Digit runs, including a single decimal comma or point. Bangla and ASCII digits.
 * `kind` is a short window around the digits: currency next to ৳ or টাকা,
 * date next to a month name or সাল/তারিখ, otherwise a plain number.
 * It is a label, not a date parser.
 */
export function extractNumbers(text) {
  const spans = [];
  const src = String(text);
  const re = /[0-9০-৯]+(?:[.,][0-9০-৯]+)?/g;
  for (const match of src.matchAll(re)) {
    const raw = match[0];
    const start = match.index ?? 0;
    const before = src.slice(Math.max(0, start - 4), start);
    const after = src.slice(start + raw.length, start + raw.length + 18);
    let kind = "number";
    if (/৳\s*$/.test(before) || /টাকা|পয়সা|পয়সা/.test(after)) kind = "currency";
    else if (MONTHS.some((name) => after.includes(name) || before.includes(name)) || GREGORIAN_MONTHS.some((name) => after.includes(name)) || /সাল|তারিখ|খ্রিস্টাব্দ|খ্রিষ্টাব্দ/.test(before + after)) kind = "date";
    spans.push({ raw, ascii: toEnglishDigits(raw).replace(/,/g, ""), kind });
  }
  return spans;
}
