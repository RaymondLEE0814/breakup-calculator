// @ts-check
import { defineConfig, passthroughImageService } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// The whole site lives on its own hostname, so canonical/OG/sitemap URLs all
// resolve against it. Cloudflare serves ./dist as static assets — every page
// here is pre-rendered HTML, which is what the SEO plan depends on.
export default defineConfig({
  site: 'https://love.mycarebom.com',
  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'auto' },
  integrations: [
    sitemap({
      // Policy pages carry no search value and would dilute the sitemap.
      filter: (page) => !page.includes('/policy/'),
    }),
  ],
  // No <Image> anywhere: every asset is an inline SVG or a PNG already
  // rendered by scripts/build-og.mjs. Skipping the sharp-backed image service
  // keeps the build from loading a native module it has nothing to do.
  image: { service: passthroughImageService() },

  vite: { plugins: [tailwindcss()] },
});
