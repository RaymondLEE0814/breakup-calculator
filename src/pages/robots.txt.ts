import type { APIRoute } from 'astro';
import { SITE } from '../lib/site';

// Result and share pages carry a noindex meta tag rather than a Disallow: a
// crawler has to be able to fetch them to see the tag.
const body = `User-agent: *
Allow: /

Sitemap: ${SITE.url}/sitemap-index.xml
`;

export const GET: APIRoute = () =>
  new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
