#!/usr/bin/env node
// Score banglakit, or an OpenAI-compatible endpoint, against the gold JSONL files.
// No API key is stored here. Nothing is sent anywhere unless OPENAI_BASE_URL is set,
// and known paid hosts are refused unless BANGKAKIT_ALLOW_PAID=1.
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expected, readJsonl, score } from "./eval.mjs";

const PAID = new Set(["api.openai.com", "api.anthropic.com", "generativelanguage.googleapis.com"]);

function sets() {
  const out = [];
  for (const file of ["datasets/manifest.json", "datasets/text/manifest.json"]) {
    const manifest = JSON.parse(readFileSync(file, "utf8"));
    for (const name of Object.keys(manifest.counts)) out.push(`datasets/${name}/train.jsonl`);
  }
  return out;
}

function libraryRow(path) {
  const gold = readJsonl(path);
  const result = score(gold, gold.map((row) => ({ id: row.id, output: expected(row) })));
  return { path, total: result.total, exact: result.exact, accuracy: result.accuracy };
}

async function modelOutput(row, base, key, model) {
  const task = row.task;
  const response = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature: 0,
      messages: [
        { role: "system", content: "Reply with only the answer. No explanation." },
        { role: "user", content: `${task}\n${row.input}` },
      ],
    }),
  });
  if (!response.ok) throw new Error(`endpoint ${response.status}`);
  const body = await response.json();
  return body.choices?.[0]?.message?.content ?? "";
}

async function modelRow(path, base, key, model, limit) {
  const gold = readJsonl(path).slice(0, limit);
  const predictions = [];
  for (const row of gold) predictions.push({ id: row.id, output: await modelOutput(row, base, key, model) });
  const result = score(gold, predictions);
  return { path, total: result.total, exact: result.exact, accuracy: result.accuracy };
}

function table(rows, label) {
  const lines = [`| Dataset | Rows | ${label} |`, "|---|---:|---:|"];
  for (const row of rows) {
    lines.push(`| \`${row.path}\` | ${row.total} | ${(row.accuracy * 100).toFixed(1)}% |`);
  }
  return lines.join("\n");
}

async function main() {
  const base = process.env.OPENAI_BASE_URL || "";
  if (!base) {
    const rows = sets().map(libraryRow);
    console.log("runner: banglakit (library check, no network)");
    console.log(table(rows, "Library check"));
    console.log("translation_pair is a pass-through check. The library does not translate.");
    return;
  }
  const host = new URL(base).host;
  if (PAID.has(host) && process.env.BANGKAKIT_ALLOW_PAID !== "1") {
    console.error(`Refusing ${host}. This script does not call paid APIs unless BANGKAKIT_ALLOW_PAID=1.`);
    process.exitCode = 2;
    return;
  }
  const key = process.env.OPENAI_API_KEY || "";
  const model = process.env.OPENAI_MODEL || "";
  if (!key || !model) {
    console.error("Set OPENAI_API_KEY and OPENAI_MODEL. The key is read from the environment and is not written to disk.");
    process.exitCode = 2;
    return;
  }
  const limit = Number(process.env.MODEL_LIMIT || 20);
  const rows = [];
  for (const path of sets()) rows.push(await modelRow(path, base, key, model, limit));
  console.log(`runner: ${model} @ ${host} (first ${limit} rows of each set)`);
  console.log(table(rows, "Exact match"));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
