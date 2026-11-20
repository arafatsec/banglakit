// MCP server: gives any MCP-capable agent (Claude, Codex, Cursor, OpenClaw...) the banglakit tools over stdio.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as bk from "./index.js";

const text = (value) => ({ content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }] });
const safe = (fn) => async (args) => {
  try { return text(fn(args)); } catch (e) { return { isError: true, content: [{ type: "text", text: e.message }] }; }
};
const lang = z.enum(["bn", "en"]).default("bn").describe("bn = Bangla words, en = English words with lakh/crore");

export function createServer() {
  const server = new McpServer({ name: "banglakit", version: "0.2.0" });
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
    description: "Convert a Gregorian date to the official Bangladesh Bangla calendar (Bongabdo, 2019 revision), with weekday and season. Defaults to today.",
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
    inputSchema: { text: z.string() },
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
  server.registerTool("parse_phone", {
    title: "Check a Bangladesh mobile number",
    description: "Validate and normalise a Bangladesh mobile number (any format, English or Bangla digits) and name the operator: Grameenphone, Banglalink, Robi, Airtel, Teletalk.",
    inputSchema: { number: z.string() },
  }, safe(({ number }) => bk.parsePhone(number)));
  return server;
}

export async function startStdio() {
  await createServer().connect(new StdioServerTransport());
}
