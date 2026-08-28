import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { heroImages, pillars } from '../data/content';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import { Article, Service } from '../types';
import { ArticlesSection } from './ArticlesSection';
import { Arrow, EmailIcon, InstagramIcon, LinkedinIcon, ThreadsIcon, WhatsAppIcon } from './icons/Icons';
import { Brand } from './ui/Brand';
import { Reveal } from './ui/Reveal';

export function HomePage({
  onBook,
  onSelectArticle,
}: {
  onBook: (service?: Service) => void;
  onSelectArticle?: (article: Article) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('top');
  const [currentHeroImage] = useState(() => {
    const randomIndex = Math.floor(Math.random() * heroImages.length);
    return heroImages[randomIndex];
  });
  const smoothScrollTo = useSmoothScroll();
  const reduceMotion = useReducedMotion();

  const sectionItems = [
    { id: 'top', num: '01', label: 'Beranda' },
    { id: 'about', num: '02', label: 'Tentang' },
    { id: 'services', num: '03', label: 'Layanan' },
    { id: 'approach', num: '04', label: 'Pendekatan' },
    { id: 'insights', num: '05', label: 'Wawasan' },
    { id: 'contact', num: '06', label: 'Kontak' },
  ];

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 28);
    window.addEventListener('scroll', updateHeader, { passive: true });
    return () => window.removeEventListener('scroll', updateHeader);
  }, []);

  useEffect(() => {
    const sectionIds = ['top', 'about', 'services', 'approach', 'insights', 'contact'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.45 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const goTo = (id: string) => {
    setMenuOpen(false);
    smoothScrollTo(`#${id}`);
  };

  return (
    <motion.div
      className="site snap-site-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <header className={`landing-header ${scrolled ? 'is-scrolled' : ''} ${menuOpen ? 'is-menu-open' : ''}`}>
        <Brand onClick={() => goTo('top')} />
        <nav className={`landing-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Navigasi Utama">
          <button
            onClick={() => goTo('about')}
            className={activeSection === 'about' ? 'active-nav-link' : ''}
          >
            Tentang
          </button>
          <button
            onClick={() => goTo('services')}
            className={activeSection === 'services' ? 'active-nav-link' : ''}
          >
            Layanan
          </button>
          <button
            onClick={() => goTo('approach')}
            className={activeSection === 'approach' ? 'active-nav-link' : ''}
          >
            Pendekatan
          </button>
          <button
            onClick={() => goTo('insights')}
            className={activeSection === 'insights' ? 'active-nav-link' : ''}
          >
            Wawasan
          </button>
          <button
            onClick={() => goTo('contact')}
            className={activeSection === 'contact' ? 'active-nav-link' : ''}
          >
            Kontak
          </button>
          <button className="header-cta" onClick={() => { setMenuOpen(false); onBook(); }}>
            Jadwal &amp; Biaya <Arrow />
          </button>
        </nav>
        <button
          className={`mobile-menu ${menuOpen ? 'is-active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
        </button>
      </header>

      {menuOpen && (
        <div
          className="mobile-nav-backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Floating Side Vertical Pagination Stepper */}
      <aside className="floating-side-nav" aria-label="Navigasi Layar">
        {sectionItems.map((item) => (
          <button
            key={item.id}
            className={`side-nav-dot ${activeSection === item.id ? 'is-active' : ''}`}
            onClick={() => goTo(item.id)}
            aria-label={`Pindah ke section ${item.label}`}
          >
            <span className="dot-num">{item.num}</span>
            <span className="dot-bar" />
            <span className="dot-tooltip">{item.label}</span>
          </button>
        ))}
      </aside>

      <main className="snap-main-container">
        {/* Screen 01: Hero */}
        <section id="top" className="landing-hero section-snap-screen" aria-labelledby="hero-title">
          <img
            src={currentHeroImage}
            className="hero-photo"
            alt="Konsultan hukum dan SDM profesional di kantor"
          />
          <div className="hero-wash" />
          <div className="hero-geometry" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="hero-inner layout-wide">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="hero-brand-name">Dharma Banten</p>
              <h1 id="hero-title">
                Keadilan berdedikasi
                <br />
                pada kemakmuran.
              </h1>
            </motion.div>
            <motion.div
              className="hero-bottom"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <p>
                Penasihat hukum dan ketenagakerjaan tingkat tinggi untuk keputusan strategis yang
                membutuhkan presisi regulasi dan ketepatan pertimbangan.
              </p>
              <div className="hero-actions">
                <button className="gold-button" onClick={() => onBook()}>
                  Atur Jadwal &amp; Biaya <Arrow />
                </button>
                <button className="minimal-explore-btn" onClick={() => goTo('services')}>
                  <span>Eksplorasi Layanan</span>
                </button>
              </div>
              <div className="hero-socials" aria-label="Tautan media sosial">
                <a
                  href="mailto:hello@dharmabanten.co.id"
                  className="hero-social-link"
                  aria-label="Kirim Email"
                >
                  <EmailIcon />
                  <span className="hero-social-tooltip">Email</span>
                </a>
                <a
                  href="https://linkedin.com/company/dharmabanten"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-social-link"
                  aria-label="LinkedIn"
                >
                  <LinkedinIcon />
                  <span className="hero-social-tooltip">LinkedIn</span>
                </a>
                <a
                  href="https://instagram.com/dharmabanten"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-social-link"
                  aria-label="Instagram"
                >
                  <InstagramIcon />
                  <span className="hero-social-tooltip">Instagram</span>
                </a>
                <a
                  href="https://threads.net/@dharmabanten"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-social-link"
                  aria-label="Threads"
                >
                  <ThreadsIcon />
                  <span className="hero-social-tooltip">Threads</span>
                </a>
              </div>
            </motion.div>
          </div>
          <div className="hero-side-note" aria-hidden="true">
            BANTEN / INDONESIA
          </div>
        </section>

        {/* Screen 02: Tentang (About) */}
        <section
          id="about"
          className="authority-section section-snap-screen"
          aria-labelledby="authority-title"
        >
          <div className="layout-wide section-screen-inner">
            <Reveal className="authority-heading-compact">
              <p className="section-label">Praktik yang dibangun di atas pengalaman</p>
              <h2 id="authority-title">
                Ketenangan dimulai dengan menghadirkan orang yang tepat di ruang diskusi.
              </h2>
            </Reveal>
            <div className="founder-layout-compact">
              <Reveal className="founder-signature-compact" delay={0.1}>
                <div className="signature-seal">
                  16<sup>+</sup>
                </div>
                <span>Tahun pengalaman lintas HR, GA, dan praktik hukum</span>
              </Reveal>
              <Reveal className="founder-copy-compact" delay={0.18}>
                <p>
                  Setiap mandat Dharma Banten dibentuk oleh lebih dari enam belas tahun rekam jejak di
                  bidang manajemen SDM, operasional, dan hukum. Ini adalah pertimbangan yang memahami
                  realitas komersial di balik setiap isu, bukan sekadar aturan di atas kertas.
                </p>
                <div className="credentials-compact">
                  <span>Advokat bersertifikasi PERADI</span>
                  <span>Hukum ketenagakerjaan &amp; korporasi</span>
                  <span>Landasan akademis hukum &amp; SDM</span>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Screen 03: Layanan (Services) */}
        <section
          id="services"
          className="services-section section-snap-screen"
          aria-labelledby="services-title"
        >
          <div className="layout-wide section-screen-inner">
            <Reveal className="section-split-compact">
              <p className="section-label gold-label">Tiga bidang keahlian utama</p>
              <div>
                <h2 id="services-title">
                  Satu penasihat terpadu bagi bisnis dan seluruh insan di dalamnya.
                </h2>
                <p>
                  Tiga disiplin yang diintegrasikan bersama. Masing-masing dapat berdiri sendiri, dan
                  bersama-sama memberi jajaran pimpinan kejelasan arah langkah strategis berikutnya.
                </p>
              </div>
            </Reveal>
            <div className="pillars-grid-screen">
              {pillars.map((pillar, index) => (
                <motion.article
                  className="pillar-card-screen"
                  key={pillar.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                >
                  <div className="pillar-screen-head">
                    <span className="pillar-number">{pillar.number}</span>
                    <small>{pillar.descriptor}</small>
                    <h3>{pillar.title}</h3>
                  </div>
                  <p className="pillar-screen-desc">{pillar.description}</p>
                  <ul className="pillar-screen-points">
                    {pillar.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  <button className="underlined-action" onClick={() => onBook(pillar.id)}>
                    Atur Jadwal {pillar.id} <Arrow />
                  </button>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Screen 04: Pendekatan (Approach) */}
        <section
          id="approach"
          className="approach-section section-snap-screen"
          aria-labelledby="approach-title"
        >
          <div className="layout-wide section-screen-inner">
            <Reveal className="section-split-compact">
              <p className="section-label">Cara Kami Bekerja</p>
              <div>
                <h2 id="approach-title">Penasihat yang disiplin, tanpa sekat dan jarak.</h2>
                <p>
                  Kami membuat jalur dari kekhawatiran menuju keputusan terasa jernih, terukur, dan
                  senantiasa selaras dengan kebutuhan organisasi Anda.
                </p>
              </div>
            </Reveal>
            <div className="process-line-screen">
              {[
                {
                  num: '01',
                  step: 'Mendengarkan tanpa asumsi',
                  desc: 'Kami memulai dari fakta obyektif, dinamika para pihak, dan konteks komersial bisnis Anda.',
                },
                {
                  num: '02',
                  step: 'Memetakan keputusan sebenarnya',
                  desc: 'Kami memisahkan hal mendesak dari hal penting, lalu memaparkan opsi pertimbangan secara gamblang.',
                },
                {
                  num: '03',
                  step: 'Menyusun langkah maju yang praktis',
                  desc: 'Anda menerima solusi yang dirancang untuk dieksekusi di lapangan, bukan sekadar teori dokumen.',
                },
              ].map((item, index) => (
                <Reveal className="process-step-screen" delay={index * 0.1} key={item.step}>
                  <span>{item.num}</span>
                  <h3>{item.step}</h3>
                  <p>{item.desc}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Screen 05: Wawasan (Insights) */}
        <ArticlesSection onSelectArticle={onSelectArticle} />

        {/* Screen 06: Kontak & Closing CTA (Unified Closing Screen) */}
        <section
          id="contact"
          className="final-screen-section section-snap-screen"
          aria-labelledby="cta-title"
        >
          <div className="layout-wide section-screen-inner final-screen-inner">
            {/* Upper CTA Banner */}
            <div className="final-cta-block">
              <div className="final-cta-left">
                <p className="section-label gold-label">Langkah awal yang terarah</p>
                <h2 id="cta-title">
                  Sampaikan pertanyaan Anda.
                  <br />
                  Kami hadirkan kejelasan.
                </h2>
              </div>
              <div className="final-cta-right">
                <p>
                  Konsultasikan keputusan hukum, kebijakan ketenagakerjaan, atau kebutuhan
                  pengembangan kepemimpinan perusahaan Anda bersama penasihat terpercaya.
                </p>
                <div className="final-cta-actions">
                  <button className="gold-button" onClick={() => onBook()}>
                    Atur Jadwal &amp; Biaya <Arrow />
                  </button>
                  <a
                    href="mailto:hello@dharmabanten.co.id"
                    className="ghost-gold-action"
                  >
                    Email Kami <Arrow />
                  </a>
                </div>
              </div>
            </div>

            {/* Lower Footer Grid */}
            <div className="final-footer-grid">
              <div className="footer-brand-col">
                <Brand dark onClick={() => goTo('top')} />
                <p className="footer-tagline">
                  Konsultan Hukum, HR &amp; Talenta Terpadu di Banten &amp; Jabodetabek.
                </p>
              </div>
              <div className="footer-info-col">
                <p className="footer-label">Kantor</p>
                <address>
                  Jl. East Portofino WF19/70
                  <br />
                  Banten, Indonesia
                </address>
              </div>
              <div className="footer-info-col">
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
              <div className="footer-info-col">
                <p className="footer-label">Mulai Konsultasi</p>
                <a href="mailto:hello@dharmabanten.co.id">
                  hello@dharmabanten.co.id <Arrow />
                </a>
                <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">
                  LinkedIn <Arrow />
                </a>
              </div>
            </div>

            {/* Footer Bottom Line */}
            <div className="final-footer-base">
              <span>© 2026 Dharma Banten Konsultan</span>
              <span>HR / Legal / Talenta</span>
            </div>
          </div>
        </section>
      </main>
    </motion.div>
  );
}
