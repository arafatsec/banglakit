#!/usr/bin/env node
// Build the original-Bangla text sets from local downloads and the public wiki APIs.
// Downloads are not committed. Re-run after fetching the files named in datasets/text/README.md.
import { createHash } from "node:crypto";
import { createReadStream, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { phoneticToBangla, romanize } from "../src/index.js";
import { acceptSentence, cleanSentence } from "./text/filters.mjs";
import { extractNumbers } from "./text/extract.mjs";
import { banglaToPhonetic } from "./text/to-phonetic.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "text");
const tatoebaDir = process.env.TATOEBA_DIR || "/tmp/bn-src";
const cvPath = process.env.CV_SENTENCES || "/tmp/cv-bn-sentences.txt";
const engPath = process.env.TATOEBA_ENG || "/tmp/eng_sentences.tsv";
const retrieved = "2026-11-20";
const cvKeep = Number(process.env.CV_KEEP || 2500);
const tagoreSongs = Number(process.env.TAGORE_SONGS || 24);

function writeSet(dir, rows, card) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "train.jsonl"), rows.map((row) => JSON.stringify(row)).join("\n") + "\n");
  const header = "id,task,input,output,license,source\n";
  const csv = header + rows.map((row) => [row.id, row.task, row.input, row.output, row.meta.license, row.meta.source].map(csvCell).join(",")).join("\n") + "\n";
  writeFileSync(join(dir, "train.csv"), csv);
  writeFileSync(join(dir, "README.md"), card(rows.length));
  return rows.length;
}
function csvCell(value) {
  const text = String(value ?? "").replaceAll('"', '""');
  return /[",\n]/.test(text) ? `"${text}"` : text;
}
function row(id, task, input, output, meta) {
  return { id, task, input, output, meta };
}
function dedupe(rows) {
  const seen = new Set();
  const out = [];
  for (const item of rows) {
    const key = cleanSentence(item.text || item.input);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function loadTsv(path) {
  return readFileSync(path, "utf8").split("\n").filter(Boolean).map((line) => line.split("\t"));
}

async function readLines(path, limit) {
  const lines = [];
  const rl = createInterface({ input: createReadStream(path), crlfDelay: Infinity });
  for await (const line of rl) {
    lines.push(line);
    if (lines.length >= limit) break;
  }
  return lines;
}

async function wikiExtract(host, title) {
  const url = `https://${host}/w/api.php?action=query&prop=extracts|revisions&explaintext=1&exlimit=1&rvprop=ids|timestamp&titles=${encodeURIComponent(title)}&format=json&redirects=1`;
  const response = await fetch(url, { headers: { "user-agent": "banglakit-curator/0.6 (https://github.com/arafatsec/banglakit)" } });
  if (!response.ok) throw new Error(`${url} ${response.status}`);
  const body = await response.json();
  const page = Object.values(body.query.pages)[0];
  if (!page || page.missing != null) throw new Error(`Missing ${title} on ${host}`);
  return { title: page.title, revision: page.revisions?.[0]?.revid, timestamp: page.revisions?.[0]?.timestamp, extract: page.extract || "", url: `https://${host}/wiki/${encodeURIComponent(page.title.replace(/ /g, "_"))}` };
}

function usable(text) {
  if (!acceptSentence(text)) return false;
  if (/[()\[\]"]|রচিত ছোট/.test(text)) return false;
  if (/চুদ|চোদা|চোদে|চোদন|বাড়াটা|গুদে|হস্তমৈথুন|যৌন|গণিকা|কনডম/.test(text)) return false;
  if (/কোনো পাতা নেই|উইকিপিডিয়া/.test(text)) return false;
  return true;
}

function sentencesOf(extract) {
  return extract.split(/(?<=[।?!])\s+/).map(cleanSentence).filter(usable);
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function expectHash(path, hex) {
  const got = sha256(path);
  if (got !== hex) throw new Error(`${path} sha256 ${got} does not match CHECKSUMS.json (${hex}). Refusing to rebuild against a different dump.`);
}

const banglaDigits = (n) => String(n).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);

function poemText(html) {
  const parts = [];
  for (const match of html.matchAll(/<div class="poem">([\s\S]*?)<\/div>/g)) {
    parts.push(match[1]
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;|&#160;|&#32;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&#\d+;|&\w+;/g, " "));
  }
  return parts.join("\n").replace(/\n+/g, " ");
}

async function tagoreSentences() {
  const rows = [];
  const seen = new Set();
  for (let n = 1; n <= tagoreSongs; n++) {
    const title = `গীতাঞ্জলি (১৯১৩)/${banglaDigits(n)}`;
    const url = `https://bn.wikisource.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&prop=text|revid&format=json`;
    const response = await fetch(url, { headers: { "user-agent": "banglakit-curator/0.7 (https://github.com/arafatsec/banglakit)" } });
    if (!response.ok) throw new Error(`${url} ${response.status}`);
    const body = await response.json();
    const html = body.parse?.text?.["*"] || "";
    const revision = body.parse?.revid;
    if (!revision || !html.includes('class="poem"')) throw new Error(`No proofread poem text for ${title}`);
    let inSong = 0;
    for (const text of sentencesOf(poemText(html))) {
      if (seen.has(text)) continue;
      seen.add(text);
      inSong += 1;
      rows.push(row(`tagore-1913-${n}-${inSong}`, "real_normalize", text, text, {
        source: "Bangla Wikisource, proofread text of the 1913 Indian Press edition",
        license: "CC-BY-SA-4.0",
        work: "গীতাঞ্জলি",
        author: "রবীন্দ্রনাথ ঠাকুর",
        song: n,
        title,
        revision,
        url: `https://bn.wikisource.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
        workStatus: "The 1913 edition is in the public domain: it was published before 1930, and the author died in 1941 (Bangladesh copyright is life plus 60 years). This transcription is Wikisource text, CC BY-SA 4.0.",
        attribution: "Wikisource contributors",
        retrieved,
      }));
    }
  }
  return rows;
}

async function main() {
  const cc0Rows = loadTsv(join(tatoebaDir, "ben_sentences_CC0.tsv"));
  const cc0Ids = new Set(cc0Rows.map((cols) => cols[0]));
  const detailed = new Map(loadTsv(join(tatoebaDir, "ben_sentences_detailed.tsv")).map((cols) => [cols[0], cols]));
  const sentences = new Map(loadTsv(join(tatoebaDir, "ben_sentences.tsv")).map((cols) => [cols[0], cols[2]]));

  const sums = JSON.parse(readFileSync(join(root, "CHECKSUMS.json"), "utf8"));
  expectHash(join(tatoebaDir, "ben_sentences_CC0.tsv"), sums.files["ben_sentences_CC0.tsv"].sha256);
  expectHash(join(tatoebaDir, "ben_sentences.tsv"), sums.files["ben_sentences.tsv"].sha256);
  expectHash(join(tatoebaDir, "ben_sentences_detailed.tsv"), sums.files["ben_sentences_detailed.tsv"].sha256);
  expectHash(join(tatoebaDir, "ben-eng_links.tsv"), sums.files["ben-eng_links.tsv"].sha256);
  expectHash(engPath, sums.files["eng_sentences.tsv"].sha256);
  expectHash(cvPath, sums.files["sentence-collector.txt"].sha256);

  const cc0 = dedupe(cc0Rows.map((cols) => {
    const text = cleanSentence(cols[2]);
    return { id: cols[0], text };
  }).filter((item) => usable(item.text)))
    .sort((a, b) => Number(a.id) - Number(b.id));
  const cc0Final = cc0
    .map((item) => row(`tatoeba-cc0-${item.id}`, "real_normalize", item.text, cleanSentence(item.text), {
      source: "Tatoeba",
      license: "CC0-1.0",
      sentenceId: Number(item.id),
      url: `https://tatoeba.org/en/sentences/show/${item.id}`,
      retrieved,
    }));
  const cvLines = await readLines(cvPath, 20000);
  const cv = dedupe(cvLines.map((line, index) => ({ id: index + 1, text: cleanSentence(line) })).filter((item) => usable(item.text) && /[।?!]$/.test(item.text)))
    .slice(0, cvKeep)
    .map((item) => row(`cv-${item.id}`, "real_normalize", item.text, item.text, {
      source: "Mozilla Common Voice sentence collector",
      license: "CC0-1.0",
      file: "server/data/bn/sentence-collector.txt",
      line: item.id,
      url: "https://github.com/common-voice/common-voice/blob/main/server/data/bn/sentence-collector.txt",
      retrieved,
    }));

  const wanted = new Set();
  const pairs = [];
  for (const cols of loadTsv(join(tatoebaDir, "ben-eng_links.tsv"))) {
    const [benId, engId] = cols;
    if (pairs.some((pair) => pair.benId === benId)) continue;
    const text = sentences.get(benId);
    if (!text || !usable(text)) continue;
    pairs.push({ benId, engId });
    wanted.add(engId);
  }
  const english = new Map();
  const rl = createInterface({ input: createReadStream(engPath), crlfDelay: Infinity });
  for await (const line of rl) {
    const tab = line.indexOf("\t");
    const tab2 = line.indexOf("\t", tab + 1);
    const id = line.slice(0, tab);
    if (!wanted.has(id)) continue;
    english.set(id, line.slice(tab2 + 1));
    if (english.size === wanted.size) break;
  }
  const parallel = [];
  for (const pair of pairs) {
    const en = cleanSentence(english.get(pair.engId) || "");
    const bn = cleanSentence(sentences.get(pair.benId));
    if (en.length < 8 || en.length > 180 || /[\u0980-\u09FF]/.test(en)) continue;
    const author = detailed.get(pair.benId)?.[3] || "";
    if (!cc0Ids.has(pair.benId) && !author) continue;
    parallel.push(row(`tatoeba-${pair.benId}-${pair.engId}`, "translation_pair", bn, en, {
      source: "Tatoeba",
      license: cc0Ids.has(pair.benId) ? "CC0-1.0" : "CC-BY-2.0-FR",
      banglaId: Number(pair.benId),
      englishId: Number(pair.engId),
      author,
      url: `https://tatoeba.org/en/sentences/show/${pair.benId}`,
      englishUrl: `https://tatoeba.org/en/sentences/show/${pair.engId}`,
      retrieved,
    }));
  }

  const cc0Text = new Set(cc0Final.map((item) => item.output));
  const ccBy = dedupe(loadTsv(join(tatoebaDir, "ben_sentences.tsv")).filter((cols) => !cc0Ids.has(cols[0])).map((cols) => {
    const text = cleanSentence(cols[2]);
    return { id: cols[0], text };
  }).filter((item) => usable(item.text) && !cc0Text.has(item.text)))
    .sort((a, b) => Number(a.id) - Number(b.id))
    .flatMap((item) => {
      const author = detailed.get(item.id)?.[3] || "";
      if (!author) return [];
      return [row(`tatoeba-by-${item.id}`, "real_normalize", item.text, item.text, {
        source: "Tatoeba",
        license: "CC-BY-2.0-FR",
        sentenceId: Number(item.id),
        author,
        url: `https://tatoeba.org/en/sentences/show/${item.id}`,
        retrieved,
      })];
    });

  const articles = [];
  for (const title of ["বাংলাদেশ", "ঢাকা", "বাংলা ভাষা"]) articles.push(await wikiExtract("bn.wikipedia.org", title));
  const wikiRows = [];
  for (const article of articles) {
    const taken = sentencesOf(article.extract).slice(0, 25);
    taken.forEach((text, index) => wikiRows.push(row(`wiki-${article.revision}-${index + 1}`, "real_normalize", text, text, {
      source: "Bangla Wikipedia",
      license: "CC-BY-SA-4.0",
      title: article.title,
      revision: article.revision,
      timestamp: article.timestamp,
      url: article.url,
      attribution: "Wikipedia contributors",
      retrieved,
    })));
  }
  const tagore = await tagoreSentences();
  const numberPool = [];
  for (const cols of cc0Rows) {
    const text = cleanSentence(cols[2]);
    if (usable(text) && /[0-9০-৯]/.test(text)) numberPool.push(text);
  }
  for (const line of cvLines) {
    const text = cleanSentence(line);
    if (usable(text) && /[।?!]$/.test(text) && /[0-9০-৯]/.test(text)) numberPool.push(text);
  }
  const extracts = [];
  for (const text of dedupe(numberPool.map((text) => ({ text }))).map((item) => item.text)) {
    const spans = extractNumbers(text);
    if (!spans.length) continue;
    extracts.push(row(`num-${extracts.length + 1}`, "extract_numbers", text, JSON.stringify(spans), {
      source: "Derived from the CC0 sentence sets in this folder",
      license: "CC0-1.0",
      retrieved,
    }));
    if (extracts.length >= 120) break;
  }

  const normRows = [];
  for (const item of cc0Final) {
    if (normRows.length >= 40) break;
    const clean = item.output;
    const quoted = normRows.length % 2 === 0;
    const dirty = quoted ? `“${clean}”` : (clean.includes("া") ? clean.replace("া", "া\u200B") : ` ${clean} `);
    if (cleanSentence(dirty) !== clean) continue;
    normRows.push(row(`norm-${normRows.length + 1}`, "real_normalize", dirty, clean, {
      source: "CC0 Tatoeba sentence with quotes, a space, or one zero-width space added",
      license: "CC0-1.0",
      sentenceId: item.meta.sentenceId,
      url: item.meta.url,
      noise: quoted ? "wrapping quotes" : dirty.includes("\u200B") ? "U+200B after আ-কার" : "extra spaces",
      retrieved,
    }));
  }

  const freq = new Map();
  const pool = [...cc0Final.map((item) => item.output), ...cv.map((item) => item.output)];
  for (const text of pool) for (const word of text.match(/[\u0980-\u09FF]+/g) || []) {
    const clean = word.normalize("NFC");
    if (!/[\u0985-\u09B9\u09DC-\u09DF]/.test(clean)) continue;
    if ([...clean].length < 2 || [...clean].length > 8) continue;
    freq.set(clean, (freq.get(clean) || 0) + 1);
  }
  const phonetic = [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
    .flatMap(([word, count]) => {
      const latin = banglaToPhonetic(word);
      if (!latin || phoneticToBangla(latin) !== word) return [];
      return [[latin, word, count]];
    })
    .slice(0, 400)
    .map(([latin, word, count], index) => row(`word-${index + 1}`, "phonetic", latin, word, {
      source: "Bangla word attested in the committed CC0 sentences. The Latin form is banglaToPhonetic, kept only when phoneticToBangla returns the same word.",
      license: "CC0-1.0",
      count,
      retrieved,
    }));
  const roman = [...new Set(phonetic.map((item) => item.output))].map((word, index) => row(`rom-word-${index + 1}`, "romanize", word, romanize(word), {
    source: "Same attested words as the phonetic set",
    license: "CC0-1.0",
    retrieved,
  }));

  const counts = {
    "text/cc0/tatoeba": writeSet(join(root, "cc0/tatoeba"), cc0Final, card("Tatoeba Bangla sentences (CC0)", "CC0-1.0", "https://tatoeba.org/en/downloads", "Every Tatoeba sentence marked CC0 1.0 that passes the filter. Example names in language-learning sentences are not a directory of real people.", "text-generation")),
    "text/cc0/common-voice": writeSet(join(root, "cc0/common-voice"), cv, card("Common Voice Bangla sentences (CC0)", "CC0-1.0", "https://github.com/common-voice/common-voice/blob/main/README.md", `The first ${cv.length} sentences in server/data/bn/sentence-collector.txt that pass the filter. The full file is larger; its sha256 is in CHECKSUMS.json. Raise CV_KEEP to take more. wiki.bn.txt was not used, because that text is Wikipedia and CC BY-SA.`, "text-generation")),
    "text/cc-by/tatoeba": writeSet(join(root, "cc-by/tatoeba"), ccBy, card("Tatoeba Bangla sentences (CC BY 2.0 FR)", "CC-BY-2.0-FR", "https://tatoeba.org/en/downloads", "Every other Tatoeba Bangla sentence that passes the filter. Each row names the Tatoeba author. Sentences already kept in the CC0 file are not repeated here.", "text-generation", ["bn"])),
    "text/cc-by/tatoeba-eng": writeSet(join(root, "cc-by/tatoeba-eng"), parallel, card("Tatoeba Bangla–English pairs", "CC-BY-2.0-FR", "https://tatoeba.org/en/downloads", "One English translation per Bangla sentence, for every link whose English side was found. Rows whose Bangla sentence is in the CC0 export are marked CC0-1.0. Other rows are CC BY 2.0 FR and name the Tatoeba author. Rows with no author are left out.", "translation", ["bn", "en"])),
    "text/cc-by-sa/wiki": writeSet(join(root, "cc-by-sa/wiki"), wikiRows, card("Bangla Wikipedia sentences", "CC-BY-SA-4.0", "https://bn.wikipedia.org/wiki/উইকিপিডিয়া:কপিরাইট", "Share-alike. Keep this folder separate from the CC0 and CC BY sets. Sentences come from the plain-text extracts of বাংলাদেশ, ঢাকা, and বাংলা ভাষা.", "text-generation")),
    "text/cc-by-sa/tagore": writeSet(join(root, "cc-by-sa/tagore"), tagore, card("Tagore, গীতাঞ্জলি (1913 edition)", "CC-BY-SA-4.0", "https://bn.wikisource.org/wiki/গীতাঞ্জলি_(১৯১৩)", `Share-alike transcription. Songs 1–${tagoreSongs} of the proofread 1913 Indian Press edition. The underlying book is in the public domain. Project Gutenberg's Tagore books are English translations, so they are not in this folder.`, "text-generation")),
    "text/cc0/numbers-in-sentences": writeSet(join(root, "cc0/numbers-in-sentences"), extracts, card("Numbers, dates and currency inside real CC0 sentences", "CC0-1.0", "Derived from the CC0 sentence files", "Digit spans from CC0 sentences. Each span has raw digits, ASCII digits, and a kind (number, date, or currency) from a short window around the digits, using the library month list. The gold JSON is what extractNumbers returns. A spot-check log is in datasets/text/SPOTCHECK.md.", "token-classification")),
    "text/cc0/normalization": writeSet(join(root, "cc0/normalization"), normRows, card("Normalization of real CC0 sentences", "CC0-1.0", "CC0 Tatoeba sentences", "The output is a real sentence. The input is that sentence with wrapping quotes, an extra space, or one U+200B after আ-কার. No words were invented. cleanSentence is the scorer.", "text-generation")),
    "text/cc0/phonetic-words": writeSet(join(root, "cc0/phonetic-words"), phonetic, card("Phonetic input for attested words", "CC0-1.0", "Words taken from the CC0 sentences", "The 400 most frequent words of 2–8 characters in the committed CC0 sentences whose generated spelling round-trips through phoneticToBangla. বই is absent: the spelling boi returns বৈ.", "text2text-generation")),
    "text/cc0/romanized-words": writeSet(join(root, "cc0/romanized-words"), roman, card("ISO 15919 for attested words", "CC0-1.0", "Words taken from the CC0 sentences", "The same 400 words, in orthographic ISO 15919, including a final inherent vowel when the library writes one.", "text2text-generation")),
  };
  writeFileSync(join(root, "manifest.json"), JSON.stringify({ retrieved, counts }, null, 2) + "\n");
  console.log(counts);
}

function card(title, license, source, note, task = "text-generation", languages = ["bn"]) {
  const size = (count) => count < 1000 ? "n<1K" : count < 10000 ? "1K<n<10K" : "10K<n<100K";
  return (count) => `---
license: ${license.toLowerCase()}
language:
${languages.map((lang) => `  - ${lang}`).join("\n")}
task_categories:
  - ${task}
annotations_creators:
  - found
language_creators:
  - found
multilinguality: ${languages.length > 1 ? "multilingual" : "monolingual"}
pretty_name: ${title}
size_categories:
  - ${size(count)}
configs:
  - config_name: default
    data_files:
      - split: train
        path: train.jsonl
---

# ${title}

${note}

| | |
|---|---|
| Rows | ${count} |
| Licence | ${license} |
| Source | ${source} |
| Retrieved | ${retrieved} |
| Filter | Unicode NFC, 12–180 characters, at least 8 Bangla letters, no URL or email, not mostly Latin, duplicate sentences removed, graphic sexual sentences removed |
| Provenance | One \`meta\` object per JSONL row: source, licence, and a URL |
| Limitations | Language-learning and voice-prompt sentences are short and simple. They are not a balanced sample of Bangla writing. Example personal names in Tatoeba are textbook sentences, not a list of real people. |
| Generator | \`node datasets/curate-text.mjs\` after the downloads in \`datasets/text/README.md\` |

This folder is not part of the npm package.
`;
}

await main();
