import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const guide = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guide' }),
  schema: z.object({
    title: z.string(),
    /** Meta description and the blurb in listings. */
    description: z.string(),
    published: z.string(),
    updated: z.string().optional(),
    /** Primary search keyword this article targets. Documented, not rendered. */
    keyword: z.string(),
    /** Which calculator this article should hand the reader off to. */
    calc: z.enum(['breakup', 'divorce', 'twilight']),
    /** Slugs of two sibling articles, for the internal link block. */
    related: z.array(z.string()).default([]),
    order: z.number().default(99),
  }),
});

export const collections = { guide };
