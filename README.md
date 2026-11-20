# banglakit

[![test](https://github.com/arafatsec/banglakit/actions/workflows/test.yml/badge.svg)](https://github.com/arafatsec/banglakit/actions/workflows/test.yml) [![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE) [![good first issues](https://img.shields.io/github/issues/arafatsec/banglakit/good%20first%20issue?label=good%20first%20issues&color=7057ff)](https://github.com/arafatsec/banglakit/labels/good%20first%20issue)

**Bangla (বাংলা) tools for people and AI agents.** Taka in words, the Bangladesh Bangla calendar, phonetic typing and digits, ready for Claude, Codex, Cursor or any MCP agent, plus a CLI and a JavaScript library.

300 million people speak Bangla, yet AI agents still get the basics wrong: they write taka amounts in the Western million system, guess the Bangla date, and can't read Bangla typed in English letters. banglakit gives them exact, tested tools instead of guesses.

- **Exact:** rules, not AI. Every result is deterministic and covered by tests.
- **Local:** no network, no account, no data leaves your machine.
- **Free:** Apache-2.0.

> Not on npm yet: the commands below install straight from GitHub. An npm release (`npx banglakit`) is coming.

## Use it in your AI agent (MCP)

**Claude Code**

```bash
claude mcp add banglakit -- npx -y github:arafatsec/banglakit mcp
```

**Claude Desktop / Cursor / any MCP client** (add to the client's MCP config):

```json
{ "mcpServers": { "banglakit": { "command": "npx", "args": ["-y", "github:arafatsec/banglakit", "mcp"] } } }
```

Then just ask: *"Write ১,২৫,০০০.৫০ taka in words for this cheque"* or *"What is today's Bangla date?"*

| Tool | What it does | Example |
|---|---|---|
| `taka_in_words` | Amount in words for cheques and invoices | `125000.50` → এক লক্ষ পঁচিশ হাজার টাকা পঞ্চাশ পয়সা মাত্র |
| `number_to_words` | Number in Bangla or English words, lakh/crore | `1234567` → বারো লক্ষ চৌত্রিশ হাজার পাঁচ শত সাতষট্টি |
| `format_number` | Lakh/crore digit grouping | `12345678` → ১,২৩,৪৫,৬৭৮ |
| `convert_digits` | 0-9 ⇄ ০-৯ inside any text | `2026` → ২০২৬ |
| `bangla_date` | Gregorian → Bangla date, weekday, season | `2026-02-21` → ৮ ফাল্গুন ১৪৩২ বঙ্গাব্দ |
| `gregorian_date` | Bangla date → Gregorian | `1433 1 1` → 2026-04-14 |
| `phonetic_to_bangla` | English letters → Bangla script | `ami banglay gan gai` → আমি বাংলায় গান গাই |

## Command line

```bash
npx github:arafatsec/banglakit taka 125000.50          # এক লক্ষ পঁচিশ হাজার টাকা পঞ্চাশ পয়সা মাত্র
npx github:arafatsec/banglakit taka 125000 --en        # one lakh twenty-five thousand taka only
npx github:arafatsec/banglakit date                    # today, e.g. শুক্রবার, ৫ অগ্রহায়ণ ১৪৩৩ বঙ্গাব্দ, হেমন্তকাল
npx github:arafatsec/banglakit gdate 1433 1 1          # 2026-04-14
npx github:arafatsec/banglakit type amar sOnar bangla  # আমার সোনার বাংলা
npx github:arafatsec/banglakit format 12345678         # ১,২৩,৪৫,৬৭৮
```

## Library

```bash
npm install github:arafatsec/banglakit
```

```js
import { takaInWords, toBanglaDate, phoneticToBangla } from "banglakit";

takaInWords("1,250.50");           // "এক হাজার দুই শত পঞ্চাশ টাকা পঞ্চাশ পয়সা মাত্র"
toBanglaDate("2026-12-16").text;   // "১ পৌষ ১৪৩৩ বঙ্গাব্দ"
phoneticToBangla("kemon achhO");   // "কেমন আছো"
```

## How the rules work

**Bangla calendar.** The official Bangladesh calendar since the 2019 revision: the year starts on 14 April; Boishakh to Ashwin have 31 days; Kartik, Ogrohayon, Poush, Magh and Choitro have 30; Falgun has 29, or 30 in a Gregorian leap year. So 21 February is always ৮ ফাল্গুন, 26 March ১২ চৈত্র and 16 December ১ পৌষ. (The West Bengal calendar differs and is on the roadmap.)

**Phonetic typing** (similar to the well-known Avro style, written from scratch):

| Type | Get | Type | Get | Type | Get |
|---|---|---|---|---|---|
| `a` / `i` / `I` | া / ি / ী | `u` / `U` | ু / ূ | `e` / `O` | ে / ো |
| `oi` / `ou` | ৈ / ৌ | `rri` | ৃ | `o` | inherent অ |
| `T` `Th` `D` `Dh` | ট ঠ ড ঢ | `t` `th` `d` `dh` | ত থ দ ধ | `N` / `n` | ণ / ন |
| `sh` / `S` or `Sh` / `s` | শ / ষ / স | `R` / `Rh` | ড় / ঢ় | `ng` / `Ng` | ং / ঙ |
| `ch` / `chh` | চ / ছ | `kkh` or `kSh` | ক্ষ | `y` after a consonant | ্য (য-ফলা) |
| `w` after a consonant | ্ব (ব-ফলা) | `` t`` `` | ৎ | `^` / `:` | ঁ / ঃ |
| `.` | । | `{english}` | kept as typed | `0-9` | ০-৯ |

Two consonants in a row join into a conjunct (`rokto` → রক্ত). Type `o` between them to keep them apart (`kolokata` → কলকাতা).

## Roadmap (help wanted)

- Bijoy (ANSI) ⇄ Unicode converter for old government and office documents
- Bangla OCR and speech-to-text tools (wrapping open models)
- West Bengal (Indian) Bangla calendar
- Conjunct whitelist for smarter phonetic typing; more words in tests
- Bangla number words for ordinals (প্রথম, দ্বিতীয়...) and dates written in words
- Python package

See [CONTRIBUTING.md](CONTRIBUTING.md). Good first issues are labelled **good first issue**.

## License

Apache-2.0. Made in Dhaka by [Elaichix](https://elaichix.com/) and contributors.
