# Contributing to banglakit

Thank you! You don't need to be an expert programmer: fixing a wrong word, adding test words or checking a date is a real contribution. বাংলায় লিখতেও পারেন — issues and pull requests in Bangla are welcome.

## Quick start

```bash
git clone https://github.com/arafatsec/banglakit.git
cd banglakit
npm install
npm test
```

Node 18 or newer. No build step: the code in `src/` is plain JavaScript (ES modules).

## Where things are

| File | What |
|---|---|
| `src/numbers.js` | digits, number words, ordinals, taka, percent |
| `src/calendar.js` | Bangla calendar (2019 revision, and 1402–1425) |
| `src/hijri.js` | tabular Hijri calendar |
| `src/phonetic.js` | phonetic typing |
| `src/text.js` | romanization, normalization, sort, counts, stopwords |
| `src/id.js` | NID, TIN, BIN and postcode shapes |
| `src/mcp.js` | MCP server (tools for AI agents) |
| `data/SOURCES.md` | where every dataset and rule comes from |
| `datasets/` | CC0 evaluation sets. Rebuild with `node datasets/generate.mjs` |
| `bin/banglakit.js` | command line |
| `test/` | tests (`node --test`) |

## Rules for changes

1. **Correctness first.** For spellings or calendar rules, say your source (Bangla Academy, a government gazette, a newspaper style guide) in the pull request.
2. **Every fix comes with a test** that fails before your change and passes after it.
3. **No network calls and no heavy dependencies** in the core tools. Tools that need models (OCR, speech) go in separate, optional packages.
4. Keep functions small and pure (same input, same output).
5. Run `npm run lint` and `npm test` before opening a pull request. CI runs both on Node 18, 20 and 22.
6. A new dataset needs a row in `data/SOURCES.md` with the URL, the publisher and the licence. Do not invent a row to fill a gap.

## Adding a new MCP tool

1. Write a pure function in `src/` and export it from `src/index.js`.
2. Register it in `src/mcp.js` with a clear description and a Zod input schema.
3. Add it to the tool list test in `test/mcp.test.js` and to the table in `README.md`.

## Good first issues

- Transcribe the 2 July 2025 gazette that declares 5 August a holiday, and add it beside the 2025 list with the gazette number.
- Add the 2027 holiday list when the gazette is published.
- English names for upazilas that are not just the website slug, from a source you can link.
- Another ten phonetic pairs in `datasets/generate.mjs`, then run `npm run datasets`.

## Finding something to work on

Look for issues labelled **good first issue** or **help wanted**. Comment on the issue before you start, so two people don't do the same work.

By contributing you agree that your work is licensed under Apache-2.0 and that you follow the [Code of Conduct](CODE_OF_CONDUCT.md).
