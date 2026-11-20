// banglakit: Bangla (Bengali) tools for people and AI agents.
import { createRequire } from "node:module";

export const version = createRequire(import.meta.url)("../package.json").version;

export { toBanglaDigits, toEnglishDigits, numberToWords, takaInWords, formatNumber, formatTaka, ordinal, formatPercent, percentInWords } from "./numbers.js";
export { toBanglaDate, fromBanglaDate, gregorianInBangla, MONTHS, MONTHS_EN, WEEKDAYS, WEEKDAYS_EN, SEASONS, RITU, GREGORIAN_MONTHS } from "./calendar.js";
export { toHijri, fromHijri, isHijriLeap, HIJRI_MONTHS_BN, HIJRI_MONTHS_EN, HIJRI_NOTE } from "./hijri.js";
export { formatTime } from "./time.js";
export { phoneticToBangla } from "./phonetic.js";
export { normalizeBangla, romanize, compareBangla, sortBangla, countSyllables, countWords, splitSentences, banglaStopwords, isStopword, removeStopwords } from "./text.js";
export { listDivisions, listDistricts, listUpazilas, findArea, areasSource } from "./areas.js";
export { listHolidays, holidaysOn, holidaySource, holidayYears } from "./holidays.js";
export { parsePhone } from "./phone.js";
export { parseNid, parseTin, parseBin, parsePostcode } from "./id.js";
