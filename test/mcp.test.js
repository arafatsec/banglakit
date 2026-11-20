import { test } from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

test("MCP server lists tools and answers calls over stdio", async () => {
  const client = new Client({ name: "banglakit-test", version: "0.0.0" });
  await client.connect(new StdioClientTransport({ command: process.execPath, args: ["bin/banglakit.js", "mcp"] }));
  try {
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map((t) => t.name).sort(), ["bangla_date", "convert_digits", "format_number", "gregorian_date", "number_to_words", "phonetic_to_bangla", "taka_in_words"]);
    const r = await client.callTool({ name: "taka_in_words", arguments: { amount: "125000.50" } });
    assert.equal(r.content[0].text, "এক লক্ষ পঁচিশ হাজার টাকা পঞ্চাশ পয়সা মাত্র");
    const d = await client.callTool({ name: "bangla_date", arguments: { date: "2026-02-21" } });
    assert.equal(JSON.parse(d.content[0].text).text, "৮ ফাল্গুন ১৪৩২ বঙ্গাব্দ");
    const bad = await client.callTool({ name: "taka_in_words", arguments: { amount: "abc" } });
    assert.equal(bad.isError, true);
  } finally {
    await client.close();
  }
});
