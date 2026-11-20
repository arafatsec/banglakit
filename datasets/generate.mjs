#!/usr/bin/env node
// Rebuild datasets/ from the library. The rows are deterministic. Nothing is scraped.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as bk from "../src/index.js";

const root = dirname(fileURLToPath(import.meta.url));

function csvCell(value) {
  const text = String(value).replaceAll('"', '""');
  return /[",\n]/.test(text) ? `"${text}"` : text;
}

function row(id, task, input, output, meta = {}) {
  return { id, task, input, output, meta };
}

function numbers() {
  const values = [];
  for (let n = 0; n <= 100; n++) values.push(n);
  for (const n of [101, 110, 250, 999, 1000, 1001, 10000, 100000, 1000000, 10000000, 1234567, -5]) values.push(n);
  return [
    ...values.map((n) => row(`num-${n}`, "number_to_words", String(n), bk.numberToWords(n), { lang: "bn" })),
    row("num-bn-100", "number_to_words", "১০০", bk.numberToWords("১০০"), { lang: "bn" }),
  ];
}

function taka() {
  const amounts = ["0", "1", "10.50", "1250.5", "125000.50", "10000000", "0.05", "-10.50"];
  return amounts.map((amount) => row(`taka-${amount}`, "taka_in_words", amount, bk.takaInWords(amount), { lang: "bn" }));
}

function ordinals() {
  return [1, 2, 3, 4, 10, 11, 21].map((n) => row(`ord-${n}`, "ordinal", String(n), bk.ordinal(n), { lang: "bn" }));
}

function dates() {
  const rows = [];
  for (let t = Date.UTC(2026, 0, 1); t < Date.UTC(2027, 0, 1); t += 864e5) {
    const iso = new Date(t).toISOString().slice(0, 10);
    rows.push(row(`date-${iso}`, "bangla_date", iso, bk.toBanglaDate(iso).text, {}));
  }
  for (const iso of ["1995-04-14", "2018-02-21", "2018-10-16", "2019-04-13", "2019-04-14", "2019-10-16", "2024-02-29", "2028-02-29"]) {
    rows.push(row(`date-${iso}`, "bangla_date", iso, bk.toBanglaDate(iso).text, {}));
  }
  return rows;
}

function hijri() {
  return ["2000-01-01", "2020-01-01", "2025-01-01", "2026-01-01"].map((iso) => row(`hijri-${iso}`, "hijri_date", iso, bk.toHijri(iso).text, { calendar: "tabular-islamic" }));
}

function phonetic() {
  const inputs = ["ami banglay gan gai", "amar sOnar bangla", "Dhaka", "kemon achhO", "shikkha", "rokto", "ca^d", "ache", "samia", "yahoo", "krrm", "orrko", "bishwo", "bykti", "am`ra", "Bangladesh", "OIrabot", "grriho", "ek`i", "k,,", "3.`14", "cha^d", "Sikkha"];
  return inputs.map((input) => row(`phon-${input}`, "phonetic", input, bk.phoneticToBangla(input), {}));
}

function bijoy() {
  const inputs = ["Avgvi †mvbvi evsjv", "fvlvšÍi", "g„Zz¨", "ÿwZ", "K"];
  return inputs.map((input) => row(`bijoy-${input}`, "bijoy_to_unicode", input, bk.bijoyToUnicode(input), {}));
}

function roman() {
  const words = ["বাংলা", "টাকা", "আমি", "কর্ম", ...bk.lexicon().months.map((m) => m.bn)];
  return words.map((word) => row(`rom-${word}`, "romanize", word, bk.romanize(word), { style: "iso" }));
}

function normalize() {
  const inputs = ["ক\u09c7\u09be", "বাং\u200bলা", "ক\u09cd\u200cখ"];
  return inputs.map((input, i) => row(`norm-${i}`, "normalize", input, bk.normalizeBangla(input), {}));
}

function times() {
  return ["00:00", "06:30", "12:05", "15:45", "18:00", "21:15"].map((input) => row(`time-${input}`, "format_time", input, bk.formatTime(input).text, {}));
}

function places() {
  const rows = [];
  for (const division of bk.listDivisions()) {
    rows.push(row(`div-${division.id}`, "place_qa", `What is the BBS code of ${division.en} division?`, division.code, { type: "division", id: division.id, field: "code" }));
  }
  const upazilas = [];
  for (const district of bk.listDistricts()) {
    rows.push(row(`dist-${district.id}`, "place_qa", `What is the BBS code of ${district.en} district?`, district.code, { type: "district", id: district.id, field: "code" }));
    for (const upazila of bk.listUpazilas(district.id)) upazilas.push({ ...upazila, districtId: district.id });
  }
  const counts = new Map();
  for (const upazila of upazilas) counts.set(upazila.en, (counts.get(upazila.en) || 0) + 1);
  for (const upazila of upazilas) {
    if (counts.get(upazila.en) !== 1) continue;
    rows.push(row(`upz-${upazila.districtId}-${upazila.id}`, "place_qa", `Which district is ${upazila.en} upazila in?`, upazila.district, { type: "upazila", id: upazila.id, districtId: upazila.districtId, field: "district" }));
  }
  return rows;
}

const sets = [
  ["numbers", "banglakit number words", "number_to_words", "Whole numbers written in Bangla with lakh and crore.", numbers],
  ["taka", "banglakit taka in words", "taka_in_words", "Taka amounts in cheque words, including paisa and a negative.", taka],
  ["ordinals", "banglakit ordinals", "ordinal", "Bangla ordinals. 1 to 10 are the classical forms. Larger numbers use তম.", ordinals],
  ["dates", "banglakit Bangla dates", "bangla_date", "Every Gregorian day of 2026, plus the reform boundary and leap days, as Bangla calendar text.", dates],
  ["hijri", "banglakit tabular Hijri", "hijri_date", "A few Gregorian dates as tabular Hijri text. Not moon sighting.", hijri],
  ["phonetic", "banglakit phonetic pairs", "phonetic", "Avro-style phonetic input and the Bangla banglakit returns. No dictionary.", phonetic],
  ["bijoy", "banglakit Bijoy to Unicode", "bijoy_to_unicode", "Bijoy strings from the MIT mapping's published examples, converted to Unicode.", bijoy],
  ["romanization", "banglakit ISO 15919", "romanize", "Bangla words and month names in orthographic ISO 15919. Final schwa is kept.", roman],
  ["normalization", "banglakit Unicode normalization", "normalize", "Broken Bangla sequences and the NFC, zero-width-cleaned form.", normalize],
  ["times", "banglakit clock times", "format_time", "24-hour times written with everyday Bangladesh period names.", times],
  ["places", "banglakit place questions", "place_qa", "Division and district BBS codes, and the district of every National Portal upazila.", places],
];

/** Every generated file, relative to datasets/, so tests can diff a fresh build. */
export function buildFiles() {
  const files = {};
  const counts = {};
  for (const [dir, title, task, description, build] of sets) {
    const rows = build();
    files[`${dir}/train.jsonl`] = rows.map((r) => JSON.stringify(r)).join("\n") + "\n";
    files[`${dir}/train.csv`] = "id,task,input,output\n" + rows.map((r) => [r.id, r.task, r.input, r.output].map(csvCell).join(",")).join("\n") + "\n";
    counts[dir] = rows.length;
    files[`${dir}/README.md`] = card(dir, title, task, description, rows.length);
  }
  files["manifest.json"] = JSON.stringify({ generatedBy: "datasets/generate.mjs", license: "CC0-1.0", counts }, null, 2) + "\n";
  return files;
}

function card(dir, title, task, description, count) {
  return `---
license: cc0-1.0
language:
  - bn
  - en
task_categories:
  - text2text-generation
pretty_name: ${title}
size_categories:
  - n<1K
---

# ${title}

${description}

| | |
|---|---|
| Rows | ${count} |
| Task | \`${task}\` |
| Files | \`train.jsonl\` (with \`meta\`), \`train.csv\` (id, task, input, output) |
| Licence | [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/). Generated by this repository. No scraped text. |
| Generator | \`node datasets/generate.mjs\` |
| Intended use | Score a tool or a model on this one task. A prediction file is JSONL of \`{"id","output"}\`. |
| Limitations | The output is exactly what banglakit returns today. It is not a human-annotated corpus and it is too small to train a language model. |

Score the library against itself:

\`\`\`bash
node datasets/eval.mjs datasets/${dir}/train.jsonl
\`\`\`
`;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const files = buildFiles();
  for (const [rel, body] of Object.entries(files)) {
    const path = join(root, rel);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, body);
  }
  console.log(JSON.parse(files["manifest.json"]).counts);
}
