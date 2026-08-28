import { useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { ArticleDetailPage } from './components/ArticleDetailPage';
import { BookingPage } from './components/BookingPage';
import { HomePage } from './components/HomePage';
import { Article, Page, Service } from './types';

function parseRoute(): { page: Page; articleSlug: string } {
  const path = window.location.pathname;
  if (path.startsWith('/article/')) {
    return { page: 'article', articleSlug: path.replace('/article/', '') };
  }
  if (path.startsWith('/artikel/')) {
    return { page: 'article', articleSlug: path.replace('/artikel/', '') };
  }
  if (path === '/pricing-and-booking') {
    return { page: 'booking', articleSlug: '' };
  }
  return { page: 'home', articleSlug: '' };
}

export default function App() {
  const [{ page, articleSlug }, setRoute] = useState(parseRoute);
  const [bookingService, setBookingService] = useState<Service>('Legal');

  useEffect(() => {
    const handlePopState = () => setRoute(parseRoute());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (nextPage: Page, service?: Service, slug?: string) => {
    if (service) setBookingService(service);

    let path = '/';
    if (nextPage === 'booking') {
      path = '/pricing-and-booking';
    } else if (nextPage === 'article' && slug) {
      path = `/article/${slug}`;
    }

    window.history.pushState({}, '', path);
    setRoute({ page: nextPage, articleSlug: slug || '' });
    window.scrollTo(0, 0);
  };

  const handleSelectArticle = (article: Article) => {
    navigate('article', article.category, article.slug);
  };

  return (
    <AnimatePresence mode="wait">
      {page === 'home' ? (
        <HomePage
          key="home"
          onBook={(service) => navigate('booking', service)}
          onSelectArticle={handleSelectArticle}
        />
      ) : page === 'booking' ? (
        <BookingPage
          key="booking"
          defaultService={bookingService}
          onHome={() => navigate('home')}
        />
      ) : (
        <ArticleDetailPage
          key={`article-${articleSlug}`}
          slug={articleSlug}
          onBack={() => navigate('home')}
          onBook={(service) => navigate('booking', service)}
          onSelectArticle={handleSelectArticle}
        />
      )}
    </AnimatePresence>
  );
}

