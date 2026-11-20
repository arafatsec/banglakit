# banglakit

[![test](https://github.com/arafatsec/banglakit/actions/workflows/test.yml/badge.svg)](https://github.com/arafatsec/banglakit/actions/workflows/test.yml) [![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE) [![good first issues](https://img.shields.io/github/issues/arafatsec/banglakit/good%20first%20issue?label=good%20first%20issues&color=7057ff)](https://github.com/arafatsec/banglakit/labels/good%20first%20issue)

**Bangla (বাংলা) and Bangladesh tools for people and AI agents.** Taka in words, the Bangla calendar, every district and upazila, official public holidays, phone numbers and phonetic typing, ready for Claude, Codex, Cursor or any MCP agent, plus a CLI and a JavaScript library.

## বাংলায়

টাকার কথায় লেখা, বাংলা ক্যালেন্ডার, ২০২৫ ও ২০২৬ সালের সরকারি ছুটি, জেলা-উপজেলা, ফোন নম্বর, অভ্র-ধাঁচের টাইপিং এবং বিজয় থেকে ইউনিকোড। সব হিসাব এই মেশিনে হয়। সূত্র আছে [data/SOURCES.md](data/SOURCES.md)-তে। ব্যবহার:

```bash
node bin/banglakit.js taka 125000.50
node bin/banglakit.js date 2026-02-21
node bin/banglakit.js holidays 2025 2
```

## English

300 million people speak Bangla, yet AI agents still get the basics wrong: they write taka amounts in the Western million system, guess the Bangla date, and can't read Bangla typed in English letters. banglakit gives them exact, tested tools instead of guesses.

- **Exact:** rules and official data, not AI guesses. Every result is deterministic and covered by tests.
- **Sourced:** every dataset and rule names its source and licence ([data/SOURCES.md](data/SOURCES.md)). Evaluation sets live in [datasets/](datasets/README.md). Other Bangla projects are listed in [RESOURCES.md](RESOURCES.md).
- **Local:** no network, no account, no data leaves your machine.
- **Free:** Apache-2.0.

## Use it in your AI agent (MCP)

**Claude Code**

```bash
claude mcp add banglakit -- npx -y @arafatsec/banglakit mcp
```

**Claude Desktop / Cursor / any MCP client** (add to the client's MCP config):

```json
{ "mcpServers": { "banglakit": { "command": "npx", "args": ["-y", "@arafatsec/banglakit", "mcp"] } } }
```

Then just ask: *"Write ১,২৫,০০০.৫০ taka in words for this cheque"*, *"Is 26 March a holiday?"* or *"Which district is Savar in?"*

| Tool | What it does | Example |
|---|---|---|
| `taka_in_words` | Amount in words for cheques and invoices | `125000.50` → এক লক্ষ পঁচিশ হাজার টাকা পঞ্চাশ পয়সা মাত্র |
| `format_taka` | ৳ with lakh/crore grouping and paisa | `1250.5` → ৳১,২৫০.৫০ |
| `number_to_words` | Number in Bangla or English words, lakh/crore | `1234567` → বারো লক্ষ চৌত্রিশ হাজার পাঁচ শত সাতষট্টি |
| `ordinal` | প্রথম … দশম, then ২১তম | `4` → চতুর্থ |
| `format_number` | Lakh/crore digit grouping | `12345678` → ১,২৩,৪৫,৬৭৮ |
| `percent` | Percent, or শতকরা in words | `25` → ২৫% / শতকরা পঁচিশ |
| `convert_digits` | 0-9 ⇄ ০-৯ inside any text | `2026` → ২০২৬ |
| `bangla_date` | Gregorian → Bangla date, weekday, season | `2026-02-21` → ৮ ফাল্গুন ১৪৩২ বঙ্গাব্দ |
| `gregorian_date` | Bangla date → Gregorian | `1433 1 1` → 2026-04-14 |
| `hijri_date` | Gregorian → tabular Hijri (not moon sighting) | `2026-01-01` → ১২ রজব ১৪৪৭ হিজরি |
| `format_time` | A clock time said in Bangla | `15:45` → বিকাল ৩টা ৪৫ মিনিট |
| `phonetic_to_bangla` | English letters → Bangla script | `ami banglay gan gai` → আমি বাংলায় গান গাই |
| `romanize` | Bangla → ISO 15919, or ASCII | `বাংলা` → bāṁlā / bangla |
| `normalize_bangla` | NFC and stray zero-width characters | `ক` + `ে` + `া` → কো |
| `sort_bangla` | CLDR Bangla sort | অমর, আম, কলা |
| `count_bangla` | Words, sentences, orthographic akshara | আমি → 2 akshara |
| `split_sentences` | Split on । ? ! | |
| `remove_stopwords` | MIT Bangla stopword list | আমি বাংলায় → বাংলায় |
| `find_area` | Division, district or upazila, with BBS code | `savar` → সাভার, Dhaka, code 3026 for the district |
| `list_areas` | Divisions → districts → upazilas | `district: gazipur` → গাজীপুর সদর, কালিয়াকৈর... |
| `bd_holidays` | Official public holidays (general, executive, optional) | `2026, month 3` → ঈদ-উল-ফিতর, স্বাধীনতা দিবস... |
| `is_holiday` | Is this date a holiday? | `2026-12-16` → বিজয় দিবস |
| `parse_phone` | Mobile number, E.164, original operator | `০১৭১২৩৪৫৬৭৮` → +8801712345678, Grameenphone |
| `check_nid` | NID shape: 10, 13 or 17 digits | format only, no lookup |
| `check_tin` | TIN shape: 12 digits | format only |
| `check_bin` | e-BIN shape: 13 digits | old 9- and 11-digit numbers are rejected |
| `check_postcode` | 4-digit shape | does not know if the code is assigned |
| `bijoy_to_unicode` | Bijoy / SutonnyMJ to Unicode | `Avgvi †mvbvi evsjv` → আমার সোনার বাংলা |
| `find_mfs` | Bangladesh Bank MFS providers | bKash, Nagad, Rocket, … |
| `lexicon` | Months, weekdays, seasons, units | বৈশাখ, শুক্রবার, টাকা |

## Command line

```bash
npx @arafatsec/banglakit taka 125000.50          # এক লক্ষ পঁচিশ হাজার টাকা পঞ্চাশ পয়সা মাত্র
npx @arafatsec/banglakit taka 125000 --en        # one lakh twenty-five thousand taka only
npx @arafatsec/banglakit money 1250.50           # ৳১,২৫০.৫০
npx @arafatsec/banglakit ordinal 4               # চতুর্থ
npx @arafatsec/banglakit date                    # today, e.g. শুক্রবার, ৫ অগ্রহায়ণ ১৪৩৩ বঙ্গাব্দ, হেমন্তকাল
npx @arafatsec/banglakit gdate 1433 1 1          # 2026-04-14
npx @arafatsec/banglakit hijri 2026-01-01        # ১২ রজব ১৪৪৭ হিজরি
npx @arafatsec/banglakit time 15:45              # বিকাল ৩টা ৪৫ মিনিট
npx @arafatsec/banglakit type amar sOnar bangla  # আমার সোনার বাংলা
npx @arafatsec/banglakit roman বাংলা             # bāṁlā
npx @arafatsec/banglakit format 12345678         # ১,২৩,৪৫,৬৭৮
npx @arafatsec/banglakit area savar              # upazila সাভার (Savar) · Dhaka · Dhaka
npx @arafatsec/banglakit holidays 2026 12        # 2026-12-16 বুধবার বিজয় দিবস (Victory Day) ...
npx @arafatsec/banglakit phone 01712345678       # +8801712345678 · Grameenphone
npx @arafatsec/banglakit nid 1234567890          # smart, or an error if the shape is wrong
```

A bad value, an unknown command, or a place search with no match exits with status 1. `--help` and `--version` exit 0.

## Library

```bash
npm install @arafatsec/banglakit
```

```js
import { takaInWords, toBanglaDate, phoneticToBangla, findArea, holidaysOn, parsePhone, romanize, parseNid } from "@arafatsec/banglakit";

takaInWords("1,250.50");             // "এক হাজার দুই শত পঞ্চাশ টাকা পঞ্চাশ পয়সা মাত্র"
toBanglaDate("2026-12-16").text;     // "১ পৌষ ১৪৩৩ বঙ্গাব্দ"
findArea("savar")[0].district;       // "Dhaka"
holidaysOn("2026-03-26")[0].name_bn; // "স্বাধীনতা ও জাতীয় দিবস"
parsePhone("01912345678").operator;  // "Banglalink"
phoneticToBangla("kemon achhO");     // "কেমন আছো"
romanize("বাংলা");                    // "bāṁlā"
parseNid("1234567890").kind;         // "smart"  (shape only, not a lookup)
```

## How the rules work

**Bangla calendar.** From 14 April 2019 the official Bangladesh calendar is: the year starts on 14 April; Boishakh to Ashwin have 31 days; Kartik, Ogrohayon, Poush, Magh and Choitro have 30; Falgun has 29, or 30 in a Gregorian leap year. So 21 February is ৮ ফাল্গুন, 26 March ১২ চৈত্র and 16 December ১ পৌষ. From 14 April 1995 until that revision, Boishakh to Bhadro had 31 days and Falgun carried the leap day, which is why 21 February 2018 was ৯ ফাল্গুন. The result's `rules` field says which one was used. (The West Bengal calendar differs and is on the roadmap.)

**Hijri.** `toHijri` is the tabular (arithmetic) Islamic calendar used by most software. Bangladesh announces Islamic holidays by moon sighting, so those dates can differ by a day or two. Use `bd_holidays` for the official days.

**Phonetic typing** follows the published Avro Phonetic rules, written from the rules rather than copied from Avro. There is no dictionary, so two consonants join (`rokto` is রক্ত, `amra` is আম্রা). Type a backtick between letters to keep them apart (`am` + backtick + `ra` is আমরা).

| Type | Get | Type | Get | Type | Get |
|---|---|---|---|---|---|
| `a` / `i` / `I` or `ee` | া / ি / ী | `u` or `oo` / `U` | ু / ূ | `e` / `O` | ে / ো |
| `oi` or `OI` / `ou` or `OU` | ৈ / ৌ | `rri` | ৃ | `o` | inherent অ |
| `T` `Th` `D` `Dh` | ট ঠ ড ঢ | `t` `th` `d` `dh` | ত থ দ ধ | `N` / `n` | ণ / ন |
| `sh` or `S` / `Sh` / `s` | শ / ষ / স | `R` / `Rh` | ড় / ঢ় | `ng` / `Ng` / `NG` | ং / ঙ / ঞ |
| `c` / `ch` | চ / ছ | `kkh` or `kSh` | ক্ষ | `y` after a consonant | ্য (য-ফলা) |
| `w` after a consonant | ্ব (ব-ফলা) | `t` then two backticks | ৎ | `^` / `:` | ঁ / ঃ |
| `rr` before a consonant | র্ (reph) | `.` / `.` then a backtick | । / . | `0-9` | ০-৯ |

`samia` → সামিয়া, `yahoo` → ইয়াহু, `krrm` → কর্ম, `ca^d` → চাঁদ. `{english}` is kept as typed. Letters that are not special accept either case.

**Numbers.** Words use lakh and crore. The “one less” tens use the NCTB ঊ spelling: ঊনিশ, ঊনত্রিশ, ঊনচল্লিশ, and the same pattern through ঊননব্বই. Ordinals are প্রথম … দশম, then ২১তম.

**Identity numbers** are format checks only. A 10-digit NID is not verified against the Election Commission, and the unpublished checksum is not invented.

## Evaluation sets

[datasets/README.md](datasets/README.md) is the sheet of CC0 JSONL and CSV generated from this library, with a dataset card in each folder. `node datasets/eval.mjs` scores predictions. These files are not inside the npm package. Other Bangla corpora are linked, not copied, in [RESOURCES.md](RESOURCES.md).

## What is not in here

Left out on purpose, because a wrong table would be worse than a gap:

- Union names, and a BBS code on each upazila. Each upazila does carry its district's BBS code. The public upazila-code lists are older than the National Portal set.
- A full post-office directory. The 4-digit shape is checked.
- Honorifics. No official list was copied.
- 5 August 2025. A later gazette declared it a holiday; that PDF was not transcribed, so it is not in the 2025 list.
- An Avro dictionary. Two consonants join unless you type a backtick.
- The West Bengal calendar, and Bangla reforms from before 1995.
- The smart-NID checksum.
- Unicode back to Bijoy for a whole sentence. The one-to-one letters do round-trip.

## Roadmap (help wanted)

- Postcodes for every post office, from a Bangladesh Post file
- The 2 July 2025 amendment (5 August) and the 2027 holiday list, from the gazette PDFs
- Unicode to Bijoy for full sentences
- West Bengal (Indian) Bangla calendar
- Conjunct whitelist for phonetic typing
- Python package

See [CONTRIBUTING.md](CONTRIBUTING.md). Good first issues are labelled **good first issue**.

The docs site is built with `npm run docs:build` (VitePress). CI builds it and does not deploy it.

## License

Apache-2.0. Made in Dhaka by [Elaichix](https://elaichix.com/) and contributors.
