import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitepress";

export default defineConfig({
  title: "banglakit",
  description: "Bangla tools for people and AI agents",
  lang: "en-US",
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/install" },
      { text: "MCP", link: "/guide/mcp" },
      { text: "Playground", link: "/playground" },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Install", link: "/guide/install" },
          { text: "Library", link: "/guide/library" },
          { text: "MCP clients", link: "/guide/mcp" },
          { text: "Playground", link: "/playground" },
        ],
      },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/arafatsec/banglakit" }],
  },
  vite: {
    resolve: {
      alias: { "@bk": fileURLToPath(new URL("../../src", import.meta.url)) },
    },
    server: { fs: { allow: ["../.."] } },
  },
});
