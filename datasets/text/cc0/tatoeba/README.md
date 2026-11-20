---
license: cc0-1.0
language:
  - bn
task_categories:
  - text-generation
annotations_creators:
  - found
language_creators:
  - found
multilinguality: monolingual
pretty_name: Tatoeba Bangla sentences (CC0)
size_categories:
  - 1K<n<10K
configs:
  - config_name: default
    data_files:
      - split: train
        path: train.jsonl
---

# Tatoeba Bangla sentences (CC0)

Every Tatoeba sentence marked CC0 1.0 that passes the filter. Example names in language-learning sentences are not a directory of real people.

| | |
|---|---|
| Rows | 6704 |
| Licence | CC0-1.0 |
| Source | https://tatoeba.org/en/downloads |
| Retrieved | 2026-11-20 |
| Filter | Unicode NFC, 12–180 characters, at least 8 Bangla letters, no URL or email, not mostly Latin, duplicate sentences removed, graphic sexual sentences removed |
| Provenance | One `meta` object per JSONL row: source, licence, and a URL |
| Limitations | Language-learning and voice-prompt sentences are short and simple. They are not a balanced sample of Bangla writing. Example personal names in Tatoeba are textbook sentences, not a list of real people. |
| Generator | `node datasets/curate-text.mjs` after the downloads in `datasets/text/README.md` |

This folder is not part of the npm package.
