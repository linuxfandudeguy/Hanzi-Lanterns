import fs from "node:fs";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import robotsTxt from "astro-robots-txt";
import webmanifest from "astro-webmanifest";
import { defineConfig, envField } from "astro/config";
import { siteConfig } from "./src/site.config";

// Remark plugins
import remarkDirective from "remark-directive";
import { remarkAdmonitions } from "./src/plugins/remark-admonitions";
import { remarkReadingTime } from "./src/plugins/remark-reading-time";

// Rehype plugins
import rehypeExternalLinks from "rehype-external-links";
import rehypeUnwrapImages from "rehype-unwrap-images";
import rehypePrettyCode from "rehype-pretty-code";
import { transformerMetaHighlight, transformerNotationDiff } from "@shikijs/transformers";

// https://astro.build/config
export default defineConfig({
  image: {
    domains: ["https://www.chineasy.com/"],
  },
  integrations: [
    icon(),
    tailwind({
      applyBaseStyles: false,
      nesting: true,
    }),
    sitemap(),
    mdx(),
    robotsTxt(),
    webmanifest({
      name: siteConfig.title,
      short_name: "Hanzi Lanterns",
      description: siteConfig.description,
      lang: siteConfig.lang,
      icon: "public/seal.jpg",
      icons: [
        {
          src: "icons/apple-touch-icon.png",
          sizes: "180x180",
          type: "image/png",
        },
        {
          src: "icons/icon-192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "icons/icon-512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
      start_url: "/",
      background_color: "#1d1f21",
      theme_color: "#2bbc8a",
      display: "standalone",
      config: {
        insertFaviconLinks: false,
        insertThemeColorMeta: false,
        insertManifestLink: false,
      },
    }),
  ],
  markdown: {
    syntaxHighlight: false,
    remarkPlugins: [remarkReadingTime, remarkDirective, remarkAdmonitions],
    remarkRehype: {
      footnoteLabelProperties: {
        className: [""],
      },
      footnoteBackContent: "⤴",
    },
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          rel: ["nofollow", "noreferrer"],
          target: "_blank",
        },
      ],
      [
        rehypePrettyCode,
        {
          theme: {
            light: "rose-pine-dawn",
            dark: "rose-pine",
          },
          transformers: [transformerNotationDiff(), transformerMetaHighlight()],
        },
      ],
      rehypeUnwrapImages,
    ],
  },
  prefetch: true,
  site: "https://hanzilanterns.netlify.app/",
  vite: {
    build: {
      sourcemap: true,
    },
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
    plugins: [rawFonts([".ttf", ".woff"])],
  },
  env: {
    schema: {
      WEBMENTION_API_KEY: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      WEBMENTION_URL: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
      WEBMENTION_PINGBACK: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
    },
  },
  server: {
    host: true,
  },
});

// --- Vite Plugin ---
function rawFonts(ext) {
  return {
    name: "vite-plugin-raw-fonts",
    transform(_, id) {
      if (ext.some((e) => id.endsWith(e))) {
        const buffer = fs.readFileSync(id);
        return {
          code: `export default ${JSON.stringify(buffer)}`,
          map: null,
        };
      }
    },
  };
}
