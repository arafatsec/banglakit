---
license: cc0-1.0
language:
  - bn
pretty_name: Phonetic input for attested words
---

# Phonetic input for attested words

The Bangla word occurs in the CC0 sentences. The Latin input is kept only when phoneticToBangla returns that word. It is not a recording of a particular person typing.

| | |
|---|---|
| Rows | 15 |
| Licence | CC0-1.0 |
| Source | Words taken from the CC0 sentences |
| Retrieved | 2026-11-20 |
| Filter | Unicode NFC, 12–180 characters, at least 8 Bangla letters, no URL or email, not mostly Latin, duplicate sentences removed, graphic sexual sentences removed |
| Provenance | One `meta` object per JSONL row: source, licence, and a URL |
| Limitations | Language-learning and voice-prompt sentences are short and simple. They are not a balanced sample of Bangla writing. Example personal names in Tatoeba are textbook sentences, not a list of real people. |
| Generator | `node datasets/curate-text.mjs` after the downloads in `datasets/text/README.md` |

This folder is not part of the npm package.
