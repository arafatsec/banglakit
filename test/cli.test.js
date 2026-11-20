import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const run = (args) => spawnSync(process.execPath, ["bin/banglakit.js", ...args], { encoding: "utf8" });

test("help and version exit 0, an unknown command exits 1", () => {
  const help = run(["--help"]);
  assert.equal(help.status, 0);
  assert.match(help.stdout, /banglakit taka/);
  assert.match(help.stdout, /banglakit nid/);
  assert.equal(run(["--version"]).status, 0);
  assert.match(run(["--version"]).stdout, /^\d+\.\d+\.\d+/);
  const bad = run(["nope"]);
  assert.equal(bad.status, 1);
  assert.match(bad.stdout, /banglakit taka/);
});
test("commands print the library result and use exit codes", () => {
  assert.equal(run(["taka", "125000.50"]).stdout.trim(), "এক লক্ষ পঁচিশ হাজার টাকা পঞ্চাশ পয়সা মাত্র");
  assert.equal(run(["ordinal", "1"]).stdout.trim(), "প্রথম");
  assert.equal(run(["type", "ca^d"]).stdout.trim(), "চাঁদ");
  assert.equal(run(["hijri", "2026-01-01"]).stdout.trim(), "১২ রজব ১৪৪৭ হিজরি");
  assert.equal(run(["roman", "বাংলা"]).stdout.trim(), "bāṁlā");
  assert.match(run(["area", "savar"]).stdout, /সাভার/);
  const phone = run(["phone", "abc"]);
  assert.equal(phone.status, 1);
  const nid = run(["nid", "12345"]);
  assert.equal(nid.status, 1);
  const missing = run(["area", "zzzz-not-a-place"]);
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /error:/);
});
