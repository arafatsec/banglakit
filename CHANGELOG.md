# Changelog

All notable changes to banglakit. This project follows [Semantic Versioning](https://semver.org/).

## 0.4.0 (2026-11-20)

### Added
- Bijoy / SutonnyMJ to Unicode, ported from the MIT BinduLogic mapping, with tests for the published sentences and a round trip of the one-to-one letters.
- Bangladesh Bank's list of mobile financial service providers, retrieved 20 November 2026.
- A lexicon of months, weekdays, seasons and the unit words the formatters already use.
- The mobile-prefix table as `data/operators.json`.
- Each upazila result includes its district's BBS code (`districtCode`).
- `datasets/`: CC0 JSONL and CSV evaluation sets generated from the library, a dataset card per set, and `datasets/eval.mjs`.
- `RESOURCES.md`, `CITATION.cff`, `examples/`, and a coverage step on Node 22 in CI.

## 0.3.0 (2026-11-20)

### Fixed
- Phonetic typing now follows the published Avro rules where the old mapping was wrong. `ch` is ছ and `c` is চ (`ache` → আছে, `ca^d` → চাঁদ). `S` is শ and `Sh` is ষ. `rr` before a consonant is reph (`krrm` → কর্ম). `a` after a vowel sign is য়া (`samia` → সামিয়া). A word-initial `y` is ইয় (`yahoo` → ইয়াহু). A backtick keeps the next letter from joining (`am`ra` → আমরা, `ek`i` → একই). `.`` and `:`` keep a decimal point and a clock colon. Letters that are not special in Avro accept either case (`Bangladesh` → বাংলাদেশ).
- Bangla dates before 14 April 2019 use the official month lengths of that period. 21 February 2018 is 9 Falgun, and 16 October 2018 is 1 Kartik. From 14 April 2019 the 2019 revision is unchanged: 21 February is 8 Falgun.
- Number words for 19, 29, 39, 49, 59, 69, 79 and 89 use ঊ (ঊনিশ, ঊনত্রিশ, …), the NCTB spelling.
- A number bigger than `Number.MAX_SAFE_INTEGER` is read from a digit string with `BigInt`, and a lossy JavaScript number is rejected instead of being rounded.
- Negative amounts are written (`ঋণাত্মক` / `minus`) instead of being rejected.

`chh` is still ছ, so `achhO` still gives আছো. Lowercase `oi` and `ou` still make ঐ and ঔ.

### Added
- Ordinals, percent, and taka formatted with ৳ and two decimal places.
- Clock times in Bangla (`15:45` → বিকাল ৩টা ৪৫ মিনিট).
- Tabular Hijri conversion, labelled as arithmetic and not moon sighting.
- Bangla to Latin (ISO 15919, plus an ASCII fold), Unicode cleanup, CLDR sort, akshara and word counts, sentence splitting, and the MIT stopword list.
- BBS division and district geocodes. Upazila results include the Latin name from the official website host.
- Format checks for NID (10, 13 or 17 digits), TIN (12), e-BIN (13) and postcodes (4). No lookup, and the unpublished NID checksum is not pretended.
- The seasons, weekdays and Gregorian month names are exported. `toBanglaDate` says which rule set it used.
- `data/SOURCES.md` cites every dataset and the rule sources.
- `npm run lint` (syntax, JSON, conflict markers, final newlines) runs in CI beside the tests.
- CLI commands for the new tools, `--version`, and exit status 1 when a place search finds nothing.

## 0.2.0 (2026-11-20)

### Added
- **Bangladesh places:** 8 divisions, 64 districts and upazilas in Bangla with English district names and official websites, from the National Portal. `findArea`, `listDivisions`, `listDistricts`, `listUpazilas`; MCP tools `find_area`, `list_areas`; CLI `area`, `districts`, `upazilas`.
- **Public holidays 2026** from the official gazette, including executive-order and optional holidays, each checked against the calendar. `listHolidays`, `holidaysOn`; MCP tools `bd_holidays`, `is_holiday`; CLI `holidays`.
- **Mobile numbers:** validate any format (English or Bangla digits), normalise to +880 and name the operator. `parsePhone`; MCP tool `parse_phone`; CLI `phone`.
- TypeScript type definitions.
- `data/README.md` with sources and how each dataset is verified; `scripts/build-areas.mjs` to rebuild place data from the official source.

## 0.1.0 (2026-11-20)

- First release: taka and numbers in words (lakh/crore), Bangladesh Bangla calendar (2019 revision), phonetic typing, digit conversion. MCP server, CLI and library.
