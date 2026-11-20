// Bangla word -> one Avro-style spelling. Returns "" when this encoder cannot
// represent the word. Callers keep a spelling only if phoneticToBangla gives the word back.
const SIGN = {
  "া": "a", "ি": "i", "ী": "I", "ু": "u", "ূ": "U", "ৃ": "rri",
  "ে": "e", "ৈ": "OI", "ো": "O", "ৌ": "OU",
};
const VOWEL = {
  অ: "o", আ: "a", ই: "i", ঈ: "I", উ: "u", ঊ: "U", ঋ: "rri", এ: "e", ঐ: "OI", ও: "O", ঔ: "OU",
};
const CONS = {
  ক: "k", খ: "kh", গ: "g", ঘ: "gh", ঙ: "Ng", চ: "c", ছ: "ch", জ: "j", ঝ: "jh", ঞ: "NG",
  ট: "T", ঠ: "Th", ড: "D", ঢ: "Dh", ণ: "N", ত: "t", থ: "th", দ: "d", ধ: "dh", ন: "n",
  প: "p", ফ: "ph", ব: "b", ভ: "bh", ম: "m", য: "z", র: "r", ল: "l", শ: "sh", ষ: "Sh", স: "s", হ: "h",
  ড়: "R", ঢ়: "Rh", য়: "y", ৎ: "t``",
};
const MARK = { "ং": "ng", "ঃ": ":", "ঁ": "^" };

/** One spelling for a single word. Empty string means "this encoder skipped it". */
export function banglaToPhonetic(word) {
  const s = String(word).normalize("NFC");
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const next = s[i + 1];
    const next2 = s[i + 2];
    if (MARK[ch]) { out += MARK[ch]; continue; }
    if (VOWEL[ch]) { out += VOWEL[ch]; continue; }
    if (!CONS[ch]) return "";
    if (ch === "য়" && out === "") out += "Y";
    else out += CONS[ch];
    if (next === "্") {
      if (next2 === "য") { out += "y"; i += 2; continue; }
      if (next2 === "ব") { out += "w"; i += 2; continue; }
      if (!CONS[next2]) return "";
      i += 1; // the following consonant is written next, and the engine joins it
      continue;
    }
    if (SIGN[next]) { out += SIGN[next]; i += 1; continue; }
    const followed = next && (CONS[next] || VOWEL[next]);
    if (followed) out += "o";
  }
  return out;
}
