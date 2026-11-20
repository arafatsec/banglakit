import { test } from "node:test";
import assert from "node:assert/strict";
import { listHolidays, holidaysOn } from "../src/holidays.js";
import { toBanglaDate } from "../src/calendar.js";
import { toBanglaDigits } from "../src/numbers.js";

test("every holiday's weekday and Bangla date match the gazette", () => {
  for (const year of [2025, 2026]) for (const h of listHolidays(year, { type: "all" })) {
    const b = toBanglaDate(h.date);
    assert.equal(b.weekday, h.weekday, `${h.date} ${h.name_en}: weekday`);
    assert.equal(`${toBanglaDigits(b.day)} ${b.monthName}`, h.bn.normalize("NFC"), `${h.date} ${h.name_en}: Bangla date`);
    assert.ok(h.name_bn && h.name_en && ["general", "executive", "optional"].includes(h.type));
  }
});
test("counts match the gazette", () => {
  assert.equal(listHolidays(2026, { type: "general" }).length, 14);
  assert.equal(listHolidays(2026, { type: "executive" }).length, 14);
  assert.equal(listHolidays(2025, { type: "general" }).length, 13);
  assert.equal(listHolidays(2025, { type: "executive" }).length, 14);
  assert.equal(holidaysOn("2025-02-21")[0].name_en, "Shaheed Day and International Mother Language Day");
  assert.equal(holidaysOn("2025-12-16")[0].name_en, "Victory Day");
  assert.equal(holidaysOn("2025-08-05")[0].name_en, "July Mass Uprising Day");
  assert.equal(holidaysOn("2025-08-05")[0].type, "general");
});
test("lookups", () => {
  assert.deepEqual(holidaysOn("2026-12-16").map((h) => h.name_en), ["Victory Day"]);
  assert.deepEqual(holidaysOn("2026-11-19"), []);
  assert.equal(listHolidays(2026, { month: 3 }).every((h) => h.date.startsWith("2026-03")), true);
  assert.throws(() => listHolidays(1999));
});
