#!/usr/bin/env node
import * as bk from "../src/index.js";

const [cmd, ...rest] = process.argv.slice(2);
const args = rest.filter((a) => !a.startsWith("--"));
const arg = args.join(" ");
const en = rest.includes("--en");
const HELP = `banglakit ${bk.version}: Bangla tools for people and AI agents

  banglakit mcp                         start the MCP server (stdio)
  banglakit taka 125000.50 [--en]       amount in words
  banglakit words 1234567 [--en]        number in words (lakh/crore)
  banglakit ordinal 21 [--en]           প্রথম, ২১তম, 21st
  banglakit format 12345678 [--en]      ১,২৩,৪৫,৬৭৮
  banglakit money 1250.50 [--en]        ৳১,২৫০.৫০
  banglakit percent 25 [--en] [--words] ২৫% or শতকরা পঁচিশ
  banglakit digits 2026 [--en]          ০-৯ or back to 0-9
  banglakit date [2026-11-20]           Bangla calendar date
  banglakit gdate 1433 1 1              Bangla date -> Gregorian
  banglakit hijri [2026-01-01]          tabular Hijri date (not moon sighting)
  banglakit time 15:45                  বিকাল ৩টা ৪৫ মিনিট
  banglakit type ami banglay gan gai    phonetic typing
  banglakit roman বাংলা [--en]          ISO 15919, or ASCII with --en
  banglakit norm <text>                 Unicode NFC and zero-width cleanup
  banglakit count <text>                words, Bangla words, sentences, akshara
  banglakit sentences <text>            split on । ? !
  banglakit sort WORD ...               Bangla dictionary order
  banglakit stopwords <text>            drop stopwords
  banglakit area savar                  find a division, district or upazila
  banglakit districts [dhaka]           list districts
  banglakit upazilas gazipur            list upazilas of a district
  banglakit holidays [2026] [month]     public holidays
  banglakit phone 01712345678           mobile number and original operator
  banglakit nid|tin|bin|postcode VALUE  format check only, no lookup

Exit status is 0 on success and 1 on bad input, an unknown command, or no match.`;

function fail(message) {
  console.error(`error: ${message}`);
  process.exitCode = 1;
}

try {
  switch (cmd) {
    case "mcp": { const { startStdio } = await import("../src/mcp.js"); await startStdio(); break; }
    case "version":
    case "--version":
    case "-v": console.log(bk.version); break;
    case "taka": console.log(bk.takaInWords(arg, en ? "en" : "bn")); break;
    case "words": console.log(bk.numberToWords(arg, en ? "en" : "bn")); break;
    case "ordinal": console.log(bk.ordinal(arg, en ? "en" : "bn")); break;
    case "format": console.log(bk.formatNumber(arg, { bangla: !en })); break;
    case "money": console.log(bk.formatTaka(arg, { bangla: !en })); break;
    case "percent": console.log(rest.includes("--words") ? bk.percentInWords(arg, en ? "en" : "bn") : bk.formatPercent(arg, { bangla: !en })); break;
    case "date": { const d = bk.toBanglaDate(arg || new Date()); console.log(d.long); break; }
    case "gdate": { const [y, m, d] = arg.split(/\s+/).map((v) => Number(bk.toEnglishDigits(v))); console.log(bk.fromBanglaDate(y, m, d)); break; }
    case "hijri": console.log(bk.toHijri(arg || new Date()).text); break;
    case "time": console.log(bk.formatTime(args[0] || "").text); break;
    case "type": console.log(bk.phoneticToBangla(arg)); break;
    case "roman": console.log(bk.romanize(arg, { style: en ? "ascii" : "iso" })); break;
    case "norm": console.log(bk.normalizeBangla(arg)); break;
    case "count": { const w = bk.countWords(arg); console.log(`${w.tokens} words, ${w.bangla} Bangla words, ${bk.splitSentences(arg).length} sentences, ${bk.countSyllables(arg)} akshara`); break; }
    case "sentences": for (const s of bk.splitSentences(arg)) console.log(s); break;
    case "sort": for (const s of bk.sortBangla(args)) console.log(s); break;
    case "stopwords": console.log(bk.removeStopwords(arg)); break;
    case "digits": console.log(en ? bk.toEnglishDigits(arg) : bk.toBanglaDigits(arg)); break;
    case "area": {
      const hits = bk.findArea(arg);
      if (!hits.length) { fail(`no place matching ${JSON.stringify(arg)}`); break; }
      for (const a of hits) console.log(`${a.type.padEnd(9)} ${a.bn}${a.en ? ` (${a.en})` : ""}${a.code ? ` [${a.code}]` : ""}${a.district ? ` · ${a.district}` : ""}${a.division && a.type !== "division" ? ` · ${a.division}` : ""}`);
      break;
    }
    case "districts": for (const d of bk.listDistricts(arg || undefined)) console.log(`${d.code} ${d.bn} (${d.en}) · ${d.division} · ${d.upazilas} upazilas`); break;
    case "upazilas": for (const u of bk.listUpazilas(arg)) console.log(`${u.bn} (${u.en}) · ${u.website}`); break;
    case "holidays": { const [y, m] = arg.split(/\s+/).filter(Boolean).map(Number); for (const h of bk.listHolidays(y || new Date().getFullYear(), { month: m })) console.log(`${h.date} ${h.weekday} ${h.name_bn} (${h.name_en})${h.moon ? " *moon" : ""}`); break; }
    case "phone": { const p = bk.parsePhone(arg); console.log(p.valid ? `${p.e164} · ${p.operator}` : p.reason); if (!p.valid) process.exitCode = 1; break; }
    case "nid":
    case "tin":
    case "bin":
    case "postcode": {
      const fn = { nid: bk.parseNid, tin: bk.parseTin, bin: bk.parseBin, postcode: bk.parsePostcode }[cmd];
      const r = fn(arg);
      console.log(r.valid ? `${r.kind} ${r.digits}` : r.reason);
      if (!r.valid) process.exitCode = 1;
      break;
    }
    default: console.log(HELP); process.exitCode = cmd && cmd !== "help" && cmd !== "--help" && cmd !== "-h" ? 1 : 0;
  }
} catch (e) {
  console.error(`error: ${e.message}`);
  process.exitCode = 1;
}
