// Phonetic typing: English letters -> Bangla ("ami banglay gan gai" -> "আমি বাংলায় গান গাই").
// The rules follow the published Avro Phonetic typing guide (OmicronLab / the same rules
// documented at https://avro.aminul.dev/guide.html). This file is written from those rules,
// not copied from Avro's source.
//
// Deliberate differences from a full Avro keyboard:
// - There is no dictionary and no autocorrect, so two consonants always join
//   (`amra` -> আম্রা). Type a backtick to keep them apart (`am`ra` -> আমরা).
// - Lowercase `oi` / `ou` also make ঐ / ঔ. Avro's guide asks for `OI` / `OU`.
// - `chh` is kept as another way to type ছ, so older examples such as `achhO` still work.
//   The Avro spelling is `ch` (and `cch` for the conjunct চ্ছ).

const HASANTA = "্";
const ZWNJ = "\u200C";
const MAX = 100_000;

const CONSONANTS = {
  kkh: "ক্ষ", kSh: "ক্ষ", kh: "খ", k: "ক", gh: "ঘ", g: "গ", Ng: "ঙ", ng: "ং",
  chh: "ছ", ch: "ছ", c: "চ", jh: "ঝ", j: "জ", NG: "ঞ",
  Th: "ঠ", T: "ট", Dh: "ঢ", D: "ড", Rh: "ঢ়", R: "ড়", N: "ণ",
  th: "থ", t: "ত", dh: "ধ", d: "দ", n: "ন",
  ph: "ফ", f: "ফ", p: "প", bh: "ভ", v: "ভ", b: "ব", m: "ম",
  z: "য", Z: "য", y: "য়", Y: "য়", r: "র", l: "ল",
  Sh: "ষ", sh: "শ", S: "শ", s: "স", h: "হ",
  x: "ক্স", q: "ক", w: "ও",
};
const VOWELS = {
  OI: ["ঐ", "ৈ"], OU: ["ঔ", "ৌ"], oi: ["ঐ", "ৈ"], ou: ["ঔ", "ৌ"],
  rri: ["ঋ", "ৃ"], aa: ["আ", "া"], ee: ["ঈ", "ী"], oo: ["উ", "ু"],
  a: ["আ", "া"], A: ["আ", "া"], i: ["ই", "ি"], I: ["ঈ", "ী"], u: ["উ", "ু"], U: ["ঊ", "ূ"],
  e: ["এ", "ে"], E: ["এ", "ে"], O: ["ও", "ো"], o: ["অ", ""],
};
// Longest key first, so ".`" wins over "." and "t``" wins over a plain letter.
const MARKS = { ".`": ".", ":`": ":", "t``": "ৎ", ",,": HASANTA + ZWNJ, ":": "ঃ", "^": "ঁ", ".": "।", $: "৳" };

const SPECIAL_CAPS = new Set(["T", "D", "N", "R", "S", "O", "I", "U", "Y", "Z"]);

/** Letters that are not case-sensitive in Avro also accept the other case. */
function withLooseCase(map) {
  const out = { ...map };
  for (const [key, val] of Object.entries(map)) {
    if (key !== key.toLowerCase()) continue;
    const candidates = [];
    if (key.length > 1) candidates.push(key[0] + key.slice(1).toUpperCase());
    const firstUp = key[0].toUpperCase() + key.slice(1);
    if (!SPECIAL_CAPS.has(firstUp[0])) candidates.push(firstUp, key.toUpperCase());
    for (const c of candidates) if (out[c] === undefined) out[c] = val;
  }
  return out;
}

const CONS = withLooseCase(CONSONANTS);
const VOWS = withLooseCase(VOWELS);
const NO_CONJUNCT_AFTER = new Set(["ং", "য়", "ড়", "ঢ়", "ৎ"]);
const keysByLength = (obj) => Object.keys(obj).sort((a, b) => b.length - a.length);
const CK = keysByLength(CONS);
const VK = keysByLength(VOWS);
const MK = keysByLength(MARKS);
const match = (src, i, keys) => keys.find((k) => src.startsWith(k, i));

/** Convert phonetic English letters to Bangla. Anything inside `{...}` is left as typed. */
export function phoneticToBangla(input) {
  const src = String(input);
  if (src.length > MAX) throw new RangeError("Text is too long");
  let out = "";
  let prev = "space"; // "space" | "consonant" | "vowel" | "break" | "virama"
  let prevCons = "";
  let forceFull = false;
  for (let i = 0; i < src.length; ) {
    if (src[i] === "{") {
      const end = src.indexOf("}", i);
      out += end === -1 ? src.slice(i + 1) : src.slice(i + 1, end);
      i = end === -1 ? src.length : end + 1;
      prev = "space"; prevCons = ""; forceFull = false; continue;
    }
    if (src[i] === "`") {
      prev = "break"; prevCons = "";
      forceFull = Boolean(match(src, i + 1, VK));
      i++; continue;
    }
    if (src.startsWith(".", i) && !src.startsWith(".`", i) && /[0-9০-৯]/.test(out.at(-1) || "") && /[0-9]/.test(src[i + 1] || "")) {
      out += "."; i++; prev = "space"; prevCons = ""; continue;
    }
    if (src.startsWith(":", i) && !src.startsWith(":`", i) && /[0-9০-৯]/.test(out.at(-1) || "") && /[0-9]/.test(src[i + 1] || "")) {
      out += ":"; i++; prev = "space"; prevCons = ""; continue;
    }
    const mk = match(src, i, MK);
    if (mk) {
      out += MARKS[mk]; i += mk.length;
      prev = mk === "t``" ? "consonant" : "space"; prevCons = mk === "t``" ? "ৎ" : ""; forceFull = false; continue;
    }
    const vk = match(src, i, VK);
    if (vk) {
      const [full, sign] = VOWS[vk];
      // A consonant, a reph, or a phala can still take a vowel sign. A phala does not
      // glue the following consonant on (ব্যক্তি is ব্য + ক্তি, not one cluster).
      const carrier = prev === "consonant" || prev === "virama" || prev === "phala";
      if (!forceFull && !carrier && prev !== "vowel" && (vk === "a" || vk === "A") && src[i + vk.length] === "Z") {
        out += "অ্যা"; i += vk.length + 1; prev = "vowel"; prevCons = ""; continue;
      }
      let piece;
      if (forceFull || !carrier) {
        if (!forceFull && prev === "vowel" && vk === "o") piece = "ও";
        else if (!forceFull && prev === "vowel" && (vk === "a" || vk === "A")) piece = "য়া";
        else piece = full;
      } else piece = sign;
      out += piece; i += vk.length; prev = "vowel"; prevCons = ""; forceFull = false; continue;
    }
    const ck = match(src, i, CK);
    if (ck) {
      if (ck === "r" && src.startsWith("rr", i) && !src.startsWith("rri", i)) {
        const next = match(src, i + 2, CK);
        if (next && CONS[next] !== "ং") { out += "র্"; i += 2; prev = "virama"; prevCons = ""; continue; }
      }
      if (ck === "y" && prev !== "consonant" && prev !== "vowel" && prev !== "virama") {
        out += "ইয়"; i += ck.length; prev = "consonant"; prevCons = "য়"; continue;
      }
      if (ck === "w" && prev === "consonant" && !NO_CONJUNCT_AFTER.has(prevCons)) {
        out += HASANTA + "ব"; i += 1; prev = "phala"; prevCons = ""; continue;
      }
      if ((ck === "y" || ck === "Z") && prev === "consonant" && !NO_CONJUNCT_AFTER.has(prevCons)) {
        out += HASANTA + "য"; i += 1; prev = "phala"; prevCons = ""; continue;
      }
      if (ck === "Z" && prev === "vowel") {
        out += HASANTA + "য"; i += 1; prev = "phala"; prevCons = ""; continue;
      }
      if (ck === "w" || ck === "W") {
        out += "ও"; i += 1; prev = "vowel"; prevCons = ""; continue;
      }
      const letter = CONS[ck];
      if (prev === "consonant" && !NO_CONJUNCT_AFTER.has(prevCons) && letter !== "ং") out += HASANTA;
      out += letter; i += ck.length; prev = "consonant"; prevCons = letter; continue;
    }
    const ch = src[i];
    out += /[0-9]/.test(ch) ? "০১২৩৪৫৬৭৮৯"[ch] : ch;
    prev = /[A-Za-z]/.test(ch) ? prev : "space"; prevCons = ""; forceFull = false; i++;
  }
  return out;
}
