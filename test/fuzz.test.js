import { test } from "node:test";
import assert from "node:assert/strict";
import { numberToWords, phoneticToBangla } from "../src/index.js";
import { bijoyToUnicode } from "../src/bijoy.js";
import { normalizeBangla } from "../src/text.js";

function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

test("number words agree for a number and its digit string", () => {
  const rand = rng(20261120);
  for (let i = 0; i < 200; i++) {
    const n = Math.floor(rand() * 5_000_000);
    assert.equal(numberToWords(n), numberToWords(String(n)));
    assert.equal(numberToWords(n).length > 0, true);
  }
});

test("phonetic, Bijoy and normalization stay inside their limits", () => {
  const rand = rng(7);
  const alphabet = "abcdeghijklmnoprstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ^.`";
  for (let i = 0; i < 100; i++) {
    let text = "";
    const len = Math.floor(rand() * 40);
    for (let j = 0; j < len; j++) text += alphabet[Math.floor(rand() * alphabet.length)];
    assert.equal(typeof phoneticToBangla(text), "string");
    assert.equal(typeof bijoyToUnicode(text), "string");
    const messy = text + "ক\u09c7\u09be" + "\u200b".repeat(i % 3);
    assert.equal(normalizeBangla(normalizeBangla(messy)), normalizeBangla(messy));
  }
  assert.throws(() => phoneticToBangla("a".repeat(100_001)));
  assert.throws(() => bijoyToUnicode("A".repeat(100_001)));
  assert.throws(() => normalizeBangla("ক".repeat(100_001)));
});

test("hot paths finish a few thousand calls quickly", () => {
  const start = performance.now();
  for (let i = 0; i < 2000; i++) {
    numberToWords(i);
    phoneticToBangla("ami banglay gan gai");
    bijoyToUnicode("Avgvi");
    normalizeBangla("বাংলা");
  }
  const elapsed = performance.now() - start;
  assert.ok(elapsed < 4000, `took ${elapsed}ms`);
});
