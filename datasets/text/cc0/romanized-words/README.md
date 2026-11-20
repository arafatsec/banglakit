---
license: cc0-1.0
language:
  - bn
task_categories:
  - text2text-generation
annotations_creators:
  - found
language_creators:
  - found
multilinguality: monolingual
pretty_name: ISO 15919 for attested words
size_categories:
  - n<1K
configs:
  - config_name: default
    data_files:
      - split: train
        path: train.jsonl
---

# ISO 15919 for attested words

The same 400 words, in orthographic ISO 15919, including a final inherent vowel when the library writes one.

| | |
|---|---|
| Rows | 400 |
| Licence | CC0-1.0 |
| Source | Words taken from the CC0 sentences |
| Retrieved | 2026-11-20 |
| Filter | Unicode NFC, 12–180 characters, at least 8 Bangla letters, no URL or email, not mostly Latin, duplicate sentences removed, graphic sexual sentences removed |
| Provenance | One `meta` object per JSONL row: source, licence, and a URL |
| Limitations | Language-learning and voice-prompt sentences are short and simple. They are not a balanced sample of Bangla writing. Example personal names in Tatoeba are textbook sentences, not a list of real people. |
| Generator | `node datasets/curate-text.mjs` after the downloads in `datasets/text/README.md` |

This folder is not part of the npm package.
