import { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  articlePublishedTime?: string;
  articleAuthor?: string;
  articleCategory?: string;
  structuredData?: object | object[];
}

const DEFAULT_TITLE = 'Dharma Banten — Konsultan Hukum, HR & Manajemen Talenta Terpadu';
const DEFAULT_DESCRIPTION =
  'Penasihat hukum dan ketenagakerjaan tingkat tinggi untuk keputusan strategis yang membutuhkan presisi regulasi dan pertimbangan bisnis di Tangerang dan sekitarnya.';
const DEFAULT_KEYWORDS =
  'konsultan hukum tangerang, penasihat hukum tangerang, konsultan hr tangerang, manajemen talenta tangerang, hukum ketenagakerjaan tangerang, advokat peradi tangerang, audit kepatuhan hr, legal corporate tangerang, i wayan sugiarta';
const SITE_URL = 'https://dharmabantenconsultant.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/logo_dharma_banten_consultant.svg`;

function updateMetaTag(name: string, content: string, isProperty = false) {
  const attribute = isProperty ? 'property' : 'name';
  let tag = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, name);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

function updateCanonical(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.href = url;
}

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonical,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  articlePublishedTime,
  articleAuthor,
  articleCategory,
  structuredData,
}: SEOProps) {
  useEffect(() => {
    // 1. Update Title
    const fullTitle = title ? `${title} | Dharma Banten` : DEFAULT_TITLE;
    document.title = fullTitle;

    // 2. Update Primary Meta Tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', articleAuthor || 'Dharma Banten & Rekan');

    // 3. Update Canonical URL
    const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : `${SITE_URL}${window.location.pathname}`;
    updateCanonical(canonicalUrl);

    // 4. Update Open Graph Meta Tags
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', ogType, true);
    updateMetaTag('og:url', canonicalUrl, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:site_name', 'Dharma Banten', true);
    updateMetaTag('og:locale', 'id_ID', true);

    if (ogType === 'article') {
      if (articlePublishedTime) {
        updateMetaTag('article:published_time', articlePublishedTime, true);
      }
      if (articleAuthor) {
        updateMetaTag('article:author', articleAuthor, true);
      }
      if (articleCategory) {
        updateMetaTag('article:section', articleCategory, true);
      }
    }

    // 5. Update Twitter Card Meta Tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage);

    // 6. Injected JSON-LD structured data
    let scriptTag = document.getElementById('dynamic-seo-jsonld') as HTMLScriptElement | null;
    if (structuredData) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'dynamic-seo-jsonld';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(structuredData);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      // Optional cleanup
    };
  }, [
    title,
    description,
    keywords,
    canonical,
    ogType,
    ogImage,
    articlePublishedTime,
    articleAuthor,
    articleCategory,
    structuredData,
  ]);

  return null;
}
