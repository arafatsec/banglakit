#!/usr/bin/env node
// Build the original-Bangla text sets from local downloads and the public wiki APIs.
// Downloads are not committed. Re-run after fetching the files named in datasets/text/README.md.
import { createReadStream, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { phoneticToBangla, romanize } from "../src/index.js";
import { acceptSentence, cleanSentence } from "./text/filters.mjs";
import { extractNumbers } from "./text/extract.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "text");
const tatoebaDir = process.env.TATOEBA_DIR || "/tmp/bn-src";
const cvPath = process.env.CV_SENTENCES || "/tmp/cv-bn-sentences.txt";
const engPath = process.env.TATOEBA_ENG || "/tmp/eng_sentences.tsv";
const retrieved = "2026-11-20";

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

async function main() {
  const cc0Rows = loadTsv(join(tatoebaDir, "ben_sentences_CC0.tsv"));
  const cc0Ids = new Set(cc0Rows.map((cols) => cols[0]));
  const detailed = new Map(loadTsv(join(tatoebaDir, "ben_sentences_detailed.tsv")).map((cols) => [cols[0], cols]));
  const sentences = new Map(loadTsv(join(tatoebaDir, "ben_sentences.tsv")).map((cols) => [cols[0], cols[2]]));

  const cc0 = dedupe(cc0Rows.map((cols) => {
    const text = cleanSentence(cols[2]);
    return { id: cols[0], text };
  }).filter((item) => usable(item.text)))
    .sort((a, b) => Number(a.id) - Number(b.id));
  const cc0Step = Math.max(1, Math.floor(cc0.length / 800));
  const cc0Picked = [];
  for (let i = 0; i < cc0.length && cc0Picked.length < 800; i += cc0Step) cc0Picked.push(cc0[i]);
  const cc0Final = cc0Picked
    .map((item) => row(`tatoeba-cc0-${item.id}`, "real_normalize", item.text, cleanSentence(item.text), {
      source: "Tatoeba",
      license: "CC0-1.0",
      sentenceId: Number(item.id),
      url: `https://tatoeba.org/en/sentences/show/${item.id}`,
      retrieved,
    }));
  const cvLines = await readLines(cvPath, 8000);
  const cv = dedupe(cvLines.map((line, index) => ({ id: index + 1, text: cleanSentence(line) })).filter((item) => usable(item.text) && /[।?!]$/.test(item.text)))
    .slice(0, 400)
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
    if (pairs.length >= 1200) break;
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
    if (parallel.length >= 500) break;
  }

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

  const words = new Set();
  const pool = [...cc0Final.map((item) => item.output), ...cv.map((item) => item.output)];
  for (const text of pool) for (const word of text.match(/[\u0985-\u09B9\u09DC-\u09DF\u09BE-\u09CC\u0982\u0983\u0981]+/g) || []) if ([...word].length >= 2 && [...word].length <= 8) words.add(word);
  const spellings = [
    ["ami", "আমি"], ["bangla", "বাংলা"], ["bangladesh", "বাংলাদেশ"], ["Dhaka", "ঢাকা"],
    ["kotha", "কথা"], ["sokal", "সকাল"], ["rat", "রাত"], ["din", "দিন"], ["aj", "আজ"],
    ["na", "না"], ["amar", "আমার"], ["bhalo", "ভাল"], ["bhalO", "ভালো"], ["gan", "গান"],
    ["pani", "পানি"], ["boi", "বই"], ["bo`i", "বই"], ["shiksha", "শিক্ষা"], ["shikkha", "শিক্ষা"],
  ];
  const phonetic = spellings
    .filter(([latin, word]) => phoneticToBangla(latin) === word && words.has(word))
    .map(([latin, word], index) => row(`word-${index + 1}`, "phonetic", latin, word, {
      source: "Bangla word attested in the CC0 sentence sets; Latin input checked with phoneticToBangla",
      license: "CC0-1.0",
      retrieved,
    }));
  const roman = [...new Set(phonetic.map((item) => item.output))].map((word, index) => row(`rom-word-${index + 1}`, "romanize", word, romanize(word), {
    source: "Same attested words as the phonetic set",
    license: "CC0-1.0",
    retrieved,
  }));

  const counts = {
    "text/cc0/tatoeba": writeSet(join(root, "cc0/tatoeba"), cc0Final, card("Tatoeba Bangla sentences (CC0)", "CC0-1.0", "https://tatoeba.org/en/downloads", "Sentences Tatoeba marks as CC0 1.0, sampled evenly by sentence id so one contributor's drill does not fill the file. Example names in language-learning sentences are not a directory of real people.")),
    "text/cc0/common-voice": writeSet(join(root, "cc0/common-voice"), cv, card("Common Voice Bangla sentences (CC0)", "CC0-1.0", "https://github.com/common-voice/common-voice/blob/main/README.md", "The first 8,000 lines of server/data/bn/sentence-collector.txt that pass the filter, capped at 400. The Wikipedia scrape wiki.bn.txt was not used, because that text starts as CC BY-SA.")),
    "text/cc-by/tatoeba-eng": writeSet(join(root, "cc-by/tatoeba-eng"), parallel, card("Tatoeba Bangla–English pairs", "CC-BY-2.0-FR", "https://tatoeba.org/en/downloads", "One English translation per Bangla sentence. Rows whose Bangla sentence is also in the CC0 export are marked CC0-1.0. Other rows are CC BY 2.0 FR and name the Tatoeba author.")),
    "text/cc-by-sa/wiki": writeSet(join(root, "cc-by-sa/wiki"), wikiRows, card("Bangla Wikipedia sentences", "CC-BY-SA-4.0", "https://bn.wikipedia.org/wiki/উইকিপিডিয়া:কপিরাইট", "Share-alike. Keep this folder separate from the CC0 and CC BY sets. Sentences come from the plain-text extracts of বাংলাদেশ, ঢাকা, and বাংলা ভাষা.")),
    "text/cc0/numbers-in-sentences": writeSet(join(root, "cc0/numbers-in-sentences"), extracts, card("Numbers, dates and currency inside real CC0 sentences", "CC0-1.0", "Derived from the CC0 sentence files", "Digit spans from CC0 sentences. Each span has raw digits, ASCII digits, and a kind (number, date, or currency) from a short window around the digits, using the library month list. The gold JSON is what extractNumbers returns. A spot-check log is in datasets/text/SPOTCHECK.md.")),
    "text/cc0/normalization": writeSet(join(root, "cc0/normalization"), normRows, card("Normalization of real CC0 sentences", "CC0-1.0", "CC0 Tatoeba sentences", "The output is a real sentence. The input is that sentence with wrapping quotes, an extra space, or one U+200B after আ-কার. No words were invented. cleanSentence is the scorer.")),
    "text/cc0/phonetic-words": writeSet(join(root, "cc0/phonetic-words"), phonetic, card("Phonetic input for attested words", "CC0-1.0", "Words taken from the CC0 sentences", "The Bangla word occurs in the CC0 sentences. The Latin input is kept only when phoneticToBangla returns that word. It is not a recording of a particular person typing.")),
    "text/cc0/romanized-words": writeSet(join(root, "cc0/romanized-words"), roman, card("ISO 15919 for attested words", "CC0-1.0", "Words taken from the CC0 sentences", "Orthographic ISO 15919, including a final inherent vowel when the library writes one.")),
  };
  writeFileSync(join(root, "manifest.json"), JSON.stringify({ retrieved, counts }, null, 2) + "\n");
  console.log(counts);
}

function card(title, license, source, note) {
  return (count) => `---
license: ${license.toLowerCase()}
language:
  - bn
pretty_name: ${title}
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
