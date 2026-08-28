import { FormEvent, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { calendarDays, packages, timeSlots } from '../data/content';
import { PackageId, Service } from '../types';
import { Arrow, BackArrow, WhatsAppIcon } from './icons/Icons';
import { Brand } from './ui/Brand';
import { submitConsultationBooking } from '../services/strapi';

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
  const [selectedDate, setSelectedDate] = useState('18');
  const [selectedTime, setSelectedTime] = useState('10:30');
  const [submitted, setSubmitted] = useState(false);
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

  const selectedDay = calendarDays.find((d) => d.date === selectedDate) || calendarDays[0];

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
      bookingDate: `${selectedDay.day}, 18 Juni 2026`,
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
    `Halo Dharma Banten, saya ingin memesan jadwal konsultasi:\n\nLayanan: ${service}\nPaket: ${currentPackage.label} (${currentPackage.price})\nJadwal: ${selectedDay.day}, 18 Juni 2026 pukul ${selectedTime} WIB\n\nMohon konfirmasi ketersediaan jadwal tersebut. Terima kasih.`
  );
  const whatsappUrl = `https://wa.me/6281234567890?text=${whatsappMessage}`;

  const emailMessage = encodeURIComponent(
    `Halo Dharma Banten,\n\nSaya ingin mengonfirmasi sesi ${currentPackage.label} untuk layanan ${service} pada hari ${selectedDay.day}, 18 Juni 2026 pukul ${selectedTime} WIB.\n\nTerima kasih.`
  );

  return (
    <motion.div
      className="booking-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <header className="booking-header">
        <Brand onClick={onHome} />
        <button className="back-home" onClick={onHome}>
          <BackArrow size={14} /> Kembali ke Beranda
        </button>
      </header>
      <main className="booking-main">
        <aside className="booking-aside">
          <p className="booking-eyebrow">Konsultasi Privat</p>
          <h1>Luangkan waktu untuk keputusan yang lebih jernih.</h1>
          <p>
            Pilih layanan dan format konsultasi yang paling sesuai dengan kebutuhan Anda. Permintaan
            Anda akan ditinjau oleh tim kami dalam 1 hari kerja.
          </p>
          <div className="booking-contact">
            <span>Ingin berdiskusi langsung?</span>
            <a href="mailto:hello@dharmabanten.co.id">hello@dharmabanten.co.id</a>
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
                <span className="confirmation-mark">DB</span>
                <p className="booking-eyebrow">Permintaan Diterima</p>
                <h2>Jadwal konsultasi Anda siap dikonfirmasi.</h2>
                <p>
                  Kami telah mencatat rencana konsultasi {service} Anda pada hari {selectedDay.day},
                  18 Juni pukul {selectedTime} WIB. Kirim konfirmasi cepat melalui WhatsApp atau
                  email, atau nantikan respon dari tim kami dalam 1 hari kerja.
                </p>
                <div className="confirmation-summary">
                  <span>{currentPackage.label}</span>
                  <span>{selectedDay.day}, 18 Juni 2026</span>
                  <span>{selectedTime} WIB</span>
                </div>
                <div className="confirmation-actions">
                  <a
                    className="navy-button"
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Lanjut ke WhatsApp <WhatsAppIcon />
                  </a>
                  <a
                    className="underlined-action"
                    href={`mailto:hello@dharmabanten.co.id?subject=Konfirmasi%20Jadwal%20Konsultasi&body=${emailMessage}`}
                  >
                    Kirim Ringkasan Email <Arrow />
                  </a>
                  <button className="underlined-action" onClick={onHome}>
                    Kembali ke Halaman Utama <Arrow />
                  </button>
                </div>
              </motion.div>
            ) : step === 1 ? (
              <motion.div
                key="scope"
                className="booking-step"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
              >
                <p className="booking-eyebrow">Langkah 01</p>
                <h2>Bidang konsultasi apa yang Anda butuhkan?</h2>
                <div className="service-filter" role="tablist" aria-label="Pilih bidang layanan">
                  {(['Talenta', 'HR', 'Legal'] as Service[]).map((item) => (
                    <button
                      key={item}
                      onClick={() => setService(item)}
                      className={service === item ? 'active' : ''}
                      role="tab"
                      aria-selected={service === item}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <div className="package-options">
                  {shownPackages.map((item) => (
                    <motion.button
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.2 }}
                      className={`package-card ${selectedPackage === item.id ? 'selected' : ''}`}
                      key={item.id}
                      onClick={() => setSelectedPackage(item.id)}
                    >
                      <span className="selection-dot" />
                      <span className="package-card-top">
                        <small>{item.label}</small>
                        <strong>{item.title}</strong>
                      </span>
                      <span className="package-card-copy">{item.description}</span>
                      <span className="package-card-price">{item.price}</span>
                    </motion.button>
                  ))}
                </div>
                <div className="step-actions">
                  <span>
                    Layanan terpilih: <b>{service}</b>
                  </span>
                  <button className="navy-button" onClick={() => setStep(2)}>
                    Pilih Waktu Konsultasi <Arrow />
                  </button>
                </div>
              </motion.div>
            ) : step === 2 ? (
              <motion.div
                key="schedule"
                className="booking-step"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
              >
                <p className="booking-eyebrow">Langkah 02</p>
                <h2>Tentukan waktu yang sesuai.</h2>
                <div className="scheduler">
                  <div>
                    <p className="field-label">
                      Pilihan Hari <span>Juni 2026</span>
                    </p>
                    <div className="booking-dates">
                      {calendarDays.map((item) => (
                        <button
                          key={item.date}
                          className={selectedDate === item.date ? 'selected' : ''}
                          onClick={() => setSelectedDate(item.date)}
                        >
                          <small>{item.day}</small>
                          <strong>{item.date}</strong>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="field-label">
                      Waktu Tersedia <span>WIB</span>
                    </p>
                    <div className="time-slots">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          className={selectedTime === time ? 'selected' : ''}
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="step-actions">
                  <button className="underlined-action" onClick={() => setStep(1)}>
                    Kembali ke Pilihan Layanan
                  </button>
                  <button className="navy-button" onClick={() => setStep(3)}>
                    Lanjutkan <Arrow />
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
              >
                <p className="booking-eyebrow">Langkah 03</p>
                <h2>Lengkapi informasi kebutuhan Anda.</h2>
                <div className="form-grid">
                  <label>
                    Nama Lengkap
                    <input required name="name" placeholder="Nama lengkap Anda" />
                  </label>
                  <label>
                    Perusahaan / Organisasi
                    <input required name="company" placeholder="Nama perusahaan / organisasi" />
                  </label>
                  <label>
                    Email Kerja
                    <input required type="email" name="email" placeholder="nama@perusahaan.com" />
                  </label>
                  <label>
                    Nomor WhatsApp
                    <input required type="tel" name="phone" placeholder="+62 812 ..." />
                  </label>
                  <label className="full-width">
                    Deskripsi Singkat Kebutuhan / Kasus
                    <textarea
                      required
                      name="description"
                      rows={4}
                      placeholder="Mohon jelaskan secara ringkas pokok persoalan, latar belakang, atau topik yang ingin dikonsultasikan."
                    />
                  </label>
                </div>
                <div className="booking-review">
                  <span>{currentPackage.label}</span>
                  <span>{service}</span>
                  <span>
                    {selectedDay.day}, 18 Juni, {selectedTime} WIB
                  </span>
                </div>
                <div className="step-actions">
                  <button type="button" className="underlined-action" onClick={() => setStep(2)} disabled={isSubmitting}>
                    Kembali ke Jadwal
                  </button>
                  <button type="submit" className="navy-button" disabled={isSubmitting}>
                    {isSubmitting ? 'Menyimpan ke Strapi...' : 'Kirim Permintaan Konsultasi'} {!isSubmitting && <Arrow />}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </section>
      </main>
      <footer className="booking-footer">
        <span>Dharma Banten Konsultan</span>
        <span>Permintaan Konsultasi Rahasia &amp; Terlindungi</span>
      </footer>
    </motion.div>
  );
}
