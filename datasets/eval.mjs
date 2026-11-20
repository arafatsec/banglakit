#!/usr/bin/env node
// Score predictions against a banglakit gold JSONL file.
// A prediction file is JSONL with { "id", "output" }.
// With no prediction file, the library itself is scored (it should be exact).
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import * as bk from "../src/index.js";
import { cleanSentence } from "./text/filters.mjs";
import { extractNumbers } from "./text/extract.mjs";

export const norm = (value) => String(value ?? "").normalize("NFC").replace(/\s+/g, " ").trim();

export function readJsonl(path) {
  return readFileSync(path, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

/** Recompute the gold output from the row. Used to prove the files still match the library. */
export function expected(row) {
  const meta = row.meta || {};
  switch (row.task) {
    case "number_to_words": return bk.numberToWords(row.input, meta.lang || "bn");
    case "taka_in_words": return bk.takaInWords(row.input, meta.lang || "bn");
    case "ordinal": return bk.ordinal(row.input, meta.lang || "bn");
    case "bangla_date": return bk.toBanglaDate(row.input).text;
    case "hijri_date": return bk.toHijri(row.input).text;
    case "phonetic": return bk.phoneticToBangla(row.input);
    case "bijoy_to_unicode": return bk.bijoyToUnicode(row.input);
    case "romanize": return bk.romanize(row.input, { style: meta.style || "iso" });
    case "normalize": return bk.normalizeBangla(row.input);
    case "format_time": return bk.formatTime(row.input).text;
    case "real_normalize": return cleanSentence(row.input);
    case "extract_numbers": return JSON.stringify(extractNumbers(row.input));
    case "translation_pair": {
      if (!/[\u0980-\u09FF]/.test(row.input) || !String(row.output).trim()) throw new Error(`Bad pair ${row.id}`);
      return row.output;
    }
    case "place_qa": {
      if (meta.type === "division") return bk.listDivisions().find((item) => item.id === meta.id).code;
      if (meta.type === "district") return bk.listDistricts().find((item) => item.id === meta.id).code;
      return bk.listUpazilas(meta.districtId).find((item) => item.id === meta.id).district;
    }
    default: throw new Error(`Unknown task ${row.task}`);
  }
}

export function score(gold, predictions) {
  const byId = new Map(predictions.map((row) => [row.id, row.output]));
  const misses = [];
  let exact = 0;
  for (const row of gold) {
    if (!byId.has(row.id)) { misses.push({ id: row.id, reason: "missing" }); continue; }
    if (norm(byId.get(row.id)) === norm(row.output)) exact += 1;
    else misses.push({ id: row.id, reason: "mismatch", output: byId.get(row.id) });
  }
  return { total: gold.length, exact, accuracy: gold.length ? exact / gold.length : 0, misses };
}

function libraryPredictions(gold) {
  return gold.map((row) => ({ id: row.id, output: expected(row) }));
}

function main() {
  const goldPath = process.argv[2];
  const predPath = process.argv[3];
  if (!goldPath) {
    console.error("usage: node datasets/eval.mjs <gold.jsonl> [predictions.jsonl]");
    process.exit(1);
  }
  const gold = readJsonl(goldPath);
  const predictions = predPath ? readJsonl(predPath) : libraryPredictions(gold);
  const result = score(gold, predictions);
  console.log(`${result.exact}/${result.total} exact (${(result.accuracy * 100).toFixed(1)}%)`);
  for (const miss of result.misses.slice(0, 20)) console.log(`- ${miss.id}: ${miss.reason}`);
  if (result.misses.length) process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
