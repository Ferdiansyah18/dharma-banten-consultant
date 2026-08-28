import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { fetchArticlesFromStrapi } from '../services/strapi';
import { Article, ArticleCategory } from '../types';
import { Arrow } from './icons/Icons';
import { Reveal } from './ui/Reveal';

export function ArticlesSection({
  onSelectArticle,
}: {
  onSelectArticle?: (article: Article) => void;
}) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory>('All');

  useEffect(() => {
    fetchArticlesFromStrapi().then((data) => setArticles(data));
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

        {/* Articles Grid */}
        <div className="articles-grid-screen">
          {filteredArticles.slice(0, 3).map((article, index) => (
            <motion.article
              key={article.id}
              className="article-card-screen"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              onClick={() => onSelectArticle && onSelectArticle(article)}
            >
              <div className="article-image-wrap-screen">
                <img src={article.coverImage} alt={article.title} loading="lazy" />
                <span className="article-category-tag">{article.category}</span>
              </div>
              <div className="article-content-screen">
                <div className="article-meta-screen">
                  <span>{article.publishedAt}</span>
                  <span className="meta-dot">•</span>
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
        </div>
      </div>
    </section>
  );
}
