import { test } from "node:test";
import assert from "node:assert/strict";
import { parseNid, parseTin, parseBin, parsePostcode } from "../src/id.js";

test("NID lengths, without pretending to know the checksum", () => {
  assert.equal(parseNid("১২৩৪৫৬৭৮৯১").kind, "smart");
  assert.equal(parseNid("0123456789").valid, false);
  assert.equal(parseNid("1234567890123").kind, "legacy-13");
  const long = parseNid("19901234567890123");
  assert.equal(long.kind, "legacy-17");
  assert.equal(long.birthYear, 1990);
  assert.equal(parseNid("12345").valid, false);
  assert.equal(parseNid("1234567890").checks, "format only");
});
test("TIN, BIN and postcode shapes", () => {
  assert.equal(parseTin("123-456-789-012").valid, true);
  assert.equal(parseTin("12345678901").valid, false);
  assert.equal(parseBin("1234567890123").kind, "ebin");
  assert.equal(parseBin("123456789").legacy, true);
  assert.equal(parseBin("12345678901").valid, false);
  assert.equal(parsePostcode("১২০৫").digits, "1205");
  assert.equal(parsePostcode("120").valid, false);
});
