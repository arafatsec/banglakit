---
license: cc-by-2.0-fr
language:
  - bn
pretty_name: Tatoeba Bangla–English pairs
---

# Tatoeba Bangla–English pairs

One English translation per Bangla sentence. Rows whose Bangla sentence is also in the CC0 export are marked CC0-1.0. Other rows are CC BY 2.0 FR and name the Tatoeba author.

| | |
|---|---|
| Rows | 500 |
| Licence | CC-BY-2.0-FR |
| Source | https://tatoeba.org/en/downloads |
| Retrieved | 2026-11-20 |
| Filter | Unicode NFC, 12–180 characters, at least 8 Bangla letters, no URL or email, not mostly Latin, duplicate sentences removed, graphic sexual sentences removed |
| Provenance | One `meta` object per JSONL row: source, licence, and a URL |
| Limitations | Language-learning and voice-prompt sentences are short and simple. They are not a balanced sample of Bangla writing. Example personal names in Tatoeba are textbook sentences, not a list of real people. |
| Generator | `node datasets/curate-text.mjs` after the downloads in `datasets/text/README.md` |

This folder is not part of the npm package.
