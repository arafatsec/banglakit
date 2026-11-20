// Syntax, JSON and a few hygiene checks. No dependency.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const skip = new Set(["node_modules", ".git"]);

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (skip.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, acc);
    else acc.push(path);
  }
  return acc;
}

let failed = 0;
function bad(message) { failed++; console.error(message); }

for (const path of walk(root)) {
  const rel = relative(root, path);
  if (path.endsWith(".js")) {
    const check = spawnSync(process.execPath, ["--check", path], { encoding: "utf8" });
    if (check.status !== 0) bad(`${rel}\n${check.stderr}`);
  }
  if (path.endsWith(".json")) {
    try { JSON.parse(readFileSync(path, "utf8")); }
    catch (e) { bad(`${rel}: ${e.message}`); }
  }
  if (/\.(js|md|json|yml)$/.test(path) && !path.endsWith("package-lock.json")) {
    const text = readFileSync(path, "utf8");
    if (text.includes("<<<<<<<")) bad(`${rel}: conflict marker`);
    if (text.length && !text.endsWith("\n")) bad(`${rel}: missing final newline`);
  }
}

const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
if (!pkg.bin?.banglakit || !pkg.exports?.["."]) bad("package.json is missing bin or exports");

if (failed) {
  console.error(`lint: ${failed} problem${failed === 1 ? "" : "s"}`);
  process.exit(1);
}
console.log("lint ok");
