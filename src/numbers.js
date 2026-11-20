// Bangla digits, number words (lakh/crore system) and taka amounts in words.

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

/** 2026 -> "২০২৬". Works on any string: only ASCII digits change. */
export const toBanglaDigits = (input) => String(input).replace(/[0-9]/g, (d) => BN_DIGITS[d]);

/** "২০২৬" -> "2026". Only Bangla digits change. */
export const toEnglishDigits = (input) => String(input).replace(/[০-৯]/g, (d) => BN_DIGITS.indexOf(d));

// 0-99 are irregular in Bangla, so each has its own word.
const BN_0_99 = (
  "শূন্য এক দুই তিন চার পাঁচ ছয় সাত আট নয় দশ এগারো বারো তেরো চৌদ্দ পনেরো ষোলো সতেরো আঠারো উনিশ " +
  "বিশ একুশ বাইশ তেইশ চব্বিশ পঁচিশ ছাব্বিশ সাতাশ আটাশ উনত্রিশ ত্রিশ একত্রিশ বত্রিশ তেত্রিশ চৌত্রিশ পঁয়ত্রিশ ছত্রিশ সাঁইত্রিশ আটত্রিশ উনচল্লিশ " +
  "চল্লিশ একচল্লিশ বিয়াল্লিশ তেতাল্লিশ চুয়াল্লিশ পঁয়তাল্লিশ ছেচল্লিশ সাতচল্লিশ আটচল্লিশ উনপঞ্চাশ পঞ্চাশ একান্ন বাহান্ন তিপ্পান্ন চুয়ান্ন পঞ্চান্ন ছাপ্পান্ন সাতান্ন আটান্ন উনষাট " +
  "ষাট একষট্টি বাষট্টি তেষট্টি চৌষট্টি পঁয়ষট্টি ছেষট্টি সাতষট্টি আটষট্টি উনসত্তর সত্তর একাত্তর বাহাত্তর তিয়াত্তর চুয়াত্তর পঁচাত্তর ছিয়াত্তর সাতাত্তর আটাত্তর উনআশি " +
  "আশি একাশি বিরাশি তিরাশি চুরাশি পঁচাশি ছিয়াশি সাতাশি আটাশি উননব্বই নব্বই একানব্বই বিরানব্বই তিরানব্বই চুরানব্বই পঁচানব্বই ছিয়ানব্বই সাতানব্বই আটানব্বই নিরানব্বই"
).split(" ");

const EN_0_19 = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split(" ");
const EN_TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const en99 = (n) => (n < 20 ? EN_0_19[n] : EN_TENS[Math.floor(n / 10)] + (n % 10 ? "-" + EN_0_19[n % 10] : ""));

const UNITS = {
  bn: { hundred: "শত", thousand: "হাজার", lakh: "লক্ষ", crore: "কোটি" },
  en: { hundred: "hundred", thousand: "thousand", lakh: "lakh", crore: "crore" },
};

/** Whole number to words in the South Asian system (hundred, thousand, lakh, crore). lang: "bn" | "en". */
export function numberToWords(value, lang = "bn") {
  const n = typeof value === "string" ? Number(toEnglishDigits(value).replace(/[,\s]/g, "")) : value;
  if (!Number.isSafeInteger(n) || n < 0) throw new RangeError("Give a whole number from 0 up to 9,007,199,254,740,991");
  const u = UNITS[lang] || UNITS.bn;
  const small = lang === "en" ? en99 : (k) => BN_0_99[k];
  if (n === 0) return small(0);
  const parts = [];
  const crore = Math.floor(n / 1e7);
  let rest = n % 1e7;
  // Above 99 crore the crore count itself is spoken in the same system ("১২৩ কোটি" = "এক শত তেইশ কোটি").
  if (crore) parts.push(numberToWords(crore, lang), u.crore);
  for (const [size, word] of [[1e5, u.lakh], [1e3, u.thousand], [100, u.hundred]]) {
    const k = Math.floor(rest / size);
    if (k) parts.push(small(k), word);
    rest %= size;
  }
  if (rest) parts.push(small(rest));
  return parts.join(" ");
}

/** Taka amount in words, as written on cheques and invoices. 1250.5 -> "এক হাজার দুই শত পঞ্চাশ টাকা পঞ্চাশ পয়সা মাত্র". */
export function takaInWords(amount, lang = "bn") {
  const s = toEnglishDigits(String(amount)).replace(/[,\s৳]/g, "").replace(/^tk\.?/i, "");
  if (!/^\d+(\.\d{1,2})?$/.test(s)) throw new RangeError("Give an amount like 1250 or 1250.50");
  const [whole, frac = ""] = s.split(".");
  const taka = Number(whole);
  const paisa = Number((frac + "0").slice(0, 2));
  if (lang === "en") {
    const w = `${numberToWords(taka, "en")} taka`;
    return (paisa ? `${w} and ${numberToWords(paisa, "en")} paisa` : w) + " only";
  }
  const w = `${numberToWords(taka, "bn")} টাকা`;
  return (paisa ? `${w} ${numberToWords(paisa, "bn")} পয়সা` : w) + " মাত্র";
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
