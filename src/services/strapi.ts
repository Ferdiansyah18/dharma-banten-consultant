import { initialArticles } from '../data/articles';
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
      console.info('Strapi returned empty articles array, using fallback data.');
      return initialArticles;
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
    console.warn('Strapi backend offline/error, falling back to static dataset:', error);
    return initialArticles;
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

