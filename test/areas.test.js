import { test } from "node:test";
import assert from "node:assert/strict";
import { listDivisions, listDistricts, listUpazilas, findArea, areasSource } from "../src/areas.js";

test("8 divisions and 64 districts, as in the official list", () => {
  assert.equal(listDivisions().length, 8);
  assert.equal(listDistricts().length, 64);
  assert.equal(areasSource.counts.districts, 64);
  assert.ok(areasSource.counts.upazilas >= 490, "upazila count looks too small");
  const perDivision = Object.fromEntries(listDivisions().map((d) => [d.en, d.districts]));
  assert.deepEqual(perDivision, { Dhaka: 13, Khulna: 10, Chattogram: 11, Rajshahi: 8, Sylhet: 4, Rangpur: 8, Mymensingh: 4, Barishal: 6 });
});
test("data is clean: Bangla script names, NFC, unique ids, official websites", () => {
  const ids = new Set();
  for (const d of listDistricts()) {
    assert.ok(!ids.has(d.id), `duplicate district id ${d.id}`); ids.add(d.id);
    assert.match(d.bn, /^[ঀ-৿\s]+$/, d.bn);
    assert.equal(d.bn, d.bn.normalize("NFC"));
    const ups = listUpazilas(d.id);
    assert.equal(new Set(ups.map((u) => u.id)).size, ups.length, `duplicate upazila id in ${d.en}`);
    for (const u of ups) {
      assert.match(u.bn, /^[ঀ-৿\s]+$/, `${d.en}: ${u.bn}`);
      assert.doesNotMatch(u.bn, /উপজেলা|,/);
      assert.match(u.website, /^https:\/\/[a-z0-9-]+\.[a-z0-9-]+\.gov\.bd$/);
    }
  }
});
test("search and lookups", () => {
  assert.deepEqual(findArea("সাভার")[0], { type: "upazila", id: "savar", bn: "সাভার", en: "Savar", district: "Dhaka", districtCode: "3026", division: "Dhaka", website: "https://savar.dhaka.gov.bd" });
  assert.equal(listDivisions().find((d) => d.id === "dhaka").code, "30");
  assert.equal(listDistricts().find((d) => d.id === "comilla").code, "2019");
  for (const d of listDistricts()) assert.match(d.code, /^\d{4}$/, d.en);
  assert.equal(new Set(listDistricts().map((d) => d.code)).size, 64);
  for (const d of listDivisions()) assert.match(d.code, /^\d{2}$/, d.en);
  assert.equal(findArea("cumilla")[0].bn, "কুমিল্লা");
  assert.equal(findArea("ময়মনসিংহ")[0].type, "division");
  assert.equal(listDistricts("সিলেট").length, 4);
  assert.ok(listUpazilas("Gazipur").some((u) => u.bn === "কালিয়াকৈর"));
  assert.throws(() => listUpazilas("Atlantis"));
  assert.throws(() => findArea("  "));
});
