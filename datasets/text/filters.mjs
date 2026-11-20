// Shared checks for committed Bangla text. Used by the curator and the tests.
import { normalizeBangla } from "../../src/text.js";

const BANGLA = /[\u0980-\u09FF]/;
const BANGLA_LETTER = /[\u0985-\u09B9\u09DC-\u09DF]/g;
const LATIN = /[A-Za-z]/g;

export function cleanSentence(input) {
  return normalizeBangla(String(input))
    .replace(/^["“”'‘’\s]+|["“”'‘’\s]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** A usable Bangla sentence: real letters, not a URL, not mostly English, not tiny. */
export function acceptSentence(input) {
  const text = cleanSentence(input);
  if (text.length < 12 || text.length > 180) return false;
  if (!BANGLA.test(text)) return false;
  if (/https?:|www\.|@/.test(text)) return false;
  if (/(?:^|\s)(?:\+?880|01[3-9])\d{8,}/.test(text.replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d)))) return false;
  const letters = text.match(BANGLA_LETTER)?.length || 0;
  const latin = text.match(LATIN)?.length || 0;
  if (letters < 8) return false;
  if (latin > letters * 0.25) return false;
  return true;
}
