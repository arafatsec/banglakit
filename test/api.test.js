import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as bk from "../src/index.js";

test("every public export is named in the TypeScript definitions", () => {
  const dts = readFileSync("src/index.d.ts", "utf8");
  for (const name of Object.keys(bk)) assert.match(dts, new RegExp(`\\b${name}\\b`), name);
});
