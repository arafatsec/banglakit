import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

test("generated datasets are pinned to LF line endings", () => {
  const git = spawnSync("git", ["check-attr", "eol", "--", "datasets/numbers/train.jsonl", "datasets/dates/train.csv"], { encoding: "utf8" });
  assert.equal(git.status, 0, git.stderr);
  const attrs = new Map(git.stdout.trim().split("\n").map(line => {
    const [, path, value] = line.match(/^(.*): eol: (.*)$/);
    return [path, value];
  }));
  assert.equal(attrs.get("datasets/numbers/train.jsonl"), "lf");
  assert.equal(attrs.get("datasets/dates/train.csv"), "lf");
});
