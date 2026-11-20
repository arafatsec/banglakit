// Rebuild data/areas.json (divisions, districts, upazilas) from the Bangladesh National Portal.
// Source: https://bangladesh.gov.bd/views/upazila-list (official, Government of Bangladesh).
// Usage: node scripts/build-areas.mjs   (then review the diff and run npm test)
import { writeFile } from "node:fs/promises";

const SOURCE = "https://bangladesh.gov.bd/views/upazila-list";
const DIVISION_EN_RAW = { "ঢাকা": "Dhaka", "খুলনা": "Khulna", "চট্টগ্রাম": "Chattogram", "রাজশাহী": "Rajshahi", "সিলেট": "Sylhet", "রংপুর": "Rangpur", "ময়মনসিংহ": "Mymensingh", "বরিশাল": "Barishal" };
const DIVISION_EN = Object.fromEntries(Object.entries(DIVISION_EN_RAW).map(([k, v]) => [k.normalize("NFC"), v]));
// District English names: official spellings where the website id differs from the name.
const DISTRICT_EN = { comilla: "Cumilla", bogra: "Bogura", barisal: "Barishal", coxsbazar: "Cox's Bazar", chapainawabganj: "Chapai Nawabganj", jhalakathi: "Jhalokati", brahmanbaria: "Brahmanbaria", moulvibazar: "Moulvibazar" };

const strip = (s) => s.normalize("NFC").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const slugOf = (url) => new URL(url).hostname.replace(/\.gov\.bd$/, "").split(".")[0];
const title = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function cleanUpazila(name, districtBn) {
  return name
    .replace(/^উপজেলা\s+/, "")                 // "উপজেলা মতলব দক্ষিণ,চাঁদপুর"
    .replace(new RegExp(`\\s*,\\s*${districtBn}$`), "") // "নবাবগঞ্জ উপজেলা, ঢাকা"
    .replace(/\s*উপজেলা$/, "")
    .trim();
}

const res = await fetch(SOURCE, { headers: { "user-agent": "banglakit-data-builder (+https://github.com/arafatsec/banglakit)" } });
if (!res.ok) throw new Error(`${SOURCE} answered ${res.status}`);
const html = await res.text();

const sections = html.split(/<h4[^>]*>/).slice(1);
const divisions = [];
for (const sec of sections) {
  const head = strip(sec.slice(0, sec.indexOf("</h4>")));
  if (!head.endsWith("বিভাগ")) continue;
  const bn = head.replace(/\s*বিভাগ$/, "");
  const table = sec.slice(0, sec.indexOf("</table>"));
  const districts = [];
  for (const row of table.split(/<tr[^>]*>/).slice(1)) {
    const cells = row.split(/<td[^>]*>/).slice(1);
    if (cells.length < 2) continue;
    const links = (cell) => [...cell.matchAll(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map(([, href, text]) => ({ href, text: strip(text) }));
    const [d] = links(cells[0]);
    if (!d) continue;
    const id = slugOf(d.href);
    const districtBn = d.text.replace(/\s*(পার্বত্য\s*)?জেলা$/, "");
    districts.push({
      id,
      bn: districtBn,
      en: DISTRICT_EN[id] || title(id),
      website: d.href.replace(/\/$/, ""),
      upazilas: links(cells[1]).map((u) => ({ id: slugOf(u.href), bn: cleanUpazila(u.text, districtBn), website: u.href.replace(/\/$/, "") })),
    });
  }
  divisions.push({ id: DIVISION_EN[bn].toLowerCase(), bn, en: DIVISION_EN[bn], districts });
}

const nDistricts = divisions.reduce((s, d) => s + d.districts.length, 0);
const nUpazilas = divisions.reduce((s, d) => s + d.districts.reduce((t, x) => t + x.upazilas.length, 0), 0);
if (divisions.length !== 8 || nDistricts !== 64) throw new Error(`Expected 8 divisions and 64 districts, got ${divisions.length} and ${nDistricts}`);

const out = { source: SOURCE, publisher: "Government of the People's Republic of Bangladesh (National Portal)", retrieved: new Date().toISOString().slice(0, 10), counts: { divisions: 8, districts: nDistricts, upazilas: nUpazilas }, divisions };
await writeFile(new URL("../data/areas.json", import.meta.url), JSON.stringify(out, null, 1) + "\n");
console.log(`areas.json: 8 divisions, ${nDistricts} districts, ${nUpazilas} upazilas`);
