import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchArticlesFromStrapi, getCachedArticles } from '../services/strapi';
import { initialArticles } from '../data/articles';
import { Article, ArticleCategory } from '../types';
import { Arrow, DocumentIcon, ResetIcon, WhatsAppIcon } from './icons/Icons';
import { Reveal } from './ui/Reveal';

export function ArticlesSection({
  onSelectArticle,
}: {
  onSelectArticle?: (article: Article) => void;
}) {
  // Langsung tampilkan artikel dari cache lokal / data awal (0ms tanpa flicker)
  const [articles, setArticles] = useState<Article[]>(() => {
    const cached = getCachedArticles();
    return cached.length > 0 ? cached : initialArticles;
  });
  // Loading skeleton hanya aktif jika benar-benar belum ada data sama sekali
  const [loading, setLoading] = useState<boolean>(() => {
    const cached = getCachedArticles();
    return cached.length === 0 && initialArticles.length === 0;
  });
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory>('All');

  useEffect(() => {
    let isMounted = true;

    // Ambil versi terbaru secara background (Stale-While-Revalidate)
    fetchArticlesFromStrapi()
      .then((data) => {
        if (isMounted) {
          if (data && data.length > 0) {
            setArticles(data);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const categories: ArticleCategory[] = ['All', 'Legal', 'HR', 'Talenta'];

  const filteredArticles =
    selectedCategory === 'All'
      ? articles
      : articles.filter((item) => item.category === selectedCategory);

  const formatReadingTime = (timeStr?: string) => {
    if (!timeStr) return '5 mnt baca';
    return timeStr.replace('min read', 'mnt baca').replace('mins read', 'mnt baca');
  };

  const whatsappMessage = encodeURIComponent(
    'Halo Dharma Banten, saya ingin berkonsultasi mengenai wawasan hukum dan strategi ketenagakerjaan perusahaan kami.'
  );
  const whatsappUrl = `https://wa.me/6281916243614?text=${whatsappMessage}`;

  return (
    <section
      id="insights"
      className="articles-section section-snap-screen"
      aria-labelledby="articles-title"
    >
      <div className="layout-wide section-screen-inner">
        <Reveal className="section-split-compact">
          <p className="section-label">Wawasan Hukum &amp; Ketenagakerjaan</p>
          <div>
            <h2 id="articles-title">Perspektif Hukum, HR, dan Kepemimpinan.</h2>
            <p>
              Artikel dan wawasan strategis terkini yang dirancang untuk membantu jajaran manajemen
              mengambil keputusan bisnis secara tepat, patuh hukum, dan berkelanjutan.
            </p>
          </div>
        </Reveal>

        {/* Category Filter Tabs */}
        <div className="article-category-filter-screen">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`article-cat-btn ${selectedCategory === cat ? 'active' : ''}`}
            >
              {cat === 'All' ? 'Semua Artikel' : cat}
            </button>
          ))}
        </div>

        {/* Articles Content Area */}
        <div className="articles-grid-screen">
          {loading ? (
            /* Skeleton Loading Grid (3 Cards) */
            <>
              {[1, 2, 3].map((item) => (
                <div key={`skeleton-${item}`} className="skeleton-card-screen" aria-hidden="true">
                  <div className="skeleton-image-wrap skeleton-shimmer">
                    <div className="skeleton-category-pill skeleton-shimmer" />
                  </div>
                  <div className="skeleton-content">
                    <div className="skeleton-meta-row">
                      <div className="skeleton-line skeleton-date skeleton-shimmer" />
                      <span className="skeleton-dot" />
                      <div className="skeleton-line skeleton-read-time skeleton-shimmer" />
                    </div>
                    <div className="skeleton-title-wrap">
                      <div className="skeleton-line skeleton-title-1 skeleton-shimmer" />
                      <div className="skeleton-line skeleton-title-2 skeleton-shimmer" />
                    </div>
                    <div className="skeleton-excerpt-wrap">
                      <div className="skeleton-line skeleton-excerpt-1 skeleton-shimmer" />
                      <div className="skeleton-line skeleton-excerpt-2 skeleton-shimmer" />
                    </div>
                    <div className="skeleton-footer-row">
                      <div className="skeleton-line skeleton-author skeleton-shimmer" />
                      <div className="skeleton-line skeleton-link skeleton-shimmer" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : filteredArticles.length === 0 ? (
            /* Empty State Container */
            <motion.div
              className="articles-empty-state"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="empty-state-icon-seal" aria-hidden="true">
                <DocumentIcon size={26} />
              </div>
              <h3 className="empty-state-title">
                {selectedCategory === 'All'
                  ? 'Belum Ada Artikel yang Ditambahkan'
                  : `Belum Ada Artikel Kategori ${selectedCategory}`}
              </h3>
              <p className="empty-state-desc">
                {selectedCategory === 'All'
                  ? 'Tim konsultan dan analis Dharma Banten sedang menyusun kajian hukum, regulasi ketenagakerjaan, dan kepemimpinan strategis terkini. Silakan kembali dalam waktu dekat atau konsultasikan langsung kebutuhan organisasi Anda.'
                  : `Saat ini belum ada publikasi yang tersedia untuk kategori ${selectedCategory}. Anda dapat melihat kategori lain atau kembali ke seluruh publikasi wawasan.`}
              </p>
              <div className="empty-state-actions">
                {selectedCategory !== 'All' && (
                  <button
                    className="empty-state-reset-btn"
                    onClick={() => setSelectedCategory('All')}
                  >
                    <ResetIcon size={14} /> Tampilkan Semua Artikel
                  </button>
                )}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="empty-state-consult-btn"
                >
                  <WhatsAppIcon size={14} /> Konsultasi Manajemen <Arrow />
                </a>
              </div>
            </motion.div>
          ) : (
            /* Real Articles List */
            <AnimatePresence mode="popLayout">
              {filteredArticles.slice(0, 3).map((article, index) => (
                <motion.article
                  key={article.id}
                  className="article-card-screen"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.45, delay: index * 0.07 }}
                  onClick={() => onSelectArticle && onSelectArticle(article)}
                >
                  <figure className="article-image-wrap-screen" style={{ margin: 0 }}>
                    <img src={article.coverImage} alt={article.title} loading="lazy" width="600" height="340" />
                    <span className="article-category-tag">{article.category}</span>
                  </figure>
                  <div className="article-content-screen">
                    <div className="article-meta-screen">
                      <time dateTime={article.publishedAt}>{article.publishedAt}</time>
                      <span className="meta-dot" aria-hidden="true">•</span>
                      <span>{formatReadingTime(article.readingTime)}</span>
                    </div>
                    <h3 className="article-card-title-screen">{article.title}</h3>
                    <p className="article-card-excerpt-screen">{article.excerpt}</p>
                    <div className="article-footer-screen">
                      <span className="article-author">{article.author.name}</span>
                      <span className="article-read-link">
                        Baca Artikel <Arrow />
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
}

