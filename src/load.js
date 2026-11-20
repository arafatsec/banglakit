// Lazy JSON loading so importing one tool does not parse every dataset.
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const cache = new Map();

/** Load a JSON file shipped with the package. `rel` is relative to src/. */
export function loadJson(rel) {
  let value = cache.get(rel);
  if (!value) {
    value = require(rel);
    cache.set(rel, value);
  }
  return value;
}
