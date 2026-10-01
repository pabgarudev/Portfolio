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
      // The high-contrast variants, not the plain ones: measured with axe,
      // github-dark put code comments at 3.04:1 and github-light put one
      // keyword colour at 3.48:1, both under the 4.5:1 required.
      themes: { light: 'github-light-high-contrast', dark: 'github-dark-high-contrast' },
    },
  },
  vite: {
    plugins: [tailwindcss()]
  }
});