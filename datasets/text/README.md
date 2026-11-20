---
license: other
language:
  - bn
  - en
task_categories:
  - text-generation
  - translation
  - text2text-generation
  - token-classification
pretty_name: banglakit original Bangla text
configs:
  - config_name: tatoeba-cc0
    data_files:
      - split: train
        path: cc0/tatoeba/train.jsonl
  - config_name: common-voice
    data_files:
      - split: train
        path: cc0/common-voice/train.jsonl
  - config_name: tatoeba-cc-by
    data_files:
      - split: train
        path: cc-by/tatoeba/train.jsonl
  - config_name: tatoeba-eng
    data_files:
      - split: train
        path: cc-by/tatoeba-eng/train.jsonl
  - config_name: wiki
    data_files:
      - split: train
        path: cc-by-sa/wiki/train.jsonl
  - config_name: tagore
    data_files:
      - split: train
        path: cc-by-sa/tagore/train.jsonl
  - config_name: numbers
    data_files:
      - split: train
        path: cc0/numbers-in-sentences/train.jsonl
  - config_name: normalization
    data_files:
      - split: train
        path: cc0/normalization/train.jsonl
  - config_name: phonetic
    data_files:
      - split: train
        path: cc0/phonetic-words/train.jsonl
  - config_name: romanized
    data_files:
      - split: train
        path: cc0/romanized-words/train.jsonl
---

# Original Bangla text

The top-level licence is `other` because this folder mixes CC0, CC BY 2.0 FR, and CC BY-SA 4.0. Each config's own card names the one licence that applies. Do not upload this folder as a single CC0 dataset. Nothing in this repository is uploaded to Hugging Face.

Real sentences, kept apart from the library-generated sheet in the parent folder. Each licence has its own directory. The CC BY-SA rows are share-alike: do not copy them into a CC0 or CC BY-only set.

Retrieved 20 November 2026. Rebuild with `node datasets/curate-text.mjs` after the downloads below. The dumps are not committed.

## Downloads

```bash
mkdir -p /tmp/bn-src
curl -L --fail -o /tmp/bn-src/ben_sentences_CC0.tsv.bz2 https://downloads.tatoeba.org/exports/per_language/ben/ben_sentences_CC0.tsv.bz2
curl -L --fail -o /tmp/bn-src/ben_sentences_detailed.tsv.bz2 https://downloads.tatoeba.org/exports/per_language/ben/ben_sentences_detailed.tsv.bz2
curl -L --fail -o /tmp/bn-src/ben-eng_links.tsv.bz2 https://downloads.tatoeba.org/exports/per_language/ben/ben-eng_links.tsv.bz2
bunzip2 -f /tmp/bn-src/*.bz2
curl -L --fail -o /tmp/eng_sentences.tsv.bz2 https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences.tsv.bz2
bunzip2 -f /tmp/eng_sentences.tsv.bz2
curl -L --fail -o /tmp/cv-bn-sentences.txt https://raw.githubusercontent.com/common-voice/common-voice/main/server/data/bn/sentence-collector.txt
node datasets/curate-text.mjs
```

Tatoeba weekly exports move. The files used for the committed sample were the per-language exports linked from [tatoeba.org/en/downloads](https://tatoeba.org/en/downloads) on 20 November 2026. Paths can be overridden with `TATOEBA_DIR`, `TATOEBA_ENG`, and `CV_SENTENCES`.

Wikipedia sentences are fetched from the public API (`explaintext` extracts plus the revision id). Nothing else is downloaded at runtime.

## What is committed

| Folder | Rows | Licence | What it is |
|---|---|---|---|
| [cc0/tatoeba](cc0/tatoeba/README.md) | 6704 | CC0 1.0 | Every filtered Tatoeba CC0 sentence |
| [cc0/common-voice](cc0/common-voice/README.md) | 2500 | CC0 1.0 | First 2,500 filtered lines of `sentence-collector.txt` |
| [cc0/numbers-in-sentences](cc0/numbers-in-sentences/README.md) | 120 | CC0 1.0 | Digit spans labelled number / date / currency |
| [cc0/normalization](cc0/normalization/README.md) | 40 | CC0 1.0 | A real sentence, with quotes, a space, or one zero-width space added |
| [cc0/phonetic-words](cc0/phonetic-words/README.md) | 400 | CC0 1.0 | Round-tripping spellings of frequent CC0 words |
| [cc0/romanized-words](cc0/romanized-words/README.md) | 400 | CC0 1.0 | ISO 15919 for those same words |
| [cc-by/tatoeba](cc-by/tatoeba/README.md) | 7262 | CC BY 2.0 FR | The rest of Tatoeba Bangla, with the author on each row |
| [cc-by/tatoeba-eng](cc-by/tatoeba-eng/README.md) | 7351 | CC BY 2.0 FR or CC0 | One English sentence per linked Bangla sentence |
| [cc-by-sa/wiki](cc-by-sa/wiki/README.md) | 75 | CC BY-SA 4.0 | Sentences from বাংলাদেশ, ঢাকা, and বাংলা ভাষা |
| [cc-by-sa/tagore](cc-by-sa/tagore/README.md) | 141 | CC BY-SA 4.0 | Songs 1–24 of the 1913 গীতাঞ্জলি, proofread on Wikisource |

Counts are in `manifest.json`. A manual read of sample rows is in [SPOTCHECK.md](SPOTCHECK.md).

## Skipped

| Source | Why |
|---|---|
| News sites, copyrighted books, social media | Not redistributable here. Not fetched. |
| Kazi Nazrul Islam | He died in 1976. In Bangladesh the term is life plus 60 years, so the works are not public domain. |
| Project Gutenberg Tagore | ebooks 7164, 6520, 33525, and 34757 are English translations. There is no Bengali-script Gutenberg text to copy. |
| Rest of গীতাঞ্জলি, and other Wikisource stubs | Songs 1–24 are included. `কাবুলিওয়ালা` is still a title stub and `সঞ্চয়িতা/ভারততীর্থ` is still a PDF index. Set `TAGORE_SONGS` above 24 to pull more proofread songs from the same book. |
| Common Voice past line ~3,300 | The committed sample stops at 2,500 filtered sentences. The sha256 of the whole 432,697-line file is in `CHECKSUMS.json`. `CV_KEEP` raises the cap. |
| Common Voice `wiki.bn.txt` | A Wikipedia scrape. The sentences are CC BY-SA, not CC0, so the file was left out. |
| Bangladesh government prose | No document was found whose reuse terms clearly allow a redistributed sentence corpus. Structured holiday dates already live in `data/` and are not repeated here. |
| Graphic sexual sentences, missing-page lines | Dropped by the filter in `curate-text.mjs`. Examples are listed in the spot-check log without being quoted. |

## Filter

Unicode NFC, 12–180 characters, at least 8 Bangla letters, Latin letters at most a quarter of the Bangla letters, no URL or email, no 11-digit mobile-looking number, no brackets or straight double quotes, duplicate sentences removed. A short blocklist drops graphic sexual wording and the Wikipedia missing-page line “কোনো পাতা নেই”.
