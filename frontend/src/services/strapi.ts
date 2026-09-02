import { Article } from '../types';

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';

function extractMediaUrl(coverImageField: any): string | null {
  if (!coverImageField) return null;

  if (typeof coverImageField === 'string') return coverImageField;

  let rawUrl: string | undefined = undefined;

  // Strapi v5 direct media structure
  if (coverImageField.url) {
    rawUrl = coverImageField.url;
  }
  // Strapi v4 data nested structure
  else if (coverImageField.data) {
    if (Array.isArray(coverImageField.data)) {
      rawUrl = coverImageField.data[0]?.attributes?.url || coverImageField.data[0]?.url;
    } else {
      rawUrl = coverImageField.data.attributes?.url || coverImageField.data.url;
    }
  }
  // Array of media objects
  else if (Array.isArray(coverImageField) && coverImageField.length > 0) {
    rawUrl = coverImageField[0]?.url || coverImageField[0]?.attributes?.url;
  }

  if (!rawUrl) return null;

  // Check if rawUrl is already absolute (Cloudinary / S3 / External URL)
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    return rawUrl;
  }

  // Prepend STRAPI_URL for relative uploads
  const cleanPath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
  return `${STRAPI_URL}${cleanPath}`;
}

function extractAllMediaUrls(mediaField: any): string[] {
  if (!mediaField) return [];

  // If array of media
  if (Array.isArray(mediaField)) {
    return mediaField
      .map((item: any) => extractMediaUrl(item))
      .filter((url: string | null): url is string => Boolean(url));
  }

  // Strapi v4 data array
  if (mediaField.data && Array.isArray(mediaField.data)) {
    return mediaField.data
      .map((item: any) => extractMediaUrl(item))
      .filter((url: string | null): url is string => Boolean(url));
  }

  // Single media
  const single = extractMediaUrl(mediaField);
  return single ? [single] : [];
}

export interface HeroData {
  coverImages: string[];
  title?: string;
  subtitle?: string;
}

export async function fetchHeroFromStrapi(): Promise<HeroData | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${STRAPI_URL}/api/hero?populate=*`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const json = await response.json();
    if (!json || !json.data) return null;

    const heroRecord = Array.isArray(json.data) ? json.data[0] : json.data;
    if (!heroRecord) return null;

    const attrs = heroRecord.attributes || heroRecord;
    const urls: string[] = [];

    // Check multiple images first
    if (attrs.coverImages || heroRecord.coverImages) {
      const multi = extractAllMediaUrls(attrs.coverImages || heroRecord.coverImages);
      urls.push(...multi);
    }

    // Check single image
    if (attrs.coverImage || heroRecord.coverImage) {
      const single = extractMediaUrl(attrs.coverImage || heroRecord.coverImage);
      if (single && !urls.includes(single)) {
        urls.push(single);
      }
    }

    if (urls.length === 0) return null;

    return {
      coverImages: urls,
      title: attrs.title,
      subtitle: attrs.subtitle,
    };
  } catch (error) {
    console.warn('Could not fetch Hero data from Strapi CMS:', error);
    return null;
  }
}

export async function fetchArticlesFromStrapi(): Promise<Article[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${STRAPI_URL}/api/articles?populate=*`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`Strapi returned status ${response.status}`);
    const json = await response.json();

    if (!json.data || !Array.isArray(json.data) || json.data.length === 0) {
      console.info('Strapi returned empty articles array.');
      return [];
    }

    console.log('Fetched data from Strapi CMS:', json.data);

    return json.data.map((item: any) => {
      const attrs = item.attributes || item;
      const extractedImage = extractMediaUrl(attrs.coverImage || item.coverImage);

      return {
        id: item.id,
        slug: attrs.slug || `artikel-${item.id}`,
        title: attrs.title || 'Judul Artikel',
        excerpt: attrs.excerpt || '',
        category: attrs.category || 'Legal',
        publishedAt:
          attrs.publishedAt || attrs.published_at || attrs.publishDate || attrs.createdAt
            ? new Date(
                attrs.publishedAt || attrs.published_at || attrs.publishDate || attrs.createdAt
              )
                .toISOString()
                .split('T')[0]
            : '2026-08-01',
        readingTime: attrs.readingTime || '5 mnt baca',
        coverImage:
          extractedImage ||
          'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
        author: {
          name: attrs.author?.name || attrs.authorName || 'Dharma Banten Editorial',
          role: attrs.author?.role || attrs.authorRole || 'Konsultan Utama',
        },
        content: Array.isArray(attrs.content)
          ? attrs.content
          : typeof attrs.content === 'string'
            ? attrs.content.split('\n\n')
            : [attrs.excerpt || 'Artikel ini menyajikan perspektif mendalam bagi manajemen puncak.'],
        keyTakeaways: Array.isArray(attrs.keyTakeaways)
          ? attrs.keyTakeaways
          : [attrs.excerpt || 'Perspektif strategis dari Dharma Banten.'],
      };
    });
  } catch (error) {
    console.warn('Strapi backend offline/error:', error);
    return [];
  }
}

export async function submitConsultationBooking(data: {
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  packageName: string;
  packagePrice?: string;
  bookingDate: string;
  bookingTime: string;
  description: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${STRAPI_URL}/api/consultations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          ...data,
          status: 'Baru',
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      const msg = errJson?.error?.message || `Strapi error (${response.status})`;
      console.warn('Failed to submit consultation to Strapi:', msg);
      return { success: false, error: msg };
    }

    const json = await response.json();
    console.log('Consultation successfully saved to Strapi CMS:', json);
    return { success: true, data: json };
  } catch (error: any) {
    console.warn('Could not connect to Strapi to save consultation booking:', error);
    return { success: false, error: error?.message || 'Network error' };
  }
}

