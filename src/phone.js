// Bangladesh mobile numbers: validate, normalise and identify the original operator.
import { toEnglishDigits } from "./numbers.js";
import { loadJson } from "./load.js";

let byDigit;
function operators() {
  if (!byDigit) {
    const data = loadJson("../data/operators.json");
    byDigit = Object.fromEntries(data.prefixes.map((row) => [row.prefix[2], row]));
  }
  return byDigit;
}
const MNP = "The prefix is the operator the number was first issued to. Since mobile number portability (October 2018) the SIM may be on another network.";

/** The seven mobile prefixes and the operator each was issued to. */
export function listOperators() {
  return loadJson("../data/operators.json").prefixes.map((row) => ({ ...row }));
}

/** "+880 1712-345678", "01712345678" or "০১৭১২৩৪৫৬৭৮" -> { valid, e164, local, operator } */
export function parsePhone(input) {
  const digits = toEnglishDigits(String(input)).replace(/[\s\-().]/g, "");
  const m = /^(?:\+?880|0088)?0?(1[3-9]\d{8})$/.exec(digits);
  if (!m) return { valid: false, input: String(input), reason: "Not a Bangladesh mobile number (expected 01XXXXXXXXX, 11 digits, operator code 013-019)" };
  const n = m[1];
  const row = operators()[n[1]];
  return { valid: true, e164: `+880${n}`, local: `0${n}`, display: `0${n.slice(0, 4)}-${n.slice(4)}`, operator: row.operator, operator_bn: row.operator_bn, prefix: row.prefix, mnp: MNP };
}
