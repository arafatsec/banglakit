# MCP setup

The server speaks stdio. It does not open a port. Text arguments are capped at 20,000 characters. Numbers, dates and phone numbers are capped at 200 characters.

## Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS, or `%APPDATA%\Claude\claude_desktop_config.json` on Windows:

```json
{
  "mcpServers": {
    "banglakit": {
      "command": "npx",
      "args": ["-y", "@arafatsec/banglakit", "mcp"]
    }
  }
}
```

From a clone, point `command` at `node` and `args` at `["/absolute/path/bin/banglakit.js", "mcp"]`.

## Cursor

Settings → MCP → Add a new global MCP server, or `.cursor/mcp.json` in the project:

```json
{
  "mcpServers": {
    "banglakit": {
      "command": "npx",
      "args": ["-y", "@arafatsec/banglakit", "mcp"]
    }
  }
}
```

## VS Code

With the MCP extension, or GitHub Copilot's MCP config, `.vscode/mcp.json`:

```json
{
  "servers": {
    "banglakit": {
      "command": "npx",
      "args": ["-y", "@arafatsec/banglakit", "mcp"]
    }
  }
}
```

## Windsurf

`~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "banglakit": {
      "command": "npx",
      "args": ["-y", "@arafatsec/banglakit", "mcp"]
    }
  }
}
```

## Claude Code

```bash
claude mcp add banglakit -- npx -y @arafatsec/banglakit mcp
```
