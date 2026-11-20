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
pretty_name: Common Voice Bangla sentences (CC0)
size_categories:
  - 1K<n<10K
configs:
  - config_name: default
    data_files:
      - split: train
        path: train.jsonl
---

# Common Voice Bangla sentences (CC0)

The first 2500 sentences in server/data/bn/sentence-collector.txt that pass the filter. The full file is larger; its sha256 is in CHECKSUMS.json. Raise CV_KEEP to take more. wiki.bn.txt was not used, because that text is Wikipedia and CC BY-SA.

| | |
|---|---|
| Rows | 2500 |
| Licence | CC0-1.0 |
| Source | https://github.com/common-voice/common-voice/blob/main/README.md |
| Retrieved | 2026-11-20 |
| Filter | Unicode NFC, 12–180 characters, at least 8 Bangla letters, no URL or email, not mostly Latin, duplicate sentences removed, graphic sexual sentences removed |
| Provenance | One `meta` object per JSONL row: source, licence, and a URL |
| Limitations | Language-learning and voice-prompt sentences are short and simple. They are not a balanced sample of Bangla writing. Example personal names in Tatoeba are textbook sentences, not a list of real people. |
| Generator | `node datasets/curate-text.mjs` after the downloads in `datasets/text/README.md` |

This folder is not part of the npm package.
