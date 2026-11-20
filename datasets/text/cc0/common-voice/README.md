---
license: cc0-1.0
language:
  - bn
pretty_name: Common Voice Bangla sentences (CC0)
---

# Common Voice Bangla sentences (CC0)

The first 8,000 lines of server/data/bn/sentence-collector.txt that pass the filter, capped at 400. The Wikipedia scrape wiki.bn.txt was not used, because that text starts as CC BY-SA.

| | |
|---|---|
| Rows | 400 |
| Licence | CC0-1.0 |
| Source | https://github.com/common-voice/common-voice/blob/main/README.md |
| Retrieved | 2026-11-20 |
| Filter | Unicode NFC, 12–180 characters, at least 8 Bangla letters, no URL or email, not mostly Latin, duplicate sentences removed, graphic sexual sentences removed |
| Provenance | One `meta` object per JSONL row: source, licence, and a URL |
| Limitations | Language-learning and voice-prompt sentences are short and simple. They are not a balanced sample of Bangla writing. Example personal names in Tatoeba are textbook sentences, not a list of real people. |
| Generator | `node datasets/curate-text.mjs` after the downloads in `datasets/text/README.md` |

This folder is not part of the npm package.
