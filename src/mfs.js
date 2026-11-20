// Mobile financial services named by Bangladesh Bank. No account data.
import { loadJson } from "./load.js";

function data() {
  return loadJson("../data/mfs.json");
}

export const mfsSource = {
  get url() { return data().source; },
  get publisher() { return data().publisher; },
  get retrieved() { return data().retrieved; },
  get note() { return data().note; },
};

/** Every provider on the Bangladesh Bank list. */
export function listMfs() {
  return data().providers.map((row) => ({ ...row }));
}

/** Find a provider by service name or part of the business-entity name. */
export function findMfs(query) {
  const k = String(query).normalize("NFC").trim().toLowerCase();
  if (!k) throw new RangeError("Give an MFS name to search for");
  return listMfs().filter((row) => [row.service, row.service_bn, row.entity].filter(Boolean).some((v) => v.toLowerCase().includes(k)));
}
