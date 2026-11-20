import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

test("the published package stays small and leaves the evaluation sets out", () => {
  const run = spawnSync("npm", ["pack", "--dry-run", "--json"], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  const info = JSON.parse(run.stdout)[0];
  assert.ok(info.unpackedSize < 1_500_000, `unpacked ${info.unpackedSize}`);
  const paths = info.files.map((file) => file.path);
  assert.equal(paths.some((path) => path.startsWith("datasets/") || path.startsWith("docs/")), false);
});
