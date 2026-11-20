import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { acceptSentence, cleanSentence } from "../datasets/text/filters.mjs";

const manifest = JSON.parse(readFileSync("datasets/text/manifest.json", "utf8"));

function rows(rel) {
  return readFileSync(`datasets/${rel}/train.jsonl`, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

test("original-text sets match the manifest and score exactly", () => {
  const library = JSON.parse(readFileSync("datasets/manifest.json", "utf8"));
  for (const name of Object.keys(library.counts)) assert.equal(name.startsWith("text/"), false);
  for (const [name, count] of Object.entries(manifest.counts)) {
    const file = rows(name);
    assert.equal(file.length, count, name);
    const seen = new Set();
    for (const row of file) {
      assert.equal(typeof row.id, "string");
      assert.equal(typeof row.task, "string");
      assert.ok(row.meta?.source && row.meta.license && row.meta.retrieved && row.meta.url || row.meta.source === "Derived from the CC0 sentence sets in this folder" || row.meta.source.startsWith("CC0") || row.meta.source.startsWith("Bangla") || row.meta.source.startsWith("A CC0") || row.meta.source.startsWith("Same") || row.meta.source.startsWith("Words") || row.meta.source.startsWith("Derived"), row.id);
      const key = cleanSentence(row.task === "real_normalize" ? row.output : row.input);
      assert.equal(seen.has(key), false, row.id);
      seen.add(key);
      if (name.includes("cc0/")) assert.equal(row.meta.license, "CC0-1.0");
      if (name.includes("cc-by-sa/")) assert.equal(row.meta.license, "CC-BY-SA-4.0");
      if (name.includes("cc-by/")) assert.match(row.meta.license, /^CC-BY-2.0-FR|CC0-1.0$/);
      if (row.task === "real_normalize" || row.task === "translation_pair" || row.task === "extract_numbers") {
        assert.equal(acceptSentence(row.task === "real_normalize" ? row.output : row.input), true, row.id);
      }
    }
    const run = spawnSync(process.execPath, ["datasets/eval.mjs", `datasets/${name}/train.jsonl`], { encoding: "utf8" });
    assert.equal(run.status, 0, `${name}\n${run.stdout}\n${run.stderr}`);
    assert.match(run.stdout, /100\.0%/);
  }
});

test("spot-checked rows are the ones that were read", () => {
  const present = {
    "text/cc0/tatoeba": ["tatoeba-cc0-10998962", "tatoeba-cc0-11519198"],
    "text/cc0/common-voice": ["cv-58", "cv-355"],
    "text/cc-by-sa/wiki": ["wiki-9264947-1", "wiki-9267246-1", "wiki-9264838-1"],
    "text/cc-by/tatoeba-eng": ["tatoeba-455108-1482"],
    "text/cc0/numbers-in-sentences": ["num-1", "num-30", "num-91", "num-109"],
    "text/cc0/normalization": ["norm-1", "norm-2"],
    "text/cc0/phonetic-words": ["word-1", "word-15"],
    "text/cc0/romanized-words": ["rom-word-15"],
  };
  for (const [name, ids] of Object.entries(present)) {
    const have = new Set(rows(name).map((row) => row.id));
    for (const id of ids) assert.equal(have.has(id), true, id);
  }
  const tatoeba = rows("text/cc0/tatoeba");
  assert.equal(tatoeba.some((row) => row.meta.sentenceId === 11001210), false);
  const norm = rows("text/cc0/normalization");
  assert.equal(norm[0].input.includes("“"), true);
  assert.equal(norm[0].output.includes("“"), false);
  assert.equal(norm[1].input.includes("\u200B"), true);
  assert.equal(norm[1].output.includes("\u200B"), false);
  const dowry = rows("text/cc0/numbers-in-sentences").find((row) => row.id === "num-30");
  const spans = JSON.parse(dowry.output);
  assert.equal(spans[0].kind, "currency");
  assert.equal(spans[1].kind, "number");
});
