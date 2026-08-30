// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.pablogarciaruiz.com',
  // Every canonical URL, sitemap entry and internal link uses a trailing
  // slash; making it the enforced form means the non-slash variant 308s to
  // the canonical one instead of both resolving (duplicate-URL signal).
  trailingSlash: 'always',
  integrations: [sitemap(), mdx()],
  adapter: vercel(),
  prefetch: {
    defaultStrategy: 'hover',
  },
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
  vite: {
    plugins: [tailwindcss()]
  }
});