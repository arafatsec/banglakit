// Bangla text: Unicode cleanup, ISO 15919 romanization, collation, counts, stopwords.
import { loadJson } from "./load.js";

const MAX = 100_000;
const HASANTA = "্";

const CONS = {
  ক: "k", খ: "kh", গ: "g", ঘ: "gh", ঙ: "ṅ",
  চ: "c", ছ: "ch", জ: "j", ঝ: "jh", ঞ: "ñ",
  ট: "ṭ", ঠ: "ṭh", ড: "ḍ", ঢ: "ḍh", ণ: "ṇ",
  ত: "t", থ: "th", দ: "d", ধ: "dh", ন: "n",
  প: "p", ফ: "ph", ব: "b", ভ: "bh", ম: "m",
  য: "y", র: "r", ল: "l", শ: "ś", ষ: "ṣ", স: "s", হ: "h",
  ড়: "ṛ", ঢ়: "ṛh", য়: "ẏ", ৎ: "t",
};
const INDEP = { অ: "a", আ: "ā", ই: "i", ঈ: "ī", উ: "u", ঊ: "ū", ঋ: "r̥", এ: "e", ঐ: "ai", ও: "o", ঔ: "au" };
const SIGNS = { "া": "ā", "ি": "i", "ী": "ī", "ু": "u", "ূ": "ū", "ৃ": "r̥", "ে": "e", "ৈ": "ai", "ো": "o", "ৌ": "au" };
const MARKS = { "ং": "ṁ", "ঃ": "ḥ", "ঁ": "m̐" };
const ASCII = { ā: "a", ī: "i", ū: "u", ṭ: "t", ḍ: "d", ṇ: "n", ś: "sh", ṣ: "sh", ṁ: "ng", ṅ: "ng", ñ: "ny", ḥ: "h", ṛ: "r", ẏ: "y", r̥: "ri", "ṭh": "th", "ḍh": "dh", "ṛh": "rh", m̐: "n" };

function limit(input) {
  const s = String(input);
  if (s.length > MAX) throw new RangeError("Text is too long");
  return s;
}

/**
 * NFC, then drop zero-width characters that are not part of a hasanta sequence.
 * ZWJ and ZWNJ immediately after ্ are kept: they are how an explicit hasanta is written.
 * Cites Unicode Standard, Bengali (canonical composition of ো, ৌ, ড়, ঢ়, য়).
 */
export function normalizeBangla(input) {
  const src = limit(input).normalize("NFC");
  let out = "";
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === "\uFEFF" || ch === "\u200B") continue;
    if (ch === "\u200C" || ch === "\u200D") {
      if (out.at(-1) === HASANTA) out += ch;
      continue;
    }
    out += ch;
  }
  return out.normalize("NFC");
}

/**
 * Orthographic ISO 15919. The inherent অ is written "a", including at the end of a word.
 * Spoken schwa deletion is not applied, because spelling does not tell you where it happens.
 * style "ascii" folds the diacritics (bāṁlā -> bangla). That form is not reversible.
 */
export function romanize(input, { style = "iso" } = {}) {
  const s = normalizeBangla(input);
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "র" && s[i + 1] === HASANTA && CONS[s[i + 2]]) {
      out += "r"; i++; continue; // reph, encoded before the consonant it sits on
    }
    if (CONS[ch]) {
      out += CONS[ch];
      const next = s[i + 1];
      if (next === HASANTA) { i++; continue; }
      if (SIGNS[next]) { out += SIGNS[next]; i++; continue; }
      out += "a"; continue;
    }
    if (INDEP[ch]) { out += INDEP[ch]; continue; }
    if (MARKS[ch]) { out += MARKS[ch]; continue; }
    out += ch;
  }
  if (style === "ascii") {
    return out
      .replace(/ṭh/g, "th").replace(/ḍh/g, "dh").replace(/ṛh/g, "rh")
      .replace(/r̥/g, "ri").replace(/m̐/g, "n")
      .replace(/[āīūṭḍṇśṣṁṅñḥṛẏ]/g, (c) => ASCII[c] || c);
  }
  if (style !== "iso") throw new RangeError('style must be "iso" or "ascii"');
  return out;
}

const collator = new Intl.Collator("bn");

/** CLDR Bangla collation (Unicode / Intl). */
export function compareBangla(a, b) {
  return collator.compare(String(a), String(b));
}
export function sortBangla(items) {
  if (!Array.isArray(items)) throw new TypeError("Give an array of strings");
  return items.map(String).sort(compareBangla);
}

/** Orthographic akshara: an independent vowel, or a consonant that is not under a hasanta. */
export function countSyllables(input) {
  const s = normalizeBangla(input);
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (/[অ-ঔ]/.test(ch) || (/[ক-হড়ঢ়য়ৎ]/.test(ch) && s[i - 1] !== HASANTA)) n++;
  }
  return n;
}

export function countWords(input) {
  const tokens = limit(input).trim().split(/\s+/).filter(Boolean);
  return { tokens: tokens.length, bangla: tokens.filter((t) => /[ঀ-৿]/.test(t)).length };
}

/** Split on danda, question mark, exclamation mark and line breaks. The mark stays on the sentence. */
export function splitSentences(input) {
  return limit(input).trim().split(/(?<=[।?!])\s*|\n+/).map((s) => s.trim()).filter(Boolean);
}

let stopwords;
function stopwordSet() {
  if (!stopwords) stopwords = new Set(loadJson("../data/stopwords-bn.json"));
  return stopwords;
}
export function banglaStopwords() {
  return [...stopwordSet()];
}
export function isStopword(word) {
  return stopwordSet().has(String(word).normalize("NFC"));
}
/** Drop stopwords. Other characters, including spaces between kept words, stay. */
export function removeStopwords(input) {
  return limit(input)
    .replace(/[ঀ-৿]+/g, (word) => (isStopword(word.normalize("NFC")) ? "" : word))
    .replace(/[ \t]{2,}/g, " ")
    .replace(/^[ \t]+|[ \t]+$/g, "");
}
