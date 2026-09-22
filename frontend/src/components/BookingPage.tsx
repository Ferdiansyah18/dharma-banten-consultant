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

const isWeekend = (dateString: string) => {
  if (!dateString) return false;
  try {
    const d = new Date(dateString + 'T00:00:00');
    const day = d.getDay();
    return day === 0 || day === 6; // 0 = Minggu, 6 = Sabtu
  } catch {
    return false;
  }
};

const getNextWeekendString = () => {
  const d = new Date();
  while (d.getDay() !== 6 && d.getDay() !== 0) {
    d.setDate(d.getDate() + 1);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getUpcomingWeekends = (count = 6) => {
  const dates: { dateStr: string; label: string; dayName: string; dateNum: string; monthName: string }[] = [];
  const d = new Date();
  while (dates.length < count) {
    if (d.getDay() === 6 || d.getDay() === 0) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const dayName = d.getDay() === 6 ? 'Sabtu' : 'Minggu';
      const dateNum = String(d.getDate());
      const monthName = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(d);
      const label = `${dayName}, ${dateNum} ${monthName}`;
      dates.push({ dateStr, label, dayName, dateNum, monthName });
    }
    d.setDate(d.getDate() + 1);
  }
  return dates;
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
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (defaultService === 'UMKM') {
      return getNextWeekendString();
    }
    return getTodayString();
  });
  const [selectedTime, setSelectedTime] = useState('10:30');
  const [dateError, setDateError] = useState('');
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
    if (defaultService === 'UMKM' && !isWeekend(selectedDate)) {
      setSelectedDate(getNextWeekendString());
    }
  }, [defaultService]);

  const currentPackage = packages.find((pkg) => pkg.id === selectedPackage) || packages[0];
  const shownPackages = packages.filter((item) => item.service === service);

  useEffect(() => {
    const first = packages.find((item) => item.service === service);
    if (first) setSelectedPackage(first.id);

    if (service === 'UMKM') {
      if (!isWeekend(selectedDate)) {
        setSelectedDate(getNextWeekendString());
      }
    } else {
      setDateError('');
    }
  }, [service]);

  const formattedDate = formatDateDisplay(selectedDate);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (service === 'UMKM' && !isWeekend(selectedDate)) {
      setDateError('Layanan gratis UMKM hanya tersedia pada hari Sabtu dan Minggu.');
      setStep(2);
      return;
    }
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: (formData.get('name') as string) || '',
      company: (formData.get('company') as string) || '',
      email: (formData.get('email') as string) || '',
      phone: (formData.get('phone') as string) || '',
      description: (formData.get('description') as string) || '',
      service: service === 'UMKM' ? 'Klinik UMKM (Gratis)' : service,
      packageName: currentPackage.title || currentPackage.label,
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
    service === 'UMKM'
      ? `Halo Dharma Banten, saya pelaku UMKM ingin mendaftar sesi konsultasi gratis akhir pekan:\n\nLayanan: Klinik UMKM Gratis (Sabtu & Minggu)\nPaket: ${currentPackage.title} (${currentPackage.price})\nJadwal: ${formattedDate} pukul ${selectedTime} WIB\n\nMohon konfirmasi ketersediaan jadwal pro bono tersebut. Terima kasih.`
      : `Halo Dharma Banten, saya ingin memesan jadwal konsultasi:\n\nLayanan: ${service}\nPaket: ${currentPackage.label} (${currentPackage.price})\nJadwal: ${formattedDate} pukul ${selectedTime} WIB\n\nMohon konfirmasi ketersediaan jadwal tersebut. Terima kasih.`
  );
  const whatsappUrl = `https://wa.me/6281916243614?text=${whatsappMessage}`;

  const emailMessage = encodeURIComponent(
    service === 'UMKM'
      ? `Halo Dharma Banten,\n\nSaya ingin mengonfirmasi sesi ${currentPackage.title} (Layanan Gratis UMKM Akhir Pekan) pada hari ${formattedDate} pukul ${selectedTime} WIB.\n\nTerima kasih.`
      : `Halo Dharma Banten,\n\nSaya ingin mengonfirmasi sesi ${currentPackage.label} untuk layanan ${service} pada hari ${formattedDate} pukul ${selectedTime} WIB.\n\nTerima kasih.`
  );

  const bookingStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service === 'UMKM' ? 'Klinik UMKM Gratis - Dharma Banten' : `Konsultasi ${service} - Dharma Banten`,
    provider: {
      '@type': 'LegalService',
      name: 'Dharma Banten Konsultan',
      url: 'https://dharmabantenconsultant.com',
    },
    serviceType: 'Konsultasi Profesional Hukum & HR',
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
        title="Jadwal & Reservasi Konsultasi Privat"
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
                  {(['Legal', 'HR', 'Talenta', 'UMKM'] as Service[]).map((tab) => (
                    <button
                      key={tab}
                      role="tab"
                      aria-selected={service === tab}
                      className={`${service === tab ? 'active' : ''} ${tab === 'UMKM' ? 'tab-umkm' : ''}`}
                      onClick={() => setService(tab)}
                    >
                      {tab === 'UMKM' ? 'Klinik UMKM (Gratis)' : tab}
                    </button>
                  ))}
                </div>
                {service === 'UMKM' && (
                  <div className="umkm-service-notice">
                    <span className="umkm-pill">Khusus Pelaku UMKM</span>
                    <p>
                      <strong>Layanan Pro Bono 100% Bebas Biaya:</strong> Didedikasikan untuk mendukung pengusaha mikro, kecil, dan menengah. Sesi konsultasi dilaksanakan <strong>eksklusif pada hari Sabtu &amp; Minggu</strong> secara daring/privat.
                    </p>
                  </div>
                )}
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
                    Layanan terpilih: <b>{service === 'UMKM' ? 'Klinik UMKM (Gratis Akhir Pekan)' : service}</b>
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

                {service === 'UMKM' && (
                  <div className="weekend-only-alert">
                    <div className="alert-badge">Hanya Sabtu &amp; Minggu</div>
                    <p>
                      Sesi pro bono UMKM diadakan <strong>khusus di akhir pekan</strong>. Silakan pilih salah satu jadwal Sabtu atau Minggu terdekat:
                    </p>
                    <div className="weekend-chips-grid">
                      {getUpcomingWeekends(6).map((item) => {
                        const isCurrent = selectedDate === item.dateStr;
                        return (
                          <button
                            key={item.dateStr}
                            type="button"
                            className={`weekend-chip ${isCurrent ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedDate(item.dateStr);
                              setDateError('');
                            }}
                          >
                            <span className="chip-day">{item.dayName}</span>
                            <span className="chip-date">{item.dateNum} {item.monthName}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="scheduler">
                  {/* Bagian Pemilihan Tanggal */}
                  <div className="booking-section-block">
                    <div className="section-title-wrap">
                      <p className="field-label">Pilih Tanggal Konsultasi</p>
                      <span className="field-sublabel">
                        {service === 'UMKM'
                          ? 'Pilih tanggal kalender (Wajib hari Sabtu atau Minggu)'
                          : 'Pilih jadwal yang sesuai dengan agenda Anda melalui kalender'}
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
                            if (service === 'UMKM' && !isWeekend(e.target.value)) {
                              setDateError('Layanan gratis UMKM hanya tersedia pada hari Sabtu dan Minggu.');
                              return;
                            }
                            setDateError('');
                            setSelectedDate(e.target.value);
                          }
                        }}
                        aria-label="Kalender pemilih tanggal konsultasi"
                      />
                    </div>
                    {dateError && (
                      <div className="booking-field-error">
                        ⚠️ {dateError}
                      </div>
                    )}
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
                  <button
                    type="button"
                    className="navy-button"
                    onClick={() => {
                      if (service === 'UMKM' && !isWeekend(selectedDate)) {
                        setDateError('Layanan gratis UMKM hanya tersedia pada hari Sabtu dan Minggu. Silakan pilih hari Sabtu atau Minggu.');
                        return;
                      }
                      setDateError('');
                      setStep(3);
                    }}
                  >
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
                    {service === 'UMKM' ? 'Nama Usaha / Brand UMKM' : 'Perusahaan / Organisasi'}
                    <input
                      id="booking-company-name"
                      required
                      name="company"
                      autoComplete="organization"
                      placeholder={service === 'UMKM' ? 'cth: Kopi Nusantara / Toko Berkah Mandiri' : 'Nama perusahaan / organisasi'}
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
                      placeholder={
                        service === 'UMKM'
                          ? 'Mohon jelaskan secara ringkas bidang usaha UMKM Anda serta persoalan hukum, perizinan (NIB), atau ketenagakerjaan yang ingin dikonsultasikan.'
                          : 'Mohon jelaskan secara ringkas pokok persoalan, latar belakang, atau topik yang ingin dikonsultasikan.'
                      }
                      aria-required="true"
                    />
                  </label>
                </div>
                {service === 'UMKM' && (
                  <div className="umkm-free-badge-note">
                    <span>✓ Layanan Bebas Biaya (100% Pro Bono)</span>
                    <small>Sesi ini dialokasikan khusus untuk pemberdayaan pelaku UMKM pada hari Sabtu &amp; Minggu.</small>
                  </div>
                )}
                <div className="booking-review">
                  <span>{currentPackage.label}</span>
                  <span>{service === 'UMKM' ? 'Klinik UMKM (Gratis)' : service}</span>
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
                    {isSubmitting
                      ? 'Menyimpan ke Strapi...'
                      : service === 'UMKM'
                        ? 'Kirim Permintaan UMKM Gratis'
                        : 'Kirim Permintaan Konsultasi'}{' '}
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
