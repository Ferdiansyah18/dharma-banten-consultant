import { FormEvent, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { packages, timeSlots } from '../data/content';
import { PackageId, Service } from '../types';
import { Arrow, BackArrow, CalendarIcon, CheckIcon, ClockIcon, WhatsAppIcon } from './icons/Icons';
import { Brand } from './ui/Brand';
import { SEO } from './SEO';
import { submitConsultationBooking } from '../services/strapi';

const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateDisplay = (dateString: string) => {
  if (!dateString) return '';
  try {
    const dateObj = new Date(dateString + 'T00:00:00');
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(dateObj);
  } catch {
    return dateString;
  }
};

export function BookingPage({
  defaultService,
  onHome,
}: {
  defaultService: Service;
  onHome: () => void;
}) {
  const [step, setStep] = useState(1);
  const [service, setService] = useState<Service>(defaultService);
  const [selectedPackage, setSelectedPackage] = useState<PackageId>('legal-consultation');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString);
  const [selectedTime, setSelectedTime] = useState('10:30');
  const [submitted, setSubmitted] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleOpenDatePicker = () => {
    if (dateInputRef.current) {
      if (typeof (dateInputRef.current as any).showPicker === 'function') {
        (dateInputRef.current as any).showPicker();
      } else {
        dateInputRef.current.focus();
        dateInputRef.current.click();
      }
    }
  };
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setService(defaultService);
  }, [defaultService]);

  const currentPackage = packages.find((pkg) => pkg.id === selectedPackage) || packages[0];
  const shownPackages = packages.filter((item) => item.service === service);

  useEffect(() => {
    const first = packages.find((item) => item.service === service);
    if (first) setSelectedPackage(first.id);
  }, [service]);

  const formattedDate = formatDateDisplay(selectedDate);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: (formData.get('name') as string) || '',
      company: (formData.get('company') as string) || '',
      email: (formData.get('email') as string) || '',
      phone: (formData.get('phone') as string) || '',
      description: (formData.get('description') as string) || '',
      service: service,
      packageName: currentPackage.label,
      packagePrice: currentPackage.price,
      bookingDate: formattedDate,
      bookingTime: `${selectedTime} WIB`,
    };

    try {
      await submitConsultationBooking(payload);
    } catch (err) {
      console.warn('Submission error:', err);
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Halo Dharma Banten, saya ingin memesan jadwal konsultasi:\n\nLayanan: ${service}\nPaket: ${currentPackage.label} (${currentPackage.price})\nJadwal: ${formattedDate} pukul ${selectedTime} WIB\n\nMohon konfirmasi ketersediaan jadwal tersebut. Terima kasih.`
  );
  const whatsappUrl = `https://wa.me/6281916243614?text=${whatsappMessage}`;

  const emailMessage = encodeURIComponent(
    `Halo Dharma Banten,\n\nSaya ingin mengonfirmasi sesi ${currentPackage.label} untuk layanan ${service} pada hari ${formattedDate} pukul ${selectedTime} WIB.\n\nTerima kasih.`
  );

  const bookingStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Konsultasi ${service} - Dharma Banten`,
    provider: {
      '@type': 'LegalService',
      name: 'Dharma Banten Konsultan',
      url: 'https://dharmabantenconsultant.com',
    },
    serviceType: 'Konsultasi Profesional Hukum & HR',
    offers: {
      '@type': 'Offer',
      price: currentPackage.price.replace(/[^0-9]/g, '') || '0',
      priceCurrency: 'IDR',
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <motion.div
      className="booking-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SEO
        title="Jadwal & Biaya Konsultasi Privat"
        description="Atur jadwal dan format konsultasi hukum ketenagakerjaan, HR, dan manajemen talenta bersama konsultan Dharma Banten."
        canonical="/pricing-and-booking"
        structuredData={bookingStructuredData}
      />

      <header role="banner" className="booking-header">
        <Brand onClick={onHome} />
        <button className="back-home" onClick={onHome} aria-label="Kembali ke Beranda">
          <BackArrow size={14} /> Kembali ke Beranda
        </button>
      </header>

      <main id="main-content" className="booking-main">
        <aside className="booking-aside" aria-labelledby="booking-aside-heading">
          <p className="booking-eyebrow">Konsultasi Privat</p>
          <h1 id="booking-aside-heading">Luangkan waktu untuk keputusan yang lebih jernih.</h1>
          <p>
            Pilih layanan dan format konsultasi yang paling sesuai dengan kebutuhan Anda. Permintaan
            Anda akan ditinjau oleh tim kami dalam 1 hari kerja.
          </p>
          <div className="booking-contact">
            <span>Ingin berdiskusi langsung?</span>
            <a href="mailto:info@dharmabantenconsultant.com">info@dharmabantenconsultant.com</a>
          </div>
        </aside>

        <section className="booking-workflow" aria-label="Alur pemesanan jadwal konsultasi">
          <div className="progress-bar" aria-label={`Langkah ${step} dari 3`}>
            <span className={step >= 1 ? 'active' : ''}>
              01 <b>Layanan</b>
            </span>
            <i className={step >= 2 ? 'active' : ''} />
            <span className={step >= 2 ? 'active' : ''}>
              02 <b>Jadwal</b>
            </span>
            <i className={step >= 3 ? 'active' : ''} />
            <span className={step >= 3 ? 'active' : ''}>
              03 <b>Data Diri</b>
            </span>
          </div>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="complete"
                className="confirmation"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="confirmation-mark" aria-hidden="true">
                  DB
                </span>
                <p className="booking-eyebrow">Permintaan Diterima</p>
                <h2>Jadwal konsultasi Anda siap dikonfirmasi.</h2>
                <p>
                  Kami telah mencatat rencana konsultasi {service} Anda pada {formattedDate} pukul{' '}
                  {selectedTime} WIB. Kirim konfirmasi cepat melalui WhatsApp atau email, atau
                  nantikan respon dari tim kami dalam 1 hari kerja.
                </p>
                <div className="confirmation-summary">
                  <span>{currentPackage.label}</span>
                  <span>{formattedDate}</span>
                  <span>{selectedTime} WIB</span>
                </div>
                <div className="confirmation-actions">
                  <a href={whatsappUrl} target="_blank" rel="noreferrer" className="gold-button">
                    Lanjut ke WhatsApp <WhatsAppIcon />
                  </a>
                  <a
                    href={`mailto:info@dharmabantenconsultant.com?subject=${encodeURIComponent(
                      `Konfirmasi Konsultasi: ${service} - ${currentPackage.label}`
                    )}&body=${emailMessage}`}
                    className="ghost-button"
                  >
                    Konfirmasi via Email
                  </a>
                </div>
              </motion.div>
            ) : step === 1 ? (
              <motion.div
                key="step1"
                className="booking-step"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
              >
                <p className="booking-eyebrow">Langkah 01</p>
                <h2>Pilih bidang keahlian dan format konsultasi.</h2>
                <div className="service-tabs" role="tablist" aria-label="Pilihan Bidang Layanan">
                  {(['Legal', 'HR', 'Talenta'] as Service[]).map((tab) => (
                    <button
                      key={tab}
                      role="tab"
                      aria-selected={service === tab}
                      className={service === tab ? 'active' : ''}
                      onClick={() => setService(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="package-options">
                  {shownPackages.map((item) => (
                    <button
                      type="button"
                      className={`package-card ${selectedPackage === item.id ? 'selected' : ''}`}
                      key={item.id}
                      onClick={() => setSelectedPackage(item.id)}
                      aria-pressed={selectedPackage === item.id}
                    >
                      <span className="selection-dot" />
                      <span className="package-card-top">
                        <small>{item.label}</small>
                        <strong>{item.title}</strong>
                      </span>
                      <span className="package-card-copy">{item.description}</span>
                      <span className="package-card-price">{item.price}</span>
                    </button>
                  ))}
                </div>
                <div className="step-actions">
                  <span>
                    Layanan terpilih: <b>{service}</b>
                  </span>
                  <button type="button" className="navy-button" onClick={() => setStep(2)}>
                    Lanjutkan ke Jadwal <Arrow />
                  </button>
                </div>
              </motion.div>
            ) : step === 2 ? (
              <motion.div
                key="step2"
                className="booking-step"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
              >
                <p className="booking-eyebrow">Langkah 02</p>
                <h2>Tentukan tanggal dan waktu diskusi.</h2>

                <div className="scheduler">
                  {/* Bagian Pemilihan Tanggal */}
                  <div className="booking-section-block">
                    <div className="section-title-wrap">
                      <p className="field-label">Pilih Tanggal Konsultasi</p>
                      <span className="field-sublabel">
                        Pilih jadwal yang sesuai dengan agenda Anda melalui kalender
                      </span>
                    </div>

                    {/* Interactive Date Trigger Card */}
                    <div
                      className="custom-date-trigger-card is-custom-active"
                      onClick={handleOpenDatePicker}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleOpenDatePicker();
                        }
                      }}
                      aria-label="Pilih tanggal melalui kalender"
                    >
                      <div className="custom-date-icon-box">
                        <CalendarIcon size={24} />
                      </div>
                      <div className="custom-date-text">
                        <span className="custom-date-heading">Pilih Tanggal</span>
                        <span className="custom-date-sub">
                          {formattedDate
                            ? `✓ Tanggal Terpilih: ${formattedDate}`
                            : 'Klik di sini untuk membuka kalender dan memilih tanggal'}
                        </span>
                      </div>
                      <span className="custom-date-btn-action">
                        Buka Kalender <CalendarIcon size={15} />
                      </span>
                      <input
                        ref={dateInputRef}
                        id="booking-date"
                        type="date"
                        className="accessible-hidden-date-input"
                        value={selectedDate}
                        min={getTodayString()}
                        onChange={(e) => {
                          if (e.target.value) {
                            setSelectedDate(e.target.value);
                          }
                        }}
                        aria-label="Kalender pemilih tanggal konsultasi"
                      />
                    </div>
                  </div>

                  {/* Bagian Pilihan Waktu */}
                  <div className="booking-section-block">
                    <div className="section-title-wrap">
                      <p className="field-label">
                        Pilihan Jam Konsultasi <span>WIB</span>
                      </p>
                      <span className="field-sublabel">
                        Durasi sesi privat dialokasikan 45–60 menit dengan advokat / konsultan
                        senior
                      </span>
                    </div>

                    <div className="time-slots" role="radiogroup" aria-label="Pilihan Waktu WIB">
                      {timeSlots.map((time) => {
                        const isSelected = selectedTime === time;
                        return (
                          <button
                            key={time}
                            type="button"
                            className={`time-slot-btn ${isSelected ? 'selected' : ''}`}
                            onClick={() => setSelectedTime(time)}
                            role="radio"
                            aria-checked={isSelected}
                          >
                            <ClockIcon size={14} className="time-slot-icon" />
                            <span>{time}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ringkasan Jadwal Terpilih */}
                  {formattedDate && (
                    <div className="selected-schedule-banner">
                      <div className="schedule-banner-icon">
                        <CalendarIcon size={20} />
                      </div>
                      <div className="schedule-banner-content">
                        <span className="schedule-banner-tag">JADWAL KONSULTASI DIPILIH</span>
                        <strong className="schedule-banner-datetime">
                          {formattedDate} • Pukul {selectedTime} WIB
                        </strong>
                      </div>
                      <div className="schedule-banner-status">
                        <CheckIcon size={14} /> Terpilih
                      </div>
                    </div>
                  )}
                </div>

                <div className="step-actions">
                  <button type="button" className="underlined-action" onClick={() => setStep(1)}>
                    ← Kembali ke Pilihan Layanan
                  </button>
                  <button type="button" className="navy-button" onClick={() => setStep(3)}>
                    Lanjutkan ke Data Diri <Arrow />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="details"
                className="booking-step details-form"
                onSubmit={submit}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                aria-label="Formulir Informasi Konsultasi"
              >
                <p className="booking-eyebrow">Langkah 03</p>
                <h2>Lengkapi informasi kebutuhan Anda.</h2>
                <div className="form-grid">
                  <label htmlFor="booking-client-name">
                    Nama Lengkap
                    <input
                      id="booking-client-name"
                      required
                      name="name"
                      autoComplete="name"
                      placeholder="Nama lengkap Anda"
                      aria-required="true"
                    />
                  </label>
                  <label htmlFor="booking-company-name">
                    Perusahaan / Organisasi
                    <input
                      id="booking-company-name"
                      required
                      name="company"
                      autoComplete="organization"
                      placeholder="Nama perusahaan / organisasi"
                      aria-required="true"
                    />
                  </label>
                  <label htmlFor="booking-email">
                    Email
                    <input
                      id="booking-email"
                      required
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="nama@perusahaan.com"
                      aria-required="true"
                    />
                  </label>
                  <label htmlFor="booking-phone">
                    Nomor WhatsApp
                    <input
                      id="booking-phone"
                      required
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      placeholder="+62 812 ..."
                      aria-required="true"
                    />
                  </label>
                  <label htmlFor="booking-description" className="full-width">
                    Deskripsi Singkat Kebutuhan / Kasus
                    <textarea
                      id="booking-description"
                      required
                      name="description"
                      rows={4}
                      placeholder="Mohon jelaskan secara ringkas pokok persoalan, latar belakang, atau topik yang ingin dikonsultasikan."
                      aria-required="true"
                    />
                  </label>
                </div>
                <div className="booking-review">
                  <span>{currentPackage.label}</span>
                  <span>{service}</span>
                  <span>
                    {formattedDate}, {selectedTime} WIB
                  </span>
                </div>
                <div className="step-actions">
                  <button
                    type="button"
                    className="underlined-action"
                    onClick={() => setStep(2)}
                    disabled={isSubmitting}
                  >
                    Kembali ke Jadwal
                  </button>
                  <button type="submit" className="navy-button" disabled={isSubmitting}>
                    {isSubmitting ? 'Menyimpan ke Strapi...' : 'Kirim Permintaan Konsultasi'}{' '}
                    {!isSubmitting && <Arrow />}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </section>
      </main>

      <footer className="booking-footer" role="contentinfo" aria-label="Footer Pendaftaran">
        <span>© 2026 Dharma Banten Konsultan</span>
        <span>Permintaan Konsultasi Rahasia &amp; Terlindungi</span>
      </footer>
    </motion.div>
  );
}
