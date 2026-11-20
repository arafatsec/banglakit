import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

test("the leaderboard baseline is the library and does not call a network", () => {
  const run = spawnSync(process.execPath, ["datasets/score-model.mjs"], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /runner: banglakit/);
  assert.match(run.stdout, /datasets\/taka\/train\.jsonl/);
  assert.match(run.stdout, /datasets\/text\/cc0\/tatoeba\/train\.jsonl/);
  assert.match(run.stdout, /100\.0%/);
  assert.doesNotMatch(run.stdout, /sk-|api_key/i);
});

test("a paid model host is refused before any request", () => {
  const run = spawnSync(process.execPath, ["datasets/score-model.mjs"], {
    encoding: "utf8",
    env: { ...process.env, OPENAI_BASE_URL: "https://api.openai.com/v1", OPENAI_API_KEY: "not-a-real-key", OPENAI_MODEL: "gpt-test" },
  });
  assert.equal(run.status, 2);
  assert.match(run.stderr, /Refusing api.openai.com/);
});
