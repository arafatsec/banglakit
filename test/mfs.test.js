import { test } from "node:test";
import assert from "node:assert/strict";
import { listMfs, findMfs } from "../src/mfs.js";
import { lexicon } from "../src/lexicon.js";
import { listOperators } from "../src/phone.js";

test("Bangladesh Bank MFS list", () => {
  const names = listMfs().map((row) => row.service);
  assert.ok(names.includes("bKash"));
  assert.ok(names.includes("Nagad"));
  assert.ok(names.includes("LENDEN"));
  assert.equal(findMfs("upay")[0].service_bn, "উপায়");
  assert.equal(findMfs("no-such-wallet").length, 0);
});

test("lexicon and operator prefixes", () => {
  const lex = lexicon();
  assert.equal(lex.months.length, 12);
  assert.equal(lex.weekdays.length, 7);
  assert.equal(lex.seasons.length, 6);
  assert.equal(lex.units[0].bn, "টাকা");
  assert.equal(listOperators().length, 7);
  assert.equal(listOperators().find((row) => row.prefix === "017").operator, "Grameenphone");
});
