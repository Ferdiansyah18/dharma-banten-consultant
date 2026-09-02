import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { fetchArticlesFromStrapi } from '../services/strapi';
import { Article, Service } from '../types';
import { Arrow, BackArrow, WhatsAppIcon } from './icons/Icons';
import { Brand } from './ui/Brand';
import { SEO } from './SEO';

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
        <SEO
          title="Memuat Wawasan..."
          description="Memuat publikasi wawasan hukum dan ketenagakerjaan Dharma Banten."
        />
        <header role="banner" className={`landing-header ${scrolled ? 'is-scrolled' : ''}`}>
          <Brand onClick={onBack} />
          <button className="header-cta" onClick={() => onBook()}>
            Jadwal &amp; Biaya <Arrow />
          </button>
        </header>
        <main
          className="article-detail-main layout-wide skeleton-detail-wrap"
          aria-busy="true"
          aria-label="Memuat artikel"
        >
          <div className="article-focused-container">
            <div className="skeleton-line skeleton-breadcrumb skeleton-shimmer" />
            <div className="skeleton-line skeleton-detail-badge skeleton-shimmer" />
            <div className="skeleton-line skeleton-detail-h1-1 skeleton-shimmer" />
            <div className="skeleton-line skeleton-detail-h1-2 skeleton-shimmer" />
            <div className="skeleton-line skeleton-detail-cover skeleton-shimmer" />
            <div className="skeleton-line skeleton-detail-author skeleton-shimmer" />
            <div
              className="skeleton-line skeleton-detail-paragraph skeleton-shimmer"
              style={{ width: '100%' }}
            />
            <div
              className="skeleton-line skeleton-detail-paragraph skeleton-shimmer"
              style={{ width: '96%' }}
            />
            <div
              className="skeleton-line skeleton-detail-paragraph skeleton-shimmer"
              style={{ width: '92%' }}
            />
            <div
              className="skeleton-line skeleton-detail-paragraph skeleton-shimmer"
              style={{ width: '70%', marginBottom: '2rem' }}
            />
            <div
              className="skeleton-line skeleton-detail-paragraph skeleton-shimmer"
              style={{ width: '100%' }}
            />
            <div
              className="skeleton-line skeleton-detail-paragraph skeleton-shimmer"
              style={{ width: '94%' }}
            />
            <div
              className="skeleton-line skeleton-detail-paragraph skeleton-shimmer"
              style={{ width: '85%' }}
            />
          </div>
        </main>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="article-detail-page site not-found-state">
        <SEO
          title="Artikel Tidak Ditemukan"
          description="Publikasi wawasan yang Anda cari tidak tersedia di Dharma Banten."
        />
        <header role="banner" className={`landing-header ${scrolled ? 'is-scrolled' : ''}`}>
          <Brand onClick={onBack} />
          <button className="header-cta" onClick={() => onBook()}>
            Jadwal &amp; Biaya <Arrow />
          </button>
        </header>
        <main className="layout-wide section-pad text-center">
          <div className="articles-empty-state" style={{ margin: '3rem auto' }}>
            <div className="empty-state-icon-seal" aria-hidden="true">
              <BackArrow size={22} />
            </div>
            <h1 className="empty-state-title">Artikel Tidak Ditemukan</h1>
            <p className="empty-state-desc">
              Maaf, publikasi wawasan yang Anda cari tidak tersedia, belum ditambahkan, atau telah
              dipindahkan ke topik lain.
            </p>
            <div className="empty-state-actions">
              <button className="empty-state-consult-btn" onClick={onBack}>
                <BackArrow size={14} /> Kembali ke Beranda
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const relatedArticles = allArticles.filter((item) => item.id !== article.id).slice(0, 2);

  const whatsappMessage = encodeURIComponent(
    `Halo Dharma Banten, saya membaca artikel "${article.title}" dan bermaksud untuk berkonsultasi lebih lanjut mengenai topik ini.`
  );
  const whatsappUrl = `https://wa.me/6281916243614?text=${whatsappMessage}`;

  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `https://dharmabantenconsultant.com/article/${article.slug}#article`,
        isPartOf: {
          '@type': 'WebSite',
          '@id': 'https://dharmabantenconsultant.com/#website',
          name: 'Dharma Banten',
          url: 'https://dharmabantenconsultant.com',
        },
        headline: article.title,
        description: article.excerpt,
        image: article.coverImage,
        datePublished: article.publishedAt,
        inLanguage: 'id',
        mainEntityOfPage: `https://dharmabantenconsultant.com/article/${article.slug}`,
        articleSection: article.category,
        author: {
          '@type': 'Person',
          name: article.author.name,
          jobTitle: article.author.role,
        },
        publisher: {
          '@type': 'LegalService',
          name: 'Dharma Banten Konsultan',
          url: 'https://dharmabantenconsultant.com',
          logo: {
            '@type': 'ImageObject',
            url: 'https://dharmabantenconsultant.com/images/logo_dharma_banten_consultant.svg',
          },
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `https://dharmabantenconsultant.com/article/${article.slug}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Beranda',
            item: 'https://dharmabantenconsultant.com/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Wawasan',
            item: 'https://dharmabantenconsultant.com/#insights',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: article.title,
            item: `https://dharmabantenconsultant.com/article/${article.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <motion.div
      className="article-detail-page site"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SEO
        title={article.title}
        description={article.excerpt}
        canonical={`/article/${article.slug}`}
        ogType="article"
        ogImage={article.coverImage}
        articlePublishedTime={article.publishedAt}
        articleAuthor={article.author.name}
        articleCategory={article.category}
        structuredData={articleStructuredData}
      />

      {/* Article Navigation Header */}
      <header role="banner" className={`landing-header ${scrolled ? 'is-scrolled' : ''}`}>
        <Brand onClick={onBack} />
        <nav className="landing-nav article-header-nav" aria-label="Navigasi Artikel">
          <button className="header-cta" onClick={() => onBook(article.category)}>
            Jadwal &amp; Biaya <Arrow />
          </button>
        </nav>
      </header>

      <main id="main-content" className="article-detail-main">
        {/* Clean Focused Article Container */}
        <article
          className="article-focused-container layout-wide"
          itemScope
          itemType="https://schema.org/BlogPosting"
        >
          {/* Semantic Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="article-breadcrumb">
            <ol
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                listStyle: 'none',
                margin: 0,
                padding: 0,
              }}
            >
              <li>
                <button onClick={onBack} aria-label="Kembali ke halaman wawasan">
                  <BackArrow size={14} /> Kembali ke Wawasan
                </button>
              </li>
              <li className="breadcrumb-sep" aria-hidden="true" style={{ margin: '0 0.5rem' }}>
                •
              </li>
              <li>
                <span className="breadcrumb-current" aria-current="page">
                  {article.category}
                </span>
              </li>
            </ol>
          </nav>

          {/* Title Header Block */}
          <header className="article-header-block">
            <div className="article-header-meta">
              <span className="article-category-badge">{article.category}</span>
              <span className="meta-dot" aria-hidden="true">
                •
              </span>
              <time className="article-date" dateTime={article.publishedAt} itemProp="datePublished">
                {article.publishedAt}
              </time>
              <span className="meta-dot" aria-hidden="true">
                •
              </span>
              <span className="article-read-time">{formatReadingTime(article.readingTime)}</span>
            </div>

            <h1 className="article-detail-title" itemProp="headline">
              {article.title}
            </h1>

            {/* Prominent Featured Image */}
            <figure className="article-cover-frame">
              <img
                src={article.coverImage}
                alt={article.title}
                itemProp="image"
                loading="eager"
                width="1200"
                height="630"
              />
            </figure>

            <p className="article-detail-lead" itemProp="description">
              {article.excerpt}
            </p>

            <div
              className="article-author-bar"
              itemProp="author"
              itemScope
              itemType="https://schema.org/Person"
            >
              <div className="author-avatar-seal" aria-hidden="true">
                {article.author.name.charAt(0)}
              </div>
              <div className="author-info">
                <strong itemProp="name">{article.author.name}</strong>
                <small itemProp="jobTitle">{article.author.role}</small>
              </div>
              <div className="article-share-actions">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="article-share-btn"
                  title="Konsultasikan via WhatsApp"
                  aria-label="Konsultasikan topik ini melalui WhatsApp I Wayan Sugiarta"
                >
                  <WhatsAppIcon size={16} /> Konsultasi Topik Ini
                </a>
              </div>
            </div>
          </header>

          {/* Article Main Text Content */}
          <div className="article-rich-text" itemProp="articleBody">
            {article.content && article.content.length > 0 ? (
              article.content.map((paragraph, idx) => (
                <p
                  key={idx}
                  className={`article-paragraph ${idx === 0 ? 'lead-paragraph' : ''}`}
                >
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="article-paragraph lead-paragraph">{article.excerpt}</p>
            )}
          </div>

          {/* Embedded WhatsApp Consultation CTA */}
          <section
            className="article-consultation-banner"
            aria-labelledby="article-cta-title"
          >
            <div className="banner-content">
              <span className="section-label gold-label">Konsultasi Khusus</span>
              <h2 id="article-cta-title" style={{ fontSize: '1.45rem', marginTop: '0.4rem', marginBottom: '0.8rem' }}>
                Menghadapi Tantangan Serupa di Perusahaan Anda?
              </h2>
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
              <button
                className="underlined-action"
                onClick={() => onBook(article.category)}
              >
                Atur Jadwal Diskusi ({article.category})
              </button>
            </div>
          </section>
        </article>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <section
            className="related-articles-section layout-wide section-pad"
            aria-labelledby="related-articles-heading"
          >
            <div className="section-split">
              <p className="section-label">Wawasan Terkait</p>
              <div>
                <h2 id="related-articles-heading">Perspektif Lainnya dari Dharma Banten</h2>
              </div>
            </div>
            <div className="articles-grid margin-top-2">
              {relatedArticles.map((rel) => (
                <article
                  key={rel.id}
                  className="article-card-screen"
                  onClick={() => onSelectArticle(rel)}
                  style={{ cursor: 'pointer' }}
                >
                  <figure className="article-image-wrap-screen" style={{ margin: 0 }}>
                    <img src={rel.coverImage} alt={rel.title} loading="lazy" />
                    <span className="article-category-tag">{rel.category}</span>
                  </figure>
                  <div className="article-content-screen">
                    <div className="article-meta-screen">
                      <time dateTime={rel.publishedAt}>{rel.publishedAt}</time>
                      <span className="meta-dot" aria-hidden="true">
                        •
                      </span>
                      <span>{formatReadingTime(rel.readingTime)}</span>
                    </div>
                    <h3 className="article-card-title-screen">{rel.title}</h3>
                    <p className="article-card-excerpt-screen">{rel.excerpt}</p>
                    <div className="article-footer-screen">
                      <span className="article-author">{rel.author.name}</span>
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

      {/* Global Footer */}
      <footer className="article-detail-footer" role="contentinfo" aria-label="Footer Dharma Banten">
        <div className="layout-wide footer-grid">
          <div>
            <Brand dark onClick={onBack} />
            <p className="footer-tagline">
              Konsultan Hukum, HR &amp; Talenta Terpadu di Tangerang dan Sekitarnya.
            </p>
          </div>
          <div>
            <p className="footer-label">Kantor</p>
            <address>
              Jl. East Portofino WF19/70
              <br />
              Banten, Indonesia
            </address>
          </div>
          <div>
            <p className="footer-label">WhatsApp</p>
            <a
              href="https://wa.me/6281916243614"
              target="_blank"
              rel="noreferrer"
              title="Hubungi I Wayan Sugiarta via WhatsApp"
            >
              <WhatsAppIcon size={14} /> 0819 1624 3614 (I Wayan Sugiarta) <Arrow />
            </a>
            <a
              href="https://wa.me/6285162750218"
              target="_blank"
              rel="noreferrer"
              title="Hubungi Ferdiansyah via WhatsApp"
            >
              <WhatsAppIcon size={14} /> 0851 6275 0218 (Ferdiansyah) <Arrow />
            </a>
          </div>
          <div>
            <p className="footer-label">Mulai Konsultasi</p>
            <a href="mailto:info@dharmabantenconsultant.com">
              info@dharmabantenconsultant.com <Arrow />
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">
              LinkedIn <Arrow />
            </a>
          </div>
        </div>
        <div className="layout-wide footer-base">
          <span>© 2026 Dharma Banten Konsultan</span>
          <span>HR / Legal / Talenta</span>
        </div>
      </footer>
    </motion.div>
  );
}
