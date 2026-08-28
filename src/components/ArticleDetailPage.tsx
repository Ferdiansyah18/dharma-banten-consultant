import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { fetchArticlesFromStrapi } from '../services/strapi';
import { Article, Service } from '../types';
import { Arrow, BackArrow, WhatsAppIcon } from './icons/Icons';
import { Brand } from './ui/Brand';

interface ArticleDetailPageProps {
  slug: string;
  onBack: () => void;
  onBook: (service?: Service) => void;
  onSelectArticle: (article: Article) => void;
}

export function ArticleDetailPage({
  slug,
  onBack,
  onBook,
  onSelectArticle,
}: ArticleDetailPageProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const updateHeader = () => setScrolled(window.scrollY > 28);
    window.addEventListener('scroll', updateHeader, { passive: true });
    return () => window.removeEventListener('scroll', updateHeader);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchArticlesFromStrapi().then((data) => {
      setAllArticles(data);
      const found = data.find((item) => item.slug === slug);
      setArticle(found || null);
      setLoading(false);
    });
  }, [slug]);

  const formatReadingTime = (timeStr?: string) => {
    if (!timeStr) return '5 mnt baca';
    return timeStr.replace('min read', 'mnt baca').replace('mins read', 'mnt baca');
  };

  if (loading) {
    return (
      <div className="article-detail-page site loading-state">
        <header className={`landing-header ${scrolled ? 'is-scrolled' : ''}`}>
          <Brand onClick={onBack} />
          <button className="header-cta" onClick={() => onBook()}>
            Jadwal &amp; Biaya <Arrow />
          </button>
        </header>
        <div className="layout-wide section-pad text-center">
          <div className="loading-spinner" />
          <p>Memuat wawasan...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="article-detail-page site not-found-state">
        <header className={`landing-header ${scrolled ? 'is-scrolled' : ''}`}>
          <Brand onClick={onBack} />
          <button className="header-cta" onClick={() => onBook()}>
            Jadwal &amp; Biaya <Arrow />
          </button>
        </header>
        <div className="layout-wide section-pad text-center">
          <h2>Artikel tidak ditemukan</h2>
          <p>Maaf, wawasan yang Anda cari tidak tersedia atau telah dipindahkan.</p>
          <button className="gold-button margin-top-2" onClick={onBack}>
            <BackArrow size={14} /> Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  const relatedArticles = allArticles.filter((item) => item.id !== article.id).slice(0, 2);

  const whatsappMessage = encodeURIComponent(
    `Halo Dharma Banten, saya membaca artikel "${article.title}" dan bermaksud untuk berkonsultasi lebih lanjut mengenai topik ini.`
  );
  const whatsappUrl = `https://wa.me/6281234567890?text=${whatsappMessage}`;

  return (
    <motion.div
      className="article-detail-page site"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Article Navigation Header */}
      <header className={`landing-header ${scrolled ? 'is-scrolled' : ''}`}>
        <Brand onClick={onBack} />
        <nav className="landing-nav article-header-nav" aria-label="Navigasi Artikel">
          <button className="header-cta" onClick={() => onBook(article.category)}>
            Jadwal &amp; Biaya <Arrow />
          </button>
        </nav>
      </header>

      <main id="top" className="article-detail-main">
        {/* Clean Focused Article Container */}
        <article className="article-focused-container layout-wide">
          <div className="article-breadcrumb">
            <button onClick={onBack}>
              <BackArrow size={14} /> Kembali ke Wawasan
            </button>
            <span className="breadcrumb-sep">•</span>
            <span className="breadcrumb-current">{article.category}</span>
          </div>

          {/* Title Header Block */}
          <header className="article-header-block">
            <div className="article-header-meta">
              <span className="article-category-badge">{article.category}</span>
              <span className="meta-dot">•</span>
              <span className="article-date">{article.publishedAt}</span>
              <span className="meta-dot">•</span>
              <span className="article-read-time">{formatReadingTime(article.readingTime)}</span>
            </div>

            <h1 className="article-detail-title">{article.title}</h1>

            {/* Prominent Featured Image */}
            <div className="article-cover-frame">
              <img src={article.coverImage} alt={article.title} />
            </div>

            <p className="article-detail-lead">{article.excerpt}</p>

            <div className="article-author-bar">
              <div className="author-avatar-seal">{article.author.name.charAt(0)}</div>
              <div className="author-info">
                <strong>{article.author.name}</strong>
                <small>{article.author.role}</small>
              </div>
              <div className="article-share-actions">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="article-share-btn"
                  title="Konsultasikan via WhatsApp"
                >
                  <WhatsAppIcon size={16} /> Konsultasi Topik Ini
                </a>
              </div>
            </div>
          </header>

          {/* Article Main Text Content */}
          <div className="article-rich-text">
            {article.content && article.content.length > 0 ? (
              article.content.map((paragraph, idx) => (
                <p key={idx} className={`article-paragraph ${idx === 0 ? 'lead-paragraph' : ''}`}>
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="article-paragraph lead-paragraph">{article.excerpt}</p>
            )}
          </div>

          {/* Embedded WhatsApp Consultation CTA */}
          <div className="article-consultation-banner">
            <div className="banner-content">
              <span className="section-label gold-label">Konsultasi Khusus</span>
              <h3>Menghadapi Tantangan Serupa di Perusahaan Anda?</h3>
              <p>
                Tim konsultan Dharma Banten siap mendampingi eksekutif dalam penyesuaian regulasi,
                penataan HR, dan mitigasi risiko hukum bisnis Anda.
              </p>
            </div>
            <div className="banner-actions">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="gold-button"
              >
                Konsultasikan Topik Ini <Arrow />
              </a>
              <button className="underlined-action" onClick={() => onBook(article.category)}>
                Atur Jadwal Diskusi ({article.category})
              </button>
            </div>
          </div>
        </article>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <section className="related-articles-section layout-wide section-pad">
            <div className="section-split">
              <p className="section-label">Wawasan Terkait</p>
              <div>
                <h2>Perspektif Lainnya dari Dharma Banten</h2>
              </div>
            </div>
            <div className="articles-grid margin-top-2">
              {relatedArticles.map((relArticle) => (
                <article
                  key={relArticle.id}
                  className="article-card"
                  onClick={() => onSelectArticle(relArticle)}
                >
                  <div className="article-image-wrap">
                    <img src={relArticle.coverImage} alt={relArticle.title} loading="lazy" />
                    <span className="article-category-tag">{relArticle.category}</span>
                  </div>
                  <div className="article-content">
                    <div className="article-meta">
                      <span>{relArticle.publishedAt}</span>
                      <span className="meta-dot">•</span>
                      <span>{formatReadingTime(relArticle.readingTime)}</span>
                    </div>
                    <h3 className="article-card-title">{relArticle.title}</h3>
                    <p className="article-card-excerpt">{relArticle.excerpt}</p>
                    <div className="article-footer">
                      <span className="article-author">{relArticle.author.name}</span>
                      <span className="article-read-link">
                        Baca Artikel <Arrow />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="layout-wide footer-grid">
          <Brand dark onClick={onBack} />
          <div>
            <p className="footer-label">Kantor</p>
            <address>
              Jl. East Portofino WF19/70
              <br />
              Banten, Indonesia
            </address>
          </div>
          <div>
            <p className="footer-label">Mulai Konsultasi</p>
            <a href="mailto:hello@dharmabanten.co.id">
              hello@dharmabanten.co.id <Arrow />
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">
              LinkedIn <Arrow />
            </a>
          </div>
        </div>
        <div className="layout-wide footer-base">
          <span>2026 Dharma Banten Konsultan</span>
          <span>HR / Legal / Talenta</span>
        </div>
      </footer>
    </motion.div>
  );
}
