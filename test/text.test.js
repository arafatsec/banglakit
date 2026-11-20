import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeBangla, romanize, sortBangla, countSyllables, countWords, splitSentences, isStopword, removeStopwords, banglaStopwords } from "../src/text.js";
import { formatTime } from "../src/time.js";

test("unicode cleanup composes ো and drops a stray zero-width space", () => {
  assert.equal(normalizeBangla("ক\u09c7\u09be"), "কো");
  assert.equal(normalizeBangla("বাং\u200bলা"), "বাংলা");
  assert.equal(normalizeBangla("ক\u09cd\u200c"), "ক\u09cd\u200c");
});
test("ISO 15919 keeps the inherent vowel and can fold to ASCII", () => {
  assert.equal(romanize("বাংলা"), "bāṁlā");
  assert.equal(romanize("টাকা"), "ṭākā");
  assert.equal(romanize("আমি"), "āmi");
  assert.equal(romanize("কর্ম"), "karma");
  assert.equal(romanize("বাংলা", { style: "ascii" }), "bangla");
  assert.equal(romanize("টাকা", { style: "ascii" }), "taka");
});
test("collation, counts and sentences", () => {
  assert.deepEqual(sortBangla(["কলা", "আম", "অমর", "ইঁদুর"]), ["অমর", "আম", "ইঁদুর", "কলা"]);
  assert.equal(countSyllables("আমি"), 2);
  assert.equal(countSyllables("বাংলা"), 2);
  assert.equal(countSyllables("স্কুল"), 2);
  assert.deepEqual(countWords("আমি বাংলায় গান গাই"), { tokens: 4, bangla: 4 });
  assert.deepEqual(splitSentences("আমি বাংলায় গান গাই। তুমি?"), ["আমি বাংলায় গান গাই।", "তুমি?"]);
});
test("stopwords come from the cleaned MIT list", () => {
  assert.ok(banglaStopwords().length > 300);
  assert.equal(isStopword("আমি"), true);
  assert.equal(isStopword("জন্যওজে"), false);
  assert.equal(removeStopwords("আমি বাংলায় গান গাই"), "বাংলায় গান গাই");
});
test("clock times use everyday period names", () => {
  assert.equal(formatTime("15:45").text, "বিকাল ৩টা ৪৫ মিনিট");
  assert.equal(formatTime("00:00").text, "রাত ১২টা");
  assert.equal(formatTime("১২:০৫").text, "দুপুর ১২টা ৫ মিনিট");
  assert.throws(() => formatTime("24:00"));
});
