// Bangladesh mobile numbers: validate, normalise and identify the operator.
import { toEnglishDigits } from "./numbers.js";

// Operator by the digit after "01" (BTRC number plan). Robi owns the Airtel brand since 2016.
const OPERATORS = { 3: "Grameenphone", 7: "Grameenphone", 4: "Banglalink", 9: "Banglalink", 8: "Robi", 6: "Airtel (Robi)", 5: "Teletalk" };

/** "+880 1712-345678", "01712345678" or "০১৭১২৩৪৫৬৭৮" -> { valid, e164, local, operator } */
export function parsePhone(input) {
  const digits = toEnglishDigits(String(input)).replace(/[\s\-().]/g, "");
  const m = /^(?:\+?880|0088)?0?(1[3-9]\d{8})$/.exec(digits);
  if (!m) return { valid: false, input: String(input), reason: "Not a Bangladesh mobile number (expected 01XXXXXXXXX, 11 digits, operator code 013-019)" };
  const n = m[1];
  return { valid: true, e164: `+880${n}`, local: `0${n}`, display: `0${n.slice(0, 4)}-${n.slice(4)}`, operator: OPERATORS[n[1]] };
}
