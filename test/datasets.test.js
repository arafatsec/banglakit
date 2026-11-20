import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("every gold set still matches the library", () => {
  const manifest = JSON.parse(readFileSync("datasets/manifest.json", "utf8"));
  for (const name of Object.keys(manifest.counts)) {
    const run = spawnSync(process.execPath, ["datasets/eval.mjs", `datasets/${name}/train.jsonl`], { encoding: "utf8" });
    assert.equal(run.status, 0, `${name}\n${run.stdout}\n${run.stderr}`);
    assert.match(run.stdout, /100\.0%/);
  }
});

test("a wrong prediction is not a perfect score", () => {
  const dir = mkdtempSync(join(tmpdir(), "banglakit-"));
  const pred = join(dir, "pred.jsonl");
  writeFileSync(pred, `${JSON.stringify({ id: "ord-1", output: "wrong" })}\n`);
  const run = spawnSync(process.execPath, ["datasets/eval.mjs", "datasets/ordinals/train.jsonl", pred], { encoding: "utf8" });
  assert.equal(run.status, 1);
  assert.match(run.stdout, /ord-1/);
});
