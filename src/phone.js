// Bangladesh mobile numbers: validate, normalise and identify the operator.
import { toEnglishDigits } from "./numbers.js";

// Operator by the digit after "01" (BTRC national numbering plan).
// 013 and 017 Grameenphone, 014 and 019 Banglalink, 018 Robi, 016 Airtel (merged into Robi, 2016), 015 Teletalk.
// Mobile number portability has been in force since October 2018, so the prefix is the original allocation.
const OPERATORS = {
  3: ["Grameenphone", "গ্রামীণফোন"], 7: ["Grameenphone", "গ্রামীণফোন"],
  4: ["Banglalink", "বাংলালিংক"], 9: ["Banglalink", "বাংলালিংক"],
  8: ["Robi", "রবি"], 6: ["Airtel (Robi)", "এয়ারটেল (রবি)"], 5: ["Teletalk", "টেলিটক"],
};
const MNP = "The prefix is the operator the number was first issued to. Since mobile number portability (October 2018) the SIM may be on another network.";

/** "+880 1712-345678", "01712345678" or "০১৭১২৩৪৫৬৭৮" -> { valid, e164, local, operator } */
export function parsePhone(input) {
  const digits = toEnglishDigits(String(input)).replace(/[\s\-().]/g, "");
  const m = /^(?:\+?880|0088)?0?(1[3-9]\d{8})$/.exec(digits);
  if (!m) return { valid: false, input: String(input), reason: "Not a Bangladesh mobile number (expected 01XXXXXXXXX, 11 digits, operator code 013-019)" };
  const n = m[1];
  const [operator, operator_bn] = OPERATORS[n[1]];
  return { valid: true, e164: `+880${n}`, local: `0${n}`, display: `0${n.slice(0, 4)}-${n.slice(4)}`, operator, operator_bn, prefix: `0${n.slice(0, 2)}`, mnp: MNP };
}
