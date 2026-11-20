---
license: cc-by-2.0-fr
language:
  - bn
task_categories:
  - text-generation
annotations_creators:
  - found
language_creators:
  - found
multilinguality: monolingual
pretty_name: Tatoeba Bangla sentences (CC BY 2.0 FR)
size_categories:
  - 1K<n<10K
configs:
  - config_name: default
    data_files:
      - split: train
        path: train.jsonl
---

# Tatoeba Bangla sentences (CC BY 2.0 FR)

Every other Tatoeba Bangla sentence that passes the filter. Each row names the Tatoeba author. Sentences already kept in the CC0 file are not repeated here.

| | |
|---|---|
| Rows | 7262 |
| Licence | CC-BY-2.0-FR |
| Source | https://tatoeba.org/en/downloads |
| Retrieved | 2026-11-20 |
| Filter | Unicode NFC, 12–180 characters, at least 8 Bangla letters, no URL or email, not mostly Latin, duplicate sentences removed, graphic sexual sentences removed |
| Provenance | One `meta` object per JSONL row: source, licence, and a URL |
| Limitations | Language-learning and voice-prompt sentences are short and simple. They are not a balanced sample of Bangla writing. Example personal names in Tatoeba are textbook sentences, not a list of real people. |
| Generator | `node datasets/curate-text.mjs` after the downloads in `datasets/text/README.md` |

This folder is not part of the npm package.
