export type Page = 'home' | 'booking' | 'article';
export type Service = 'Talenta' | 'HR' | 'Legal';
export type PackageId = string;

export type ServicePillar = {
  id: Service;
  number: string;
  title: string;
  descriptor: string;
  description: string;
  points: string[];
};

export type Package = {
  id: PackageId;
  service: Service;
  label: string;
  title: string;
  price: string;
  description: string;
  included: string[];
};

export type CalendarDay = {
  day: string;
  date: string;
};

export type ArticleCategory = 'All' | 'Legal' | 'HR' | 'Talenta';

export type Article = {
  id: number | string;
  slug: string;
  title: string;
  excerpt: string;
  category: 'Legal' | 'HR' | 'Talenta';
  publishedAt: string;
  readingTime: string;
  coverImage: string;
  author: {
    name: string;
    role: string;
  };
  content?: string[];
  keyTakeaways?: string[];
};

