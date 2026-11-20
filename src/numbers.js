// Bangla digits, number words (lakh/crore system) and taka amounts in words.

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

/** 2026 -> "২০২৬". Works on any string: only ASCII digits change. */
export const toBanglaDigits = (input) => String(input).replace(/[0-9]/g, (d) => BN_DIGITS[d]);

/** "২০২৬" -> "2026". Only Bangla digits change. */
export const toEnglishDigits = (input) => String(input).replace(/[০-৯]/g, (d) => BN_DIGITS.indexOf(d));

// 0-99 are irregular in Bangla, so each has its own word.
// The "one less" tens (19, 29, 39, 49, 59, 69, 79, 89) use ঊ, the spelling in the
// NCTB class 1 mathematics list (ঊনত্রিশ, ঊনচল্লিশ, and the same pattern for the rest).
const BN_0_99 = (
  "শূন্য এক দুই তিন চার পাঁচ ছয় সাত আট নয় দশ এগারো বারো তেরো চৌদ্দ পনেরো ষোলো সতেরো আঠারো ঊনিশ " +
  "বিশ একুশ বাইশ তেইশ চব্বিশ পঁচিশ ছাব্বিশ সাতাশ আটাশ ঊনত্রিশ ত্রিশ একত্রিশ বত্রিশ তেত্রিশ চৌত্রিশ পঁয়ত্রিশ ছত্রিশ সাঁইত্রিশ আটত্রিশ ঊনচল্লিশ " +
  "চল্লিশ একচল্লিশ বিয়াল্লিশ তেতাল্লিশ চুয়াল্লিশ পঁয়তাল্লিশ ছেচল্লিশ সাতচল্লিশ আটচল্লিশ ঊনপঞ্চাশ পঞ্চাশ একান্ন বাহান্ন তিপ্পান্ন চুয়ান্ন পঞ্চান্ন ছাপ্পান্ন সাতান্ন আটান্ন ঊনষাট " +
  "ষাট একষট্টি বাষট্টি তেষট্টি চৌষট্টি পঁয়ষট্টি ছেষট্টি সাতষট্টি আটষট্টি ঊনসত্তর সত্তর একাত্তর বাহাত্তর তিয়াত্তর চুয়াত্তর পঁচাত্তর ছিয়াত্তর সাতাত্তর আটাত্তর ঊনআশি " +
  "আশি একাশি বিরাশি তিরাশি চুরাশি পঁচাশি ছিয়াশি সাতাশি আটাশি ঊননব্বই নব্বই একানব্বই বিরানব্বই তিরানব্বই চুরানব্বই পঁচানব্বই ছিয়ানব্বই সাতানব্বই আটানব্বই নিরানব্বই"
).split(" ");

const EN_0_19 = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split(" ");
const EN_TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const en99 = (n) => (n < 20 ? EN_0_19[n] : EN_TENS[Math.floor(n / 10)] + (n % 10 ? "-" + EN_0_19[n % 10] : ""));

const UNITS = {
  bn: { hundred: "শত", thousand: "হাজার", lakh: "লক্ষ", crore: "কোটি" },
  en: { hundred: "hundred", thousand: "thousand", lakh: "lakh", crore: "crore" },
};

const MAX_DIGITS = 66;

/** Whole number as a bigint. Strings may use Bangla digits, commas and a leading sign. */
function parseWhole(value) {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value)) throw new RangeError("Give a whole number. Pass a very large number as a string of digits");
    return BigInt(value);
  }
  const s = toEnglishDigits(String(value)).replace(/[,\s]/g, "");
  if (!/^[+-]?\d+$/.test(s)) throw new RangeError("Give a whole number");
  if (s.replace(/^[+-]/, "").length > MAX_DIGITS) throw new RangeError(`Give a whole number of at most ${MAX_DIGITS} digits`);
  return BigInt(s);
}

function wordsPositive(n, lang) {
  const u = UNITS[lang] || UNITS.bn;
  const small = lang === "en" ? en99 : (k) => BN_0_99[k];
  if (n === 0n) return small(0);
  const parts = [];
  const crore = n / 10000000n;
  let rest = Number(n % 10000000n);
  // Above 99 crore the crore count itself is spoken in the same system ("১২৩ কোটি" = "এক শত তেইশ কোটি").
  if (crore > 0n) parts.push(wordsPositive(crore, lang), u.crore);
  for (const [size, word] of [[100000, u.lakh], [1000, u.thousand], [100, u.hundred]]) {
    const k = Math.floor(rest / size);
    if (k) parts.push(small(k), word);
    rest %= size;
  }
  if (rest) parts.push(small(rest));
  return parts.join(" ");
}

/** Whole number to words in the South Asian system (hundred, thousand, lakh, crore). lang: "bn" | "en". */
export function numberToWords(value, lang = "bn") {
  const n = parseWhole(value);
  const words = wordsPositive(n < 0n ? -n : n, lang);
  if (n >= 0n) return words;
  return lang === "en" ? `minus ${words}` : `ঋণাত্মক ${words}`;
}

/** "1250.50", "৳১,২৫০" or "-10.5" -> { neg, whole, paisa } with paisa in 0..99. */
function parseAmount(amount) {
  const s = toEnglishDigits(String(amount)).replace(/[,\s৳]/g, "").replace(/^tk\.?/i, "");
  if (!/^[+-]?\d+(\.\d{1,2})?$/.test(s)) throw new RangeError("Give an amount like 1250 or 1250.50");
  const body = s.replace(/^[+-]/, "");
  const [whole, frac = ""] = body.split(".");
  if (whole.length > MAX_DIGITS) throw new RangeError("That amount is too large");
  const paisa = Number((frac + "00").slice(0, 2));
  const taka = BigInt(whole);
  return { neg: s.startsWith("-") && (taka !== 0n || paisa !== 0), whole: whole.replace(/^0+(?=\d)/, ""), taka, paisa };
}

/** Taka amount in words, as written on cheques and invoices. 1250.5 -> "এক হাজার দুই শত পঞ্চাশ টাকা পঞ্চাশ পয়সা মাত্র". */
export function takaInWords(amount, lang = "bn") {
  const { neg, taka, paisa } = parseAmount(amount);
  const prefix = neg ? (lang === "en" ? "minus " : "ঋণাত্মক ") : "";
  if (lang === "en") {
    const w = `${numberToWords(taka, "en")} taka`;
    return prefix + (paisa ? `${w} and ${numberToWords(paisa, "en")} paisa` : w) + " only";
  }
  const w = `${numberToWords(taka, "bn")} টাকা`;
  return prefix + (paisa ? `${w} ${numberToWords(paisa, "bn")} পয়সা` : w) + " মাত্র";
}

/** Taka with the ৳ sign and two decimal places. 1250.5 -> "৳১,২৫০.৫০". */
export function formatTaka(amount, { bangla = true, symbol = true } = {}) {
  const { neg, whole, paisa } = parseAmount(amount);
  const grouped = formatNumber(whole, { bangla: false });
  const out = `${neg ? "-" : ""}${symbol ? "৳" : ""}${grouped}.${String(paisa).padStart(2, "0")}`;
  return bangla ? toBanglaDigits(out) : out;
}

const BN_ORDINAL = ["", "প্রথম", "দ্বিতীয়", "তৃতীয়", "চতুর্থ", "পঞ্চম", "ষষ্ঠ", "সপ্তম", "অষ্টম", "নবম", "দশম"];

/**
 * Ordinal. 1-10 use the classical forms (প্রথম … দশম). Larger numbers use the
 * productive form ২১তম, which is the usual modern spelling.
 */
export function ordinal(value, lang = "bn") {
  const n = parseWhole(value);
  if (n <= 0n) throw new RangeError("Give a positive whole number");
  const text = n.toString();
  if (lang === "en") {
    const lastTwo = Number(text.slice(-2));
    const last = Number(text.slice(-1));
    const suf = lastTwo >= 11 && lastTwo <= 13 ? "th" : { 1: "st", 2: "nd", 3: "rd" }[last] || "th";
    return text + suf;
  }
  if (n <= 10n) return BN_ORDINAL[Number(n)];
  return toBanglaDigits(text) + "তম";
}

/** 25 -> "২৫%". The number is the percent itself, not a fraction. */
export function formatPercent(value, { bangla = true } = {}) {
  const s = toEnglishDigits(String(value)).replace(/[,\s%]/g, "");
  if (!/^[+-]?\d+(\.\d+)?$/.test(s)) throw new RangeError("Give a percent like 25 or 12.5");
  const out = s.replace(/^\+/, "") + "%";
  return bangla ? toBanglaDigits(out) : out;
}

/** 25 -> "শতকরা পঁচিশ". Whole percents only. */
export function percentInWords(value, lang = "bn") {
  const s = toEnglishDigits(String(value)).replace(/[,\s%]/g, "");
  if (!/^\d{1,6}$/.test(s)) throw new RangeError("Give a whole percent from 0 to 999999");
  if (lang === "en") return `${numberToWords(s, "en")} percent`;
  return `শতকরা ${numberToWords(s, "bn")}`;
}

/** Group digits the South Asian way: 12345678 -> "1,23,45,678" (or Bangla digits with bangla=true). */
export function formatNumber(value, { bangla = true } = {}) {
  const s = toEnglishDigits(String(value)).replace(/[,\s]/g, "");
  const m = /^(-?)(\d+)(\.\d+)?$/.exec(s);
  if (!m) throw new RangeError("Give a number like 1234567.89");
  const [, sign, int, dec = ""] = m;
  const grouped = int.length <= 3 ? int : int.slice(0, -3).replace(/\B(?=(\d{2})+$)/g, ",") + "," + int.slice(-3);
  const out = sign + grouped + dec;
  return bangla ? toBanglaDigits(out) : out;
}
