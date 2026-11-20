# Original Bangla text

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
| [cc0/tatoeba](cc0/tatoeba/README.md) | 800 | CC0 1.0 | Bangla sentences Tatoeba marks as CC0, sampled evenly by id |
| [cc0/common-voice](cc0/common-voice/README.md) | 400 | CC0 1.0 | Sentences from Common Voice `sentence-collector.txt` |
| [cc0/numbers-in-sentences](cc0/numbers-in-sentences/README.md) | 120 | CC0 1.0 | Those sentences that contain digits, labelled number / date / currency |
| [cc0/normalization](cc0/normalization/README.md) | 40 | CC0 1.0 | A real sentence, with quotes, a space, or one zero-width space added |
| [cc0/phonetic-words](cc0/phonetic-words/README.md) | 15 | CC0 1.0 | Avro-style input for words that occur in the CC0 sentences |
| [cc0/romanized-words](cc0/romanized-words/README.md) | 15 | CC0 1.0 | ISO 15919 for those same words |
| [cc-by/tatoeba-eng](cc-by/tatoeba-eng/README.md) | 500 | CC BY 2.0 FR | One English sentence per Bangla sentence, with the Tatoeba author |
| [cc-by-sa/wiki](cc-by-sa/wiki/README.md) | 75 | CC BY-SA 4.0 | Sentences from বাংলাদেশ, ঢাকা, and বাংলা ভাষা |

Counts are in `manifest.json`. A manual read of sample rows is in [SPOTCHECK.md](SPOTCHECK.md).

## Skipped

| Source | Why |
|---|---|
| News sites, copyrighted books, social media | Not redistributable here. Not fetched. |
| Kazi Nazrul Islam | He died in 1976. In Bangladesh the term is life plus 60 years, so the works are not public domain. |
| Tagore on Bangla Wikisource | The works are in the public domain (he died in 1941). The pages checked were not usable text: `কাবুলিওয়ালা` returned a 121-character title stub, and `সঞ্চয়িতা/ভারততীর্থ` is a pointer at a PDF scan. No transcription was copied. |
| Common Voice `wiki.bn.txt` | A Wikipedia scrape. The sentences are CC BY-SA, not CC0, so the file was left out. |
| Bangladesh government prose | No document was found whose reuse terms clearly allow a redistributed sentence corpus. Structured holiday dates already live in `data/` and are not repeated here. |
| Graphic sexual sentences, missing-page lines | Dropped by the filter in `curate-text.mjs`. Examples are listed in the spot-check log without being quoted. |

## Filter

Unicode NFC, 12–180 characters, at least 8 Bangla letters, Latin letters at most a quarter of the Bangla letters, no URL or email, no 11-digit mobile-looking number, no brackets or straight double quotes, duplicate sentences removed. A short blocklist drops graphic sexual wording and the Wikipedia missing-page line “কোনো পাতা নেই”.
