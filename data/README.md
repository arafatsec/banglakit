# Data sources

Every dataset in banglakit comes from an official Government of Bangladesh source, records where and when it was collected, and is checked by the test suite.

| File | What | Source | How it is kept correct |
|---|---|---|---|
| `areas.json` | 8 divisions, 64 districts, upazilas with Bangla names, English district names and official website names | [Bangladesh National Portal, upazila list](https://bangladesh.gov.bd/views/upazila-list) | Rebuilt by `scripts/build-areas.mjs` (fails unless it finds exactly 8 divisions and 64 districts). Tests check script, Unicode NFC, unique ids and website format. |
| `holidays-2026.json` | All 2026 holidays: general, executive order and optional (Muslim, Hindu, Christian, Buddhist, hill peoples) | [Bangladesh Gazette, 12 Nov 2025](https://www.dpp.gov.bd/upload_file/gazettes/59216_19984.pdf), Ministry of Public Administration | Transcribed with the gazette's own weekday and Bangla date. Tests check all three against banglakit's calendar, so a typing mistake fails CI. |

Notes:

- **Upazilas** are as listed on the National Portal on the retrieval date, which includes some recently created upazilas. Upazila `id` is the official website name (e.g. `savar` for `savar.dhaka.gov.bd`); English upazila names are not yet included (help wanted).
- **Holidays** marked `moon: true` depend on moon sighting; the government confirms the final date. Fridays and Saturdays (weekly days off) are not listed.
- **Phone operators** follow the BTRC mobile number plan (013/017 Grameenphone, 014/019 Banglalink, 018 Robi, 016 Airtel, 015 Teletalk). Numbers can be ported between operators, so the operator is the original one for the prefix.

Found a mistake? Open an issue with the official source. Government data is published for public use; please keep the source links when you reuse it.
