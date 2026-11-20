# Spot-check, 20 November 2026

Read by hand after `node datasets/curate-text.mjs`. The rows below are in the committed files. Dropped ids are not in the files; the text of the graphic ones is not repeated here.

## Kept

| Id | What was checked |
|---|---|
| `tatoeba-cc0-10998962` | “আর কতদিন এভাবে চলবে!” is a complete Bangla sentence. |
| `tatoeba-cc0-10999115` | “আজ তাহমিদের বিয়ে।” is a textbook sentence. The name is part of the CC0 sentence, not a person added by this repo. |
| `tatoeba-cc0-11519198` | “ধর্ম পালন করার জন্য মিশরে মন্দির নির্মাণের প্রথা প্রচলিত ছিল।” reads as ordinary prose. |
| `tatoeba-cc0-12417606` | A news-style sentence about a military visit. It names a public role, which is how it appears in Tatoeba. No phone number or private record was added. |
| `cv-58` | “আমি এই দেশের নির্জন নিস্তব্ধ জঙ্গলের মধ্যেই এ জীবন শেষ করব।” ends with a danda and is Bangla throughout. |
| `cv-355` | “তুমি কী করতে চাও?” is a short spoken prompt. |
| `cv-842` | “অ-সিঙ্গাপুরীয় ব্যবসা প্রতিষ্ঠান…” is awkward translated prose. It is real collector text, and it is not representative of edited Bangla. That bias is on the dataset card. |
| `wiki-9264947-1` | “বাংলাদেশের সাংবিধানিক নাম গণপ্রজাতন্ত্রী বাংলাদেশ।” Revision 9264947 of বাংলাদেশ. |
| `wiki-9267246-1` | “ঢাকা বাংলাদেশের রাজধানী ও মহানগর বা বৃহত্তম শহর।” Revision 9267246. |
| `wiki-9264838-1` | “বাংলা ভাষা একটি ধ্রুপদি ইন্দো-আর্য ভাষা…” Revision 9264838. No empty “()” left in these opening lines. |
| `tatoeba-455108-1482` | “আমি জাপানি ভাষায় কথা বলি না।” / “I don't speak Japanese.” Author `rezwan`, licence CC BY 2.0 FR, both sentence URLs stored. |
| `num-1` | “২০১৮ সালের ২৪ জানুয়ারি…” both digit spans labelled `date`. |
| `num-30` | “৫০ হাজার টাকা” is `currency`. “৫ ভরি” is `number`, not currency. |
| `num-91` | “৫ টাকা” is `currency`. “২০টি” is `number`. |
| `num-92` | “৫০ থেকে ৫৫ টাকা” — both spans `currency`. |
| `num-109` | “১৫১টি প্রকল্পে কত টাকা…” stays `number`. The word টাকা is the question, and it sits outside the 18-character window, so it is not labelled currency. A closer টাকা could still mislabel a count. |
| `norm-1` | Input is the real sentence wrapped in “ ”. Output is the sentence with the quotes removed. |
| `norm-2` | Input is “আজ তাহমিদের বিয়ে।” with U+200B after আ-কার. Output is the sentence without it. |
| `word-1` | `ami` → আমি, and আমি occurs in the CC0 sentences. |
| `word-15` | `bo\`i` → বই. Plain `boi` is বৈ in this engine, so that spelling was not kept. |
| `rom-word-15` | বই → `bai` (ISO 15919, with no inherent vowel after ই). |

`shiksha` was not kept: `phoneticToBangla("shiksha")` is শিক্শা, not শিক্ষা. `sokal` and `shikkha` do round-trip, but সকাল and শিক্ষা were not in the filtered CC0 sample, so they were not added.

## Dropped

| Id or page | Why |
|---|---|
| Tatoeba CC0 11001141, 11001210, 11001218 | Graphic sexual sentences. Matched the blocklist. Not quoted. |
| Common Voice line 877 | Same blocklist. Not quoted. |
| Tatoeba CC0 11000490 | “তসবিহ শিরোনামে বর্তমানে কোনো পাতা নেই।” A missing-page line, not a sentence to train on. |
| bn.wikisource.org/wiki/কাবুলিওয়ালা | API extract was the title stub only (121 characters). No story sentences. |
| সঞ্চয়িতা/ভারততীর্থ | Wikisource wikitext is a PDF page index, not the poem. |

The parallel file’s first 500 linked pairs are all CC BY 2.0 FR. None of those Bangla ids were in the CC0 export, so none were relabelled CC0. Author names are the Tatoeba usernames from `ben_sentences_detailed.tsv`.
