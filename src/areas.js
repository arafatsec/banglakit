// Bangladesh divisions, districts and upazilas (Bangla + English), from the National Portal.
// See data/areas.json for the source URL and retrieval date; rebuild with scripts/build-areas.mjs.
import { createRequire } from "node:module";

const DATA = createRequire(import.meta.url)("../data/areas.json");
const norm = (s) => String(s).normalize("NFC").trim().toLowerCase();

/** Where the data came from. */
export const areasSource = { url: DATA.source, publisher: DATA.publisher, retrieved: DATA.retrieved, counts: DATA.counts };

/** All 8 divisions. */
export const listDivisions = () => DATA.divisions.map(({ id, bn, en, districts }) => ({ id, bn, en, districts: districts.length }));

function division(q) {
  const k = norm(q);
  const d = DATA.divisions.find((x) => x.id === k || norm(x.en) === k || norm(x.bn) === k);
  if (!d) throw new RangeError(`Unknown division: ${q}`);
  return d;
}
function district(q) {
  const k = norm(q);
  for (const dv of DATA.divisions) for (const d of dv.districts) if (d.id === k || norm(d.en) === k || norm(d.bn) === k) return { ...d, division: dv };
  throw new RangeError(`Unknown district: ${q}`);
}

/** Districts, optionally only in one division (by id, English or Bangla name). */
export function listDistricts(divisionName) {
  const dvs = divisionName ? [division(divisionName)] : DATA.divisions;
  return dvs.flatMap((dv) => dv.districts.map(({ id, bn, en, website, upazilas }) => ({ id, bn, en, website, division: dv.en, upazilas: upazilas.length })));
}

/** Upazilas of one district. `id` is the upazila's official website name (e.g. "savar" for savar.dhaka.gov.bd). */
export function listUpazilas(districtName) {
  const d = district(districtName);
  return d.upazilas.map((u) => ({ ...u, district: d.en, division: d.division.en }));
}

/** Search divisions, districts and upazilas by Bangla or English name (or part of it). */
export function findArea(query, { limit = 20 } = {}) {
  const k = norm(query);
  if (!k) throw new RangeError("Give a place name to search for");
  const hits = [];
  const score = (...names) => Math.min(...names.map((n) => { const v = norm(n); return v === k ? 0 : v.startsWith(k) ? 1 : v.includes(k) ? 2 : 9; }));
  for (const dv of DATA.divisions) {
    const s = score(dv.bn, dv.en);
    if (s < 9) hits.push({ s, type: "division", id: dv.id, bn: dv.bn, en: dv.en });
    for (const d of dv.districts) {
      const sd = score(d.bn, d.en, d.id);
      if (sd < 9) hits.push({ s: sd, type: "district", id: d.id, bn: d.bn, en: d.en, division: dv.en });
      for (const u of d.upazilas) {
        const su = score(u.bn, u.id);
        if (su < 9) hits.push({ s: su, type: "upazila", id: u.id, bn: u.bn, district: d.en, division: dv.en, website: u.website });
      }
    }
  }
  const rank = { division: 0, district: 1, upazila: 2 };
  return hits.sort((a, b) => a.s - b.s || rank[a.type] - rank[b.type]).slice(0, limit).map(({ s, ...h }) => h);
}
