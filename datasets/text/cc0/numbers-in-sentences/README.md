---
license: cc0-1.0
language:
  - bn
pretty_name: Numbers, dates and currency inside real CC0 sentences
---

# Numbers, dates and currency inside real CC0 sentences

Digit spans from CC0 sentences. Each span has raw digits, ASCII digits, and a kind (number, date, or currency) from a short window around the digits, using the library month list. The gold JSON is what extractNumbers returns. A spot-check log is in datasets/text/SPOTCHECK.md.

| | |
|---|---|
| Rows | 120 |
| Licence | CC0-1.0 |
| Source | Derived from the CC0 sentence files |
| Retrieved | 2026-11-20 |
| Filter | Unicode NFC, 12–180 characters, at least 8 Bangla letters, no URL or email, not mostly Latin, duplicate sentences removed, graphic sexual sentences removed |
| Provenance | One `meta` object per JSONL row: source, licence, and a URL |
| Limitations | Language-learning and voice-prompt sentences are short and simple. They are not a balanced sample of Bangla writing. Example personal names in Tatoeba are textbook sentences, not a list of real people. |
| Generator | `node datasets/curate-text.mjs` after the downloads in `datasets/text/README.md` |

This folder is not part of the npm package.
