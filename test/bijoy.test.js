import { test } from "node:test";
import assert from "node:assert/strict";
import { bijoyToUnicode, unicodeToBijoy } from "../src/bijoy.js";

test("published Bijoy sentences become Unicode", () => {
  assert.equal(bijoyToUnicode("Avgvi †mvbvi evsjv, Avwg †Zvgvq fv‡jvevwm|"), "আমার সোনার বাংলা, আমি তোমায় ভালোবাসি।");
  assert.equal(bijoyToUnicode("fvlvšÍi"), "ভাষান্তর");
  assert.equal(bijoyToUnicode("g„Zz¨"), "মৃত্যু");
  assert.equal(bijoyToUnicode("ÿwZ"), "ক্ষতি");
});

test("one-to-one letters round-trip", () => {
  for (const ch of "কখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহৎংঃঁ০১২৩৪৫৬৭৮৯") {
    assert.equal(bijoyToUnicode(unicodeToBijoy(ch)), ch, ch);
  }
  assert.equal(bijoyToUnicode("o"), "ড\u09bc");
  assert.equal(bijoyToUnicode("p"), "ঢ\u09bc");
  assert.equal(bijoyToUnicode("q"), "য\u09bc");
  assert.throws(() => unicodeToBijoy("আ"));
  assert.throws(() => unicodeToBijoy("ড়"));
});
