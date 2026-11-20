import { test } from "node:test";
import assert from "node:assert/strict";
import { toBanglaDate, fromBanglaDate, gregorianInBangla } from "../src/calendar.js";

// Fixed dates of the revised Bangladesh calendar (2019 onward).
const FIXED = { "04-14": [1, 1], "02-21": [11, 8], "03-26": [12, 12], "12-16": [9, 1], "08-15": [4, 31] };
test("national days fall on the same Bangla date every year", () => {
  for (const year of [2024, 2025, 2026, 2027, 2028]) {
    for (const [md, [month, day]] of Object.entries(FIXED)) {
      const r = toBanglaDate(`${year}-${md}`);
      assert.deepEqual([r.month, r.day], [month, day], `${year}-${md}`);
    }
  }
});
test("year number and text", () => {
  assert.equal(toBanglaDate("2026-04-14").text, "১ বৈশাখ ১৪৩৩ বঙ্গাব্দ");
  assert.equal(toBanglaDate("2026-04-13").year, 1432);
  assert.equal(toBanglaDate("2026-11-20").long, "শুক্রবার, ৫ অগ্রহায়ণ ১৪৩৩ বঙ্গাব্দ, হেমন্তকাল");
});
test("Falgun has 30 days only in Gregorian leap years", () => {
  assert.equal(toBanglaDate("2028-03-14").day, 30); // 2028 is a leap year
  assert.equal(toBanglaDate("2027-03-14").day, 29);
  assert.equal(toBanglaDate("2027-03-15").monthNameEn, "Choitro");
});
test("round trip every day for 4 years", () => {
  for (let t = Date.UTC(2025, 0, 1); t < Date.UTC(2029, 0, 1); t += 864e5) {
    const iso = new Date(t).toISOString().slice(0, 10);
    const b = toBanglaDate(iso);
    assert.equal(fromBanglaDate(b.year, b.month, b.day), iso);
  }
});
test("bad input", () => {
  assert.throws(() => toBanglaDate("2026-02-30"));
  assert.throws(() => fromBanglaDate(1433, 11, 30)); // Falgun 1433 ends Mar 2027, not a leap year
  assert.equal(gregorianInBangla("2026-11-20"), "২০ নভেম্বর ২০২৬, শুক্রবার");
});
