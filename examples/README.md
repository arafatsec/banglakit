# Examples

Small programs that call the library. They are not part of the npm package.

```bash
node examples/library.mjs
node bin/banglakit.js taka 125000.50
node bin/banglakit.js bijoy "Avgvi †mvbvi evsjv"
node datasets/eval.mjs datasets/numbers/train.jsonl
```

Claude Desktop or Cursor MCP config:

```json
{ "mcpServers": { "banglakit": { "command": "node", "args": ["bin/banglakit.js", "mcp"] } } }
```

Use `npx -y @arafatsec/banglakit mcp` once the package is installed from a registry. This repository does not publish it.
