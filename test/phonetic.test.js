import { test } from "node:test";
import assert from "node:assert/strict";
import { phoneticToBangla as p } from "../src/phonetic.js";

const CASES = {
  "ami banglay gan gai": "আমি বাংলায় গান গাই",
  bangladesh: "বাংলাদেশ",
  "amar sOnar bangla": "আমার সোনার বাংলা",
  Dhaka: "ঢাকা",
  "kemon achhO": "কেমন আছো",
  bhalObasa: "ভালোবাসা",
  shikkha: "শিক্ষা",
  rokto: "রক্ত",
  oikyo: "ঐক্য",
  swamI: "স্বামী",
  "bidyut``": "বিদ্যুৎ",
  "ca^d": "চাঁদ",
  ache: "আছে",
  samia: "সামিয়া",
  yahoo: "ইয়াহু",
  krrm: "কর্ম",
  orrko: "অর্ক",
  bishwo: "বিশ্ব",
  bykti: "ব্যক্তি",
  "ek`i": "একই",
  "am`ra": "আমরা",
  "3.`14": "৩.১৪",
  Sikkha: "শিক্ষা",
  toiri: "তৈরি",
  "2026 sal.": "২০২৬ সাল।",
  "amar {email} dao": "আমার email দাও",
};
test("common words", () => {
  for (const [input, want] of Object.entries(CASES)) assert.equal(p(input), want, input);
});
