// Format checks for Bangladesh identity and tax numbers, and postcodes.
// Nothing here looks a number up. A valid result only means the shape is right.
import { toEnglishDigits } from "./numbers.js";

const digitsOf = (input) => toEnglishDigits(String(input)).replace(/[\s-]/g, "");

function result(ok, fields) {
  return ok ? { valid: true, checks: "format only", ...fields } : { valid: false, checks: "format only", ...fields };
}

/**
 * NID shape used by the Bangladesh Election Commission.
 * 10 digits: smart card (2016), first digit not 0. The last digit is a checksum
 * whose algorithm was not published, so it is not checked.
 * 13 digits: the 2008 card. 17 digits: the longer card; the first four digits are
 * usually the year of birth (NBR Mushak 2.1 describes a 17-digit NID).
 */
export function parseNid(input) {
  const digits = digitsOf(input);
  if (!/^\d+$/.test(digits)) return result(false, { input: String(input), reason: "An NID is 10, 13 or 17 digits" });
  if (digits.length === 10) {
    if (digits[0] === "0") return result(false, { input: String(input), reason: "A 10-digit smart NID does not start with 0" });
    return result(true, { digits, length: 10, kind: "smart" });
  }
  if (digits.length === 13) return result(true, { digits, length: 13, kind: "legacy-13" });
  if (digits.length === 17) {
    const year = Number(digits.slice(0, 4));
    const out = { digits, length: 17, kind: "legacy-17" };
    if (year >= 1900 && year <= 2099) out.birthYear = year;
    return result(true, out);
  }
  return result(false, { input: String(input), reason: "An NID is 10, 13 or 17 digits" });
}

/** e-TIN: 12 digits (National Board of Revenue). No published checksum is applied. */
export function parseTin(input) {
  const digits = digitsOf(input);
  if (!/^\d{12}$/.test(digits)) return result(false, { input: String(input), reason: "A TIN is 12 digits" });
  return result(true, { digits, length: 12, kind: "tin" });
}

/**
 * e-BIN: 13 digits (National Board of Revenue). Nine-digit and eleven-digit BINs
 * are the withdrawn numbers; they are reported as legacy and not valid.
 */
export function parseBin(input) {
  const digits = digitsOf(input);
  if (/^\d{13}$/.test(digits)) return result(true, { digits, length: 13, kind: "ebin" });
  if (/^\d{9}$/.test(digits) || /^\d{11}$/.test(digits)) return result(false, { input: String(input), digits, length: digits.length, legacy: true, reason: "NBR requires the 13-digit e-BIN. This is an old 9-digit or 11-digit BIN" });
  return result(false, { input: String(input), reason: "A BIN is 13 digits" });
}

/** Bangladesh postcodes are 4 digits. This does not check that the code is assigned. */
export function parsePostcode(input) {
  const digits = digitsOf(input);
  if (!/^\d{4}$/.test(digits)) return result(false, { input: String(input), reason: "A Bangladesh postcode is 4 digits" });
  return result(true, { digits, length: 4, kind: "postcode", assigned: "not checked" });
}
