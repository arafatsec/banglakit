import { test } from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

test("MCP server lists tools and answers calls over stdio", async () => {
  const client = new Client({ name: "banglakit-test", version: "0.0.0" });
  await client.connect(new StdioClientTransport({ command: process.execPath, args: ["bin/banglakit.js", "mcp"] }));
  try {
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map((t) => t.name).sort(), ["bangla_date", "bd_holidays", "bijoy_to_unicode", "check_bin", "check_nid", "check_postcode", "check_tin", "convert_digits", "count_bangla", "find_area", "find_mfs", "format_number", "format_taka", "format_time", "gregorian_date", "gregorian_from_hijri", "hijri_date", "is_holiday", "lexicon", "list_areas", "normalize_bangla", "number_to_words", "ordinal", "parse_phone", "percent", "phonetic_to_bangla", "remove_stopwords", "romanize", "sort_bangla", "split_sentences", "taka_in_words"]);
    const r = await client.callTool({ name: "taka_in_words", arguments: { amount: "125000.50" } });
    assert.equal(r.content[0].text, "এক লক্ষ পঁচিশ হাজার টাকা পঞ্চাশ পয়সা মাত্র");
    const d = await client.callTool({ name: "bangla_date", arguments: { date: "2026-02-21" } });
    assert.equal(JSON.parse(d.content[0].text).text, "৮ ফাল্গুন ১৪৩২ বঙ্গাব্দ");
    const area = await client.callTool({ name: "find_area", arguments: { query: "savar" } });
    assert.equal(JSON.parse(area.content[0].text)[0].bn, "সাভার");
    const hol = await client.callTool({ name: "is_holiday", arguments: { date: "2026-02-21" } });
    assert.equal(JSON.parse(hol.content[0].text).holidays[0].type, "general");
    const hijri = await client.callTool({ name: "hijri_date", arguments: { date: "2026-01-01" } });
    assert.equal(JSON.parse(hijri.content[0].text).text, "১২ রজব ১৪৪৭ হিজরি");
    const post = await client.callTool({ name: "check_postcode", arguments: { postcode: "120" } });
    assert.equal(JSON.parse(post.content[0].text).valid, false);
    const bad = await client.callTool({ name: "taka_in_words", arguments: { amount: "abc" } });
    assert.equal(bad.isError, true);
  } finally {
    await client.close();
  }
});
