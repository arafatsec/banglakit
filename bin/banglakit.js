#!/usr/bin/env node
import * as bk from "../src/index.js";

const [cmd, ...rest] = process.argv.slice(2);
const arg = rest.filter((a) => !a.startsWith("--")).join(" ");
const en = rest.includes("--en");
const HELP = `banglakit: Bangla tools for people and AI agents

  banglakit mcp                      start the MCP server (stdio) for AI agents
  banglakit taka 125000.50 [--en]    amount in words: এক লক্ষ পঁচিশ হাজার টাকা পঞ্চাশ পয়সা মাত্র
  banglakit words 1234567 [--en]     number in words (lakh/crore)
  banglakit format 12345678          ১,২৩,৪৫,৬৭৮
  banglakit date [2026-11-20]        Bangla calendar date (default today)
  banglakit gdate 1433 1 1           Bangla date -> Gregorian (year month day)
  banglakit type ami banglay gan gai phonetic typing -> আমি বাংলায় গান গাই
  banglakit digits 2026 | --en ২০২৬  convert digits
  banglakit area savar               find a division, district or upazila
  banglakit districts [dhaka]        list districts (of a division)
  banglakit upazilas gazipur         list upazilas of a district
  banglakit holidays [2026] [month]  public holidays (official gazette)
  banglakit phone 01712345678        check a mobile number and operator`;

try {
  switch (cmd) {
    case "mcp": { const { startStdio } = await import("../src/mcp.js"); await startStdio(); break; }
    case "taka": console.log(bk.takaInWords(arg, en ? "en" : "bn")); break;
    case "words": console.log(bk.numberToWords(arg, en ? "en" : "bn")); break;
    case "format": console.log(bk.formatNumber(arg, { bangla: !en })); break;
    case "date": { const d = bk.toBanglaDate(arg || new Date()); console.log(d.long); break; }
    case "gdate": { const [y, m, d] = arg.split(/\s+/).map((v) => Number(bk.toEnglishDigits(v))); console.log(bk.fromBanglaDate(y, m, d)); break; }
    case "type": console.log(bk.phoneticToBangla(arg)); break;
    case "digits": console.log(en ? bk.toEnglishDigits(arg) : bk.toBanglaDigits(arg)); break;
    case "area": for (const a of bk.findArea(arg)) console.log(`${a.type.padEnd(9)} ${a.bn}${a.en ? ` (${a.en})` : ""}${a.district ? ` · ${a.district}` : ""}${a.division && a.type !== "division" ? ` · ${a.division}` : ""}`); break;
    case "districts": for (const d of bk.listDistricts(arg || undefined)) console.log(`${d.bn} (${d.en}) · ${d.division} · ${d.upazilas} upazilas`); break;
    case "upazilas": for (const u of bk.listUpazilas(arg)) console.log(`${u.bn} · ${u.website}`); break;
    case "holidays": { const [y, m] = arg.split(/\s+/).filter(Boolean).map(Number); for (const h of bk.listHolidays(y || new Date().getFullYear(), { month: m })) console.log(`${h.date} ${h.weekday} ${h.name_bn} (${h.name_en})${h.moon ? " *moon" : ""}`); break; }
    case "phone": { const p = bk.parsePhone(arg); console.log(p.valid ? `${p.e164} · ${p.operator}` : p.reason); if (!p.valid) process.exitCode = 1; break; }
    default: console.log(HELP); process.exitCode = cmd && cmd !== "help" && cmd !== "--help" ? 1 : 0;
  }
} catch (e) {
  console.error(`error: ${e.message}`);
  process.exitCode = 1;
}
