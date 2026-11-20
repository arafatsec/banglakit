import { test } from "node:test";
import assert from "node:assert/strict";
import { toHijri, fromHijri } from "../src/hijri.js";

// Published tabular-calendar conversions (arithmetic 30-year cycle, epoch RD 227015).
const VECTORS = [
  ["2026-01-01", 1447, 7, 12],
  ["2000-01-01", 1420, 9, 24],
  ["2020-01-01", 1441, 5, 5],
  ["2025-01-01", 1446, 7, 1],
];
test("tabular Hijri matches the published civil conversions", () => {
  for (const [iso, year, month, day] of VECTORS) {
    const h = toHijri(iso);
    assert.deepEqual([h.year, h.month, h.day], [year, month, day], iso);
    assert.equal(fromHijri(year, month, day), iso);
    assert.match(h.note, /moon sighting/);
  }
  assert.equal(toHijri("2026-01-01").text, "১২ রজব ১৪৪৭ হিজরি");
});
test("rejects a day the tabular month does not have", () => {
  assert.throws(() => fromHijri(1447, 2, 30));
});
