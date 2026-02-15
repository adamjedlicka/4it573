import * as path from "node:path";
import { defineConfig } from "@rspress/core";

export default defineConfig({
  root: path.join(__dirname, "docs"),
  title: "4IT573",
  icon: "/vse-logo-blue.png",
  logo: {
    light: "/vse-logo-blue.png",
    dark: "/vse-logo-blue.png",
  },
  themeConfig: {
    socialLinks: [
      {
        icon: "github",
        mode: "link",
        content: "https://github.com/adamjedlicka/4it573",
      },
    ],
  },
});
