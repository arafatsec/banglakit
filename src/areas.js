// Bangladesh divisions, districts and upazilas (Bangla + English), from the National Portal.
// See data/areas.json for the source URL and retrieval date; rebuild with scripts/build-areas.mjs.
// BBS geocodes are merged from data/geocodes.json. Upazila Latin names are the official
// website host names, title-cased (savar.dhaka.gov.bd -> Savar), not a separate gazetteer.
import { loadJson } from "./load.js";

let DATA;
let CODES;
function data() {
  if (!DATA) DATA = loadJson("../data/areas.json");
  return DATA;
}
function codes() {
  if (!CODES) CODES = loadJson("../data/geocodes.json");
  return CODES;
}
const norm = (s) => String(s).normalize("NFC").trim().toLowerCase();
const latinName = (id) => id.split("-").filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

/** Where the place list and the geocodes came from. */
export const areasSource = {
  get url() { return data().source; },
  get publisher() { return data().publisher; },
  get retrieved() { return data().retrieved; },
  get counts() { return data().counts; },
  get geocodes() { return { url: codes().source.districts, publisher: codes().source.publisher, retrieved: codes().source.retrieved }; },
};

/** All 8 divisions. `code` is the two-digit BBS geocode. */
export const listDivisions = () => data().divisions.map(({ id, bn, en, districts }) => ({ id, bn, en, code: codes().divisions[id], districts: districts.length }));

function division(q) {
  const k = norm(q);
  const d = data().divisions.find((x) => x.id === k || norm(x.en) === k || norm(x.bn) === k || codes().divisions[x.id] === String(q).trim());
  if (!d) throw new RangeError(`Unknown division: ${q}`);
  return d;
}
function district(q) {
  const k = norm(q);
  for (const dv of data().divisions) for (const d of dv.districts) if (d.id === k || norm(d.en) === k || norm(d.bn) === k || codes().districts[d.id] === String(q).trim()) return { ...d, division: dv };
  throw new RangeError(`Unknown district: ${q}`);
}

/** Districts, optionally only in one division (by id, English or Bangla name, or BBS code). */
export function listDistricts(divisionName) {
  const dvs = divisionName ? [division(divisionName)] : data().divisions;
  return dvs.flatMap((dv) => dv.districts.map(({ id, bn, en, website, upazilas }) => ({ id, bn, en, code: codes().districts[id], website, division: dv.en, upazilas: upazilas.length })));
}

/** Upazilas of one district. `id` is the upazila's official website name (e.g. "savar" for savar.dhaka.gov.bd). */
export function listUpazilas(districtName) {
  const d = district(districtName);
  return d.upazilas.map((u) => ({ ...u, en: latinName(u.id), district: d.en, districtCode: codes().districts[d.id], division: d.division.en }));
}

/** Search divisions, districts and upazilas by Bangla or English name (or part of it). */
export function findArea(query, { limit = 20 } = {}) {
  const k = norm(query);
  if (!k) throw new RangeError("Give a place name to search for");
  const hits = [];
  const score = (...names) => Math.min(...names.map((n) => { const v = norm(n); return v === k ? 0 : v.startsWith(k) ? 1 : v.includes(k) ? 2 : 9; }));
  for (const dv of data().divisions) {
    const s = score(dv.bn, dv.en, dv.id);
    if (s < 9) hits.push({ s, type: "division", id: dv.id, bn: dv.bn, en: dv.en, code: codes().divisions[dv.id] });
    for (const d of dv.districts) {
      const sd = score(d.bn, d.en, d.id);
      if (sd < 9) hits.push({ s: sd, type: "district", id: d.id, bn: d.bn, en: d.en, code: codes().districts[d.id], division: dv.en });
      for (const u of d.upazilas) {
        const su = score(u.bn, u.id, latinName(u.id));
        if (su < 9) hits.push({ s: su, type: "upazila", id: u.id, bn: u.bn, en: latinName(u.id), district: d.en, districtCode: codes().districts[d.id], division: dv.en, website: u.website });
      }
    }
  }
  const rank = { division: 0, district: 1, upazila: 2 };
  return hits.sort((a, b) => a.s - b.s || rank[a.type] - rank[b.type]).slice(0, limit).map(({ s, ...h }) => h);
}
