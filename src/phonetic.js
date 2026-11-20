// Phonetic typing: English letters -> Bangla ("ami banglay gan gai" -> "আমি বাংলায় গান গাই").
// Rules follow the widely known phonetic style (similar to Avro Phonetic), written from scratch.
// Case matters for a few letters: T/Th/D/Dh/N/R/Rh/S/J/O/I/U/OI/OU (see README table).

const HASANTA = "্";

// Consonants, longest keys first is handled by the matcher.
const CONSONANTS = {
  kkh: "ক্ষ", kSh: "ক্ষ", kh: "খ", k: "ক", gh: "ঘ", g: "গ", Ng: "ঙ", ng: "ং",
  chh: "ছ", ch: "চ", c: "চ", jh: "ঝ", j: "জ", J: "য", NG: "ঞ",
  Th: "ঠ", T: "ট", Dh: "ঢ", D: "ড", Rh: "ঢ়", R: "ড়", N: "ণ",
  th: "থ", t: "ত", dh: "ধ", d: "দ", n: "ন",
  ph: "ফ", f: "ফ", p: "প", bh: "ভ", v: "ভ", b: "ব", m: "ম",
  z: "য", Z: "য", y: "য়", r: "র", l: "ল",
  Sh: "ষ", sh: "শ", S: "ষ", s: "স", h: "হ",
  x: "ক্স", q: "ক", w: "ও",
};
// Independent vowels (word start or after another vowel) and their signs after a consonant.
const VOWELS = {
  OI: ["ঐ", "ৈ"], OU: ["ঔ", "ৌ"], oi: ["ঐ", "ৈ"], ou: ["ঔ", "ৌ"],
  rri: ["ঋ", "ৃ"], aa: ["আ", "া"], ee: ["ঈ", "ী"], oo: ["উ", "ু"],
  a: ["আ", "া"], A: ["আ", "া"], i: ["ই", "ি"], I: ["ঈ", "ী"], u: ["উ", "ু"], U: ["ঊ", "ূ"],
  e: ["এ", "ে"], E: ["এ", "ে"], O: ["ও", "ো"], o: ["অ", ""],
};
// Signs and marks that never join clusters.
const MARKS = { ":": "ঃ", "^": "ঁ", "t``": "ৎ", ".": "।", $: "৳" };
const DIGITS = "০১২৩৪৫৬৭৮৯";

const keysByLength = (obj) => Object.keys(obj).sort((a, b) => b.length - a.length);
const CK = keysByLength(CONSONANTS);
const VK = keysByLength(VOWELS);
const MK = keysByLength(MARKS);
const match = (src, i, keys) => keys.find((k) => src.startsWith(k, i));

// Pairs that should stay as two letters, not a conjunct (r + y is "র্য" in standard words, so not listed).
const NO_CONJUNCT_AFTER = new Set(["ং", "য়", "ড়", "ঢ়", "ৎ"]);

/** Convert phonetic English letters to Bangla. Anything inside `{...}` is left as typed. */
export function phoneticToBangla(input) {
  const src = String(input);
  let out = "";
  let prev = "space"; // "space" | "consonant" | "vowel"
  let prevCons = "";
  for (let i = 0; i < src.length; ) {
    if (src[i] === "{") { // escape: keep English as-is
      const end = src.indexOf("}", i);
      const lit = end === -1 ? src.slice(i + 1) : src.slice(i + 1, end);
      out += lit; i = end === -1 ? src.length : end + 1; prev = "space"; continue;
    }
    const mk = match(src, i, MK);
    if (mk) { out += MARKS[mk]; i += mk.length; prev = mk === "t``" ? "consonant" : "space"; prevCons = ""; continue; }
    const vk = match(src, i, VK);
    if (vk) {
      const [full, sign] = VOWELS[vk];
      // A lone "o" after another vowel is ও (dao -> দাও); at the start of a word it is অ.
      out += prev === "consonant" ? sign : vk === "o" && prev === "vowel" ? "ও" : full;
      i += vk.length; prev = "vowel"; prevCons = ""; continue;
    }
    const ck = match(src, i, CK);
    if (ck) {
      // After a consonant, y/Z make the ya-phala (ক্য) and w the ba-phala (স্ব), as in common phonetic typing.
      if (prev === "consonant" && (ck === "y" || ck === "Z" || ck === "w") && !NO_CONJUNCT_AFTER.has(prevCons)) {
        out += HASANTA + (ck === "w" ? "ব" : "য"); i += 1; prevCons = ""; continue;
      }
      const letter = CONSONANTS[ck];
      // Two consonants in a row form a conjunct (ক + ষ -> ক্ষ), except after letters that cannot join.
      if (prev === "consonant" && !NO_CONJUNCT_AFTER.has(prevCons) && letter !== "ং") out += HASANTA;
      out += letter; i += ck.length; prev = "consonant"; prevCons = letter; continue;
    }
    const ch = src[i];
    out += /[0-9]/.test(ch) ? DIGITS[ch] : ch;
    prev = /[a-zA-Z]/.test(ch) ? prev : "space"; prevCons = ""; i++;
  }
  return out;
}
