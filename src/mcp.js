// MCP server: gives any MCP-capable agent (Claude, Codex, Cursor, OpenClaw...) the banglakit tools over stdio.
import { createRequire } from "node:module";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as bk from "./index.js";

const { version } = createRequire(import.meta.url)("../package.json");

const text = (value) => ({ content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }] });
const safe = (fn) => async (args) => {
  try { return text(fn(args)); } catch (e) { return { isError: true, content: [{ type: "text", text: e.message }] }; }
};
const lang = z.enum(["bn", "en"]).default("bn").describe("bn = Bangla words, en = English words with lakh/crore");

export function createServer() {
  const server = new McpServer({ name: "banglakit", version });
  const textIn = z.string().max(100_000);
  server.registerTool("taka_in_words", {
    title: "Taka amount in words",
    description: "Write a taka amount in words for cheques, invoices and receipts, using lakh and crore. Example: 125000.50 -> এক লক্ষ পঁচিশ হাজার টাকা পঞ্চাশ পয়সা মাত্র.",
    inputSchema: { amount: z.string().describe("Amount, e.g. 125000.50 or ১,২৫,০০০"), lang },
  }, safe(({ amount, lang }) => bk.takaInWords(amount, lang)));
  server.registerTool("number_to_words", {
    title: "Number in words",
    description: "Write a whole number in Bangla (or English) words using the South Asian system: hundred, thousand, lakh, crore.",
    inputSchema: { number: z.string().describe("Whole number, ASCII or Bangla digits"), lang },
  }, safe(({ number, lang }) => bk.numberToWords(number, lang)));
  server.registerTool("format_number", {
    title: "Format number (lakh/crore grouping)",
    description: "Group digits the South Asian way (1,23,45,678), in Bangla or English digits.",
    inputSchema: { number: z.string(), bangla_digits: z.boolean().default(true) },
  }, safe(({ number, bangla_digits }) => bk.formatNumber(number, { bangla: bangla_digits })));
  server.registerTool("convert_digits", {
    title: "Convert digits",
    description: "Convert digits inside any text between English (0-9) and Bangla (০-৯).",
    inputSchema: { text: z.string(), to: z.enum(["bn", "en"]) },
  }, safe(({ text: t, to }) => (to === "bn" ? bk.toBanglaDigits(t) : bk.toEnglishDigits(t))));
  server.registerTool("bangla_date", {
    title: "Gregorian to Bangla date",
    description: "Convert a Gregorian date to the Bangladesh Bangla calendar, with weekday and season. From 14 April 2019 the 2019 revision is used (21 February is 8 Falgun). From 14 April 1995 until then, the previous official month lengths are used (21 February 2018 is 9 Falgun). Defaults to today.",
    inputSchema: { date: z.string().optional().describe("YYYY-MM-DD; omit for today") },
  }, safe(({ date }) => ({ ...bk.toBanglaDate(date || new Date()), gregorian_in_bangla: bk.gregorianInBangla(date || new Date()) })));
  server.registerTool("gregorian_date", {
    title: "Bangla to Gregorian date",
    description: "Convert a Bangla calendar date (year, month 1-12 where 1 = Boishakh, day) to a Gregorian YYYY-MM-DD date.",
    inputSchema: { year: z.number().int(), month: z.number().int().min(1).max(12), day: z.number().int().min(1).max(31) },
  }, safe(({ year, month, day }) => bk.fromBanglaDate(year, month, day)));
  server.registerTool("phonetic_to_bangla", {
    title: "Phonetic typing to Bangla",
    description: "Turn Bangla typed in English letters into Bangla script (phonetic style similar to Avro). Example: 'ami banglay gan gai' -> 'আমি বাংলায় গান গাই'. Put English words inside {braces} to keep them.",
    inputSchema: { text: textIn.describe("Bangla typed in English letters. Put English to keep inside {braces}. ` is a backtick: am`ra keeps ম and র apart, ca^d is চাঁদ, ch is ছ and c is চ.") },
  }, safe(({ text: t }) => bk.phoneticToBangla(t)));
  server.registerTool("find_area", {
    title: "Find a place in Bangladesh",
    description: "Search Bangladesh divisions, districts and upazilas by Bangla or English name (or part of it). Returns the official Bangla name, English name, parent district/division and official website. Source: Bangladesh National Portal.",
    inputSchema: { query: z.string().describe("e.g. সাভার, Cumilla, mymensingh"), limit: z.number().int().min(1).max(50).default(10) },
  }, safe(({ query, limit }) => bk.findArea(query, { limit })));
  server.registerTool("list_areas", {
    title: "List divisions, districts or upazilas",
    description: "No arguments: the 8 divisions. division: its districts. district: its upazilas (with official website names).",
    inputSchema: { division: z.string().optional(), district: z.string().optional() },
  }, safe(({ division, district }) => (district ? bk.listUpazilas(district) : division ? bk.listDistricts(division) : bk.listDivisions())));
  server.registerTool("bd_holidays", {
    title: "Bangladesh public holidays",
    description: "Official Bangladesh public holidays from the government gazette. type: public (offices closed: general + executive order), general, executive, optional (religious optional holidays) or all. Moon-dependent dates are marked moon: true.",
    inputSchema: { year: z.number().int().default(2026), month: z.number().int().min(1).max(12).optional(), type: z.enum(["public", "general", "executive", "optional", "all"]).default("public") },
  }, safe(({ year, month, type }) => ({ holidays: bk.listHolidays(year, { type, month }), source: bk.holidaySource(year) })));
  server.registerTool("is_holiday", {
    title: "Is this date a holiday in Bangladesh?",
    description: "Check a date (YYYY-MM-DD) against the official holiday list. Returns the holidays on that date, or an empty list. Fridays and Saturdays are the weekly days off and are not listed.",
    inputSchema: { date: z.string() },
  }, safe(({ date }) => ({ date, holidays: bk.holidaysOn(date) })));
  server.registerTool("ordinal", {
    title: "Ordinal number",
    description: "Ordinal in Bangla or English. 1 to 10 use the classical Bangla forms (প্রথম … দশম). Larger numbers use the modern তম form, such as ২১তম.",
    inputSchema: { number: z.string(), lang },
  }, safe(({ number, lang }) => bk.ordinal(number, lang)));
  server.registerTool("format_taka", {
    title: "Format an amount in taka",
    description: "Format a taka amount with the ৳ sign, lakh/crore grouping and two decimal places. 1250.5 -> ৳১,২৫০.৫০.",
    inputSchema: { amount: z.string(), bangla_digits: z.boolean().default(true), symbol: z.boolean().default(true) },
  }, safe(({ amount, bangla_digits, symbol }) => bk.formatTaka(amount, { bangla: bangla_digits, symbol })));
  server.registerTool("percent", {
    title: "Format a percent",
    description: "Format a percent, or write a whole percent in words. 25 -> ২৫% or শতকরা পঁচিশ. The number is the percent itself, not a fraction of 1.",
    inputSchema: { number: z.string(), words: z.boolean().default(false), lang },
  }, safe(({ number, words, lang }) => (words ? bk.percentInWords(number, lang) : bk.formatPercent(number, { bangla: lang !== "en" }))));
  server.registerTool("format_time", {
    title: "Time in Bangla",
    description: "Write a 24-hour clock time the way it is said in Bangladesh. 15:45 -> বিকাল ৩টা ৪৫ মিনিট. Period names are everyday usage, not a legal definition.",
    inputSchema: { time: z.string().describe("HH:MM, 00:00 to 23:59, ASCII or Bangla digits") },
  }, safe(({ time }) => bk.formatTime(time)));
  server.registerTool("hijri_date", {
    title: "Gregorian to tabular Hijri",
    description: "Convert a Gregorian date to the tabular (arithmetic) Islamic calendar. This is not Bangladesh moon sighting and can differ by a day or two from an announced Islamic holiday. Use bd_holidays for official dates.",
    inputSchema: { date: z.string().optional().describe("YYYY-MM-DD; omit for today") },
  }, safe(({ date }) => bk.toHijri(date || new Date())));
  server.registerTool("gregorian_from_hijri", {
    title: "Tabular Hijri to Gregorian",
    description: "Convert a tabular Hijri date to YYYY-MM-DD. Month 1 is Muharram. Not moon sighting.",
    inputSchema: { year: z.number().int().min(1), month: z.number().int().min(1).max(12), day: z.number().int().min(1).max(30) },
  }, safe(({ year, month, day }) => bk.fromHijri(year, month, day)));
  server.registerTool("romanize", {
    title: "Bangla to Latin",
    description: "Romanize Bangla in orthographic ISO 15919. The inherent অ is written a, including at the end of a word; spoken schwa deletion is not guessed. style ascii folds the diacritics (বাংলা -> bangla) and is not reversible.",
    inputSchema: { text: textIn, style: z.enum(["iso", "ascii"]).default("iso") },
  }, safe(({ text: t, style }) => bk.romanize(t, { style })));
  server.registerTool("normalize_bangla", {
    title: "Normalize Bangla text",
    description: "Unicode NFC for Bangla, including ো/ৌ/ড়/ঢ়/য়, and drop zero-width characters that are not part of a hasanta. A ZWJ or ZWNJ right after ্ is kept.",
    inputSchema: { text: textIn },
  }, safe(({ text: t }) => bk.normalizeBangla(t)));
  server.registerTool("sort_bangla", {
    title: "Sort Bangla text",
    description: "Sort strings with the Unicode CLDR Bangla collation (Intl.Collator bn).",
    inputSchema: { items: z.array(z.string().max(10_000)).min(1).max(1000) },
  }, safe(({ items }) => bk.sortBangla(items)));
  server.registerTool("count_bangla", {
    title: "Count Bangla words and akshara",
    description: "Count whitespace-separated words, how many of them contain Bangla, sentences split on । ? !, and orthographic akshara. An akshara is an independent vowel or a consonant that is not under a hasanta. This is not a count of spoken syllables.",
    inputSchema: { text: textIn },
  }, safe(({ text: t }) => ({ ...bk.countWords(t), sentences: bk.splitSentences(t).length, akshara: bk.countSyllables(t) })));
  server.registerTool("split_sentences", {
    title: "Split Bangla sentences",
    description: "Split text on the danda ।, question mark, exclamation mark and line breaks. The mark stays on its sentence.",
    inputSchema: { text: textIn },
  }, safe(({ text: t }) => bk.splitSentences(t)));
  server.registerTool("remove_stopwords", {
    title: "Remove Bangla stopwords",
    description: "Drop words from the stopwords-iso Bengali list (MIT). The list is a broad frequent-word list, not only function words, and a few corrupt entries have been removed. See data/SOURCES.md.",
    inputSchema: { text: textIn },
  }, safe(({ text: t }) => bk.removeStopwords(t)));
  server.registerTool("check_nid", {
    title: "Check an NID shape",
    description: "Check the shape of a Bangladesh national ID: 10 digits (smart card, not starting with 0), 13 digits, or 17 digits. Format only. The smart-card checksum algorithm is not published and is not checked. This does not look the number up.",
    inputSchema: { nid: z.string().max(40) },
  }, safe(({ nid }) => bk.parseNid(nid)));
  server.registerTool("check_tin", {
    title: "Check a TIN shape",
    description: "Check a Bangladesh e-TIN: 12 digits (National Board of Revenue). Format only, no lookup and no checksum.",
    inputSchema: { tin: z.string().max(40) },
  }, safe(({ tin }) => bk.parseTin(tin)));
  server.registerTool("check_bin", {
    title: "Check a BIN shape",
    description: "Check a Bangladesh e-BIN: 13 digits (National Board of Revenue). Old 9-digit and 11-digit BINs are reported as legacy and not valid. Format only, no lookup.",
    inputSchema: { bin: z.string().max(40) },
  }, safe(({ bin }) => bk.parseBin(bin)));
  server.registerTool("check_postcode", {
    title: "Check a postcode shape",
    description: "Check that a Bangladesh postcode is 4 digits. This does not know whether the code is assigned to a post office.",
    inputSchema: { postcode: z.string().max(20) },
  }, safe(({ postcode }) => bk.parsePostcode(postcode)));
  server.registerTool("parse_phone", {
    title: "Check a Bangladesh mobile number",
    description: "Validate and normalise a Bangladesh mobile number (any format, English or Bangla digits) and name the operator the prefix was issued to: Grameenphone (013/017), Banglalink (014/019), Robi (018), Airtel (016, now Robi) or Teletalk (015). Since October 2018 the SIM may have been ported.",
    inputSchema: { number: z.string() },
  }, safe(({ number }) => bk.parsePhone(number)));
  return server;
}

export async function startStdio() {
  await createServer().connect(new StdioServerTransport());
}
