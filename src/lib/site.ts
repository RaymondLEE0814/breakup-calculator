/** Single source of truth for anything that appears in a <head>. */

export const SITE = {
  url: 'https://love.mycarebom.com',
  name: '이혼 확률 계산기',
  /** Used in JSON-LD as the publisher and in the footer. */
  publisher: 'mycarebom',
  locale: 'ko_KR',
  description:
    '연애 헤어질 확률부터 부부 이혼 확률, 황혼 이혼까지. 관계의 위험 신호를 질문으로 담담하게 점검해 보세요.',
  defaultOg: '/og/default.png',
} as const;

export function absolute(path: string): string {
  return new URL(path, SITE.url).href;
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbLd(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absolute(c.path),
    })),
  };
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    inLanguage: 'ko-KR',
    description: SITE.description,
    publisher: { '@type': 'Organization', name: SITE.publisher },
  };
}

export function webAppLd(opts: { name: string; path: string; description: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: opts.name,
    url: absolute(opts.path),
    description: opts.description,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'All',
    inLanguage: 'ko-KR',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
    publisher: { '@type': 'Organization', name: SITE.publisher },
  };
}

export function faqLd(items: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

export function articleLd(opts: {
  headline: string;
  description: string;
  path: string;
  published: string;
  updated?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.headline,
    description: opts.description,
    url: absolute(opts.path),
    mainEntityOfPage: absolute(opts.path),
    inLanguage: 'ko-KR',
    datePublished: opts.published,
    dateModified: opts.updated ?? opts.published,
    author: { '@type': 'Organization', name: SITE.name },
    publisher: { '@type': 'Organization', name: SITE.publisher },
  };
}
