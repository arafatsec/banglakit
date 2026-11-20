---
license: cc-by-sa-4.0
language:
  - bn
task_categories:
  - text-generation
annotations_creators:
  - found
language_creators:
  - found
multilinguality: monolingual
pretty_name: Tagore, গীতাঞ্জলি (1913 edition)
size_categories:
  - n<1K
configs:
  - config_name: default
    data_files:
      - split: train
        path: train.jsonl
---

# Tagore, গীতাঞ্জলি (1913 edition)

Share-alike transcription. Songs 1–24 of the proofread 1913 Indian Press edition. The underlying book is in the public domain. Project Gutenberg's Tagore books are English translations, so they are not in this folder.

| | |
|---|---|
| Rows | 141 |
| Licence | CC-BY-SA-4.0 |
| Source | https://bn.wikisource.org/wiki/গীতাঞ্জলি_(১৯১৩) |
| Retrieved | 2026-11-20 |
| Filter | Unicode NFC, 12–180 characters, at least 8 Bangla letters, no URL or email, not mostly Latin, duplicate sentences removed, graphic sexual sentences removed |
| Provenance | One `meta` object per JSONL row: source, licence, and a URL |
| Limitations | Language-learning and voice-prompt sentences are short and simple. They are not a balanced sample of Bangla writing. Example personal names in Tatoeba are textbook sentences, not a list of real people. |
| Generator | `node datasets/curate-text.mjs` after the downloads in `datasets/text/README.md` |

This folder is not part of the npm package.
