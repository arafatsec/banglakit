import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePhone } from "../src/phone.js";

test("formats and operators", () => {
  for (const input of ["01712345678", "+8801712345678", "8801712345678", "+880 1712-345678", "008801712345678", "০১৭১২৩৪৫৬৭৮"]) {
    assert.equal(parsePhone(input).e164, "+8801712345678", input);
  }
  const ops = { "013": "Grameenphone", "017": "Grameenphone", "014": "Banglalink", "019": "Banglalink", "018": "Robi", "016": "Airtel (Robi)", "015": "Teletalk" };
  for (const [p, op] of Object.entries(ops)) assert.equal(parsePhone(`${p}12345678`).operator, op, p);
  assert.equal(parsePhone("01712345678").display, "01712-345678");
});
test("rejects non-mobile numbers", () => {
  for (const bad of ["01212345678", "0171234567", "017123456789", "+15551234567", "abc", ""]) assert.equal(parsePhone(bad).valid, false, bad);
});
