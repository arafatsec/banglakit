# Changelog

All notable changes to banglakit. This project follows [Semantic Versioning](https://semver.org/).

## 0.2.0 (2026-11-20)

### Added
- **Bangladesh places:** 8 divisions, 64 districts and upazilas in Bangla with English district names and official websites, from the National Portal. `findArea`, `listDivisions`, `listDistricts`, `listUpazilas`; MCP tools `find_area`, `list_areas`; CLI `area`, `districts`, `upazilas`.
- **Public holidays 2026** from the official gazette, including executive-order and optional holidays, each checked against the calendar. `listHolidays`, `holidaysOn`; MCP tools `bd_holidays`, `is_holiday`; CLI `holidays`.
- **Mobile numbers:** validate any format (English or Bangla digits), normalise to +880 and name the operator. `parsePhone`; MCP tool `parse_phone`; CLI `phone`.
- TypeScript type definitions.
- `data/README.md` with sources and how each dataset is verified; `scripts/build-areas.mjs` to rebuild place data from the official source.

## 0.1.0 (2026-11-20)

- First release: taka and numbers in words (lakh/crore), Bangladesh Bangla calendar (2019 revision), phonetic typing, digit conversion. MCP server, CLI and library.
