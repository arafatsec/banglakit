// Names the calendar and the money/time formatters already use, in one place.
import { MONTHS, MONTHS_EN, WEEKDAYS, WEEKDAYS_EN, RITU, GREGORIAN_MONTHS } from "./calendar.js";
import { HIJRI_MONTHS_BN, HIJRI_MONTHS_EN } from "./hijri.js";
import { loadJson } from "./load.js";

/** Months, weekdays, seasons and the unit words used by the formatters. */
export function lexicon() {
  return {
    months: MONTHS.map((bn, i) => ({ bn, en: MONTHS_EN[i] })),
    weekdays: WEEKDAYS.map((bn, i) => ({ bn, en: WEEKDAYS_EN[i] })),
    seasons: RITU.map((r) => ({ bn: r.bn, en: r.en, months: r.months })),
    gregorianMonths: GREGORIAN_MONTHS.map((bn, i) => ({ bn, en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][i] })),
    hijriMonths: HIJRI_MONTHS_BN.map((bn, i) => ({ bn, en: HIJRI_MONTHS_EN[i] })),
    units: loadJson("../data/units.json").units.map((u) => ({ ...u })),
  };
}
