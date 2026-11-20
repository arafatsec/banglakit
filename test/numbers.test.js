import { test } from "node:test";
import assert from "node:assert/strict";
import { toBanglaDigits, toEnglishDigits, numberToWords, takaInWords, formatNumber } from "../src/numbers.js";

test("digits both ways", () => {
  assert.equal(toBanglaDigits("Room 2026-B"), "Room ২০২৬-B");
  assert.equal(toEnglishDigits("৳১,২৫০"), "৳1,250");
});
test("number words, every irregular 0-99 word is distinct", () => {
  const words = new Set(Array.from({ length: 100 }, (_, i) => numberToWords(i)));
  assert.equal(words.size, 100);
  assert.equal(numberToWords(0), "শূন্য");
  assert.equal(numberToWords(99), "নিরানব্বই");
  assert.equal(numberToWords(105), "এক শত পাঁচ");
  assert.equal(numberToWords(125000), "এক লক্ষ পঁচিশ হাজার");
  assert.equal(numberToWords("১০০০০০০০"), "এক কোটি");
  assert.equal(numberToWords(1234567890), "এক শত তেইশ কোটি পঁয়তাল্লিশ লক্ষ সাতষট্টি হাজার আট শত নব্বই");
  assert.equal(numberToWords(1250, "en"), "one thousand two hundred fifty");
  assert.throws(() => numberToWords(-1));
  assert.throws(() => numberToWords(1.5));
});
test("taka in words", () => {
  assert.equal(takaInWords("1,250.50"), "এক হাজার দুই শত পঞ্চাশ টাকা পঞ্চাশ পয়সা মাত্র");
  assert.equal(takaInWords("৳৫০০"), "পাঁচ শত টাকা মাত্র");
  assert.equal(takaInWords("12500000", "en"), "one crore twenty-five lakh taka only");
  assert.equal(takaInWords("10.05", "en"), "ten taka and five paisa only");
  assert.throws(() => takaInWords("12.345"));
  assert.throws(() => takaInWords("abc"));
});
test("lakh/crore grouping", () => {
  assert.equal(formatNumber(12345678.5), "১,২৩,৪৫,৬৭৮.৫");
  assert.equal(formatNumber("-1234567", { bangla: false }), "-12,34,567");
  assert.equal(formatNumber(999, { bangla: false }), "999");
});
