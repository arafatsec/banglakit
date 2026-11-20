# Leaderboard

Exact match after Unicode NFC, trimmed, with the spaces collapsed. The same rule as `datasets/eval.mjs`.

The library column is a check that the gold still matches banglakit. It is not a language-model score. On `translation_pair` the library returns the stored English sentence, so that 100% does not mean banglakit translates.

To score a model, point the script at an OpenAI-compatible server you run yourself. It reads `OPENAI_BASE_URL`, `OPENAI_API_KEY`, and `OPENAI_MODEL` from the environment. It does not store a key. It refuses `api.openai.com`, `api.anthropic.com`, and `generativelanguage.googleapis.com` unless `BANGKAKIT_ALLOW_PAID=1`. This repository does not run that path.

```bash
node datasets/score-model.mjs
OPENAI_BASE_URL=http://127.0.0.1:11434/v1 OPENAI_API_KEY=local OPENAI_MODEL=local MODEL_LIMIT=20 node datasets/score-model.mjs
```

`MODEL_LIMIT` defaults to 20 rows from each file when a server is set, so a first run stays small. Raise it only on a machine you pay for yourself.

## Baseline, 20 November 2026

`node datasets/score-model.mjs` with no endpoint.

| Dataset | Rows | Library check |
|---|---:|---:|
| `datasets/numbers/train.jsonl` | 114 | 100.0% |
| `datasets/taka/train.jsonl` | 8 | 100.0% |
| `datasets/ordinals/train.jsonl` | 7 | 100.0% |
| `datasets/dates/train.jsonl` | 373 | 100.0% |
| `datasets/hijri/train.jsonl` | 4 | 100.0% |
| `datasets/phonetic/train.jsonl` | 23 | 100.0% |
| `datasets/bijoy/train.jsonl` | 5 | 100.0% |
| `datasets/romanization/train.jsonl` | 16 | 100.0% |
| `datasets/normalization/train.jsonl` | 3 | 100.0% |
| `datasets/times/train.jsonl` | 6 | 100.0% |
| `datasets/places/train.jsonl` | 524 | 100.0% |
| `datasets/text/cc0/tatoeba/train.jsonl` | 6704 | 100.0% |
| `datasets/text/cc0/common-voice/train.jsonl` | 2500 | 100.0% |
| `datasets/text/cc-by/tatoeba/train.jsonl` | 7262 | 100.0% |
| `datasets/text/cc-by/tatoeba-eng/train.jsonl` | 7351 | 100.0% |
| `datasets/text/cc-by-sa/wiki/train.jsonl` | 75 | 100.0% |
| `datasets/text/cc-by-sa/tagore/train.jsonl` | 141 | 100.0% |
| `datasets/text/cc0/numbers-in-sentences/train.jsonl` | 120 | 100.0% |
| `datasets/text/cc0/normalization/train.jsonl` | 40 | 100.0% |
| `datasets/text/cc0/phonetic-words/train.jsonl` | 400 | 100.0% |
| `datasets/text/cc0/romanized-words/train.jsonl` | 400 | 100.0% |

## Model results

| Model | Endpoint | Date | Notes |
|---|---|---|---|
| | | | Paste a row here. Do not paste an API key. |
