# Backend Architecture Specification: Dharma Banten Consultation Notification System

> **Status:** `Approved`
> **Last Revised:** 2026-09-07
> **Revision Count:** 2
> **Source Citations:** All tech claims in this spec are verified against current sources (date, URL) — see § "Research Log" below.

---

## 1. System Overview & Core Data Flow

- **System Purpose (the WHY):** 
  Menyediakan saluran penerimaan (*intake*) jadwal reservasi konsultasi hukum dan manajemen organisasi yang andal, aman, dan tanpa hambatan, serta mendistribusikan notifikasi *real-time* ke kotak masuk tim internal konsultan (`info@dharmabantenconsultant.com`) tanpa membebani kecepatan respons bagi calon klien di situs web.
  
- **Core Data Entities (the WHAT):**
  - **Consultation (`api::consultation.consultation`):**
    - `name` (String, required): Nama lengkap calon klien / PIC.
    - `company` (String, required): Nama institusi / perusahaan klien.
    - `email` (Email, required): Alamat korespondensi klien.
    - `phone` (String, required): Nomor telepon / WhatsApp klien.
    - `service` (String): Bidang layanan yang dipilih.
    - `packageName` (String): Nama paket konsultasi (misal: *Legal Consultation*).
    - `packagePrice` (String): Estimasi biaya atau keterangan harga paket.
    - `bookingDate` (String): Tanggal sesi konsultasi yang diajukan.
    - `bookingTime` (String): Slot jam konsultasi (WIB).
    - `description` (Text, required): Ringkasan permasalahan hukum / kebutuhan klien.
    - `status` (Enum: `Baru` | `Dikonfirmasi` | `Selesai` | `Dibatalkan`): Status penanganan internal.

- **Data Flow Summary (the HOW):**
  1. **Intake:** Klien mengisi dan mengirimkan formulir reservasi pada antarmuka frontend; request dikirim via `POST /api/consultations`.
  2. **Validation & Persistence:** Strapi 5 Content API / Document Service memvalidasi seluruh field wajib dan menyimpan entitas ke database dengan status default `Baru`.
  3. **Immediate HTTP Acknowledgment:** Strapi mengembalikan respons `201 Created` ke frontend secara seketika (< 250ms) sehingga calon klien mendapatkan umpan balik konfirmasi langsung di layar.
  4. **Decoupled Notification Dispatch:** Di latar belakang (*asynchronous*), Strapi Document Service Middleware / Service memicu modul email provider (`@strapi/provider-email-nodemailer`).
  5. **SMTP Transmission:** Email notifikasi dengan format HTML editorial resmi dikirim ke `info@dharmabantenconsultant.com` menggunakan relay cPanel SMTP (`mail.dharmabantenconsultant.com` melalui SSL/TLS aman).
  6. **Resilient Error Logging:** Jika terjadi kendala jaringan atau *timeout* pada relay SMTP cPanel, kegagalan ditangkap (*catch*) dan dicatat secara komprehensif di server logger Strapi (`strapi.log.error`) tanpa membatalkan atau merusak data reservasi yang telah tersimpan.

---

## 2. "What It IS vs. What It IS NOT" Matrix

| System Principle (IS) | Banned Behavior (IS NOT) |
| :--- | :--- |
| **1. Database-First Persistence Guarantee:** Data reservasi klien WAJIB tersimpan valid di database Strapi sebelum notifikasi email di-dispatch. | **1. No Coupled Failure:** Sistem DILARANG menggagalkan pembuatan reservasi atau menampilkan pesan *error* kepada klien di website hanya karena server SMTP luar lambat atau tidak merespons. |
| **2. Asynchronous Non-blocking Execution:** Proses pengiriman email WAJIB berjalan secara asinkron di luar siklus respons HTTP pengguna. | **2. No Synchronous Awaiting on Request Path:** Sistem DILARANG menahan respons HTTP pengguna selama proses koneksi dan jabat tangan (*handshake*) SMTP berlangsung. |
| **3. Strict Environment Secret Isolation:** Seluruh konfigurasi SMTP (Host, Port, User, Password, Recipient) WAJIB dimuat dari *environment variables* (`.env`). | **3. No Hardcoded Secrets:** Sistem DILARANG menanam kredensial akun cPanel, password email, atau port hardcoded di dalam repositori kode. |
| **4. Structured Resilient Logging:** Kegagalan pengiriman email WAJIB dicatat dengan *log context* (ID reservasi, waktu, dan jenis error) untuk kebutuhan audit internal. | **4. No Error Leaks to Client:** Sistem DILARANG mengekspos detail kegagalan teknis SMTP atau jejak *stack trace* ke respons publik API frontend. |
| **5. HTML Sanitization:** Seluruh input dari calon klien WAJIB di-escape sebelum dimasukkan ke dalam template email notifikasi. | **5. No Raw Input Injection:** Sistem DILARANG memasukkan teks mentah langsung ke dalam badan email HTML guna mencegah *HTML/Header injection*. |

---

## 3. Communication & Reliability Expectations

- **Response Speed Target:**
  - `POST /api/consultations`: p95 < 250ms (dicapai karena proses pengiriman email dieksekusi secara asinkron/non-blocking).
- **Uptime Target:**
  - 99.9% ketersediaan API intake reservasi.
- **Failure Recovery Plan:**
  - **RTO (Recovery Time Objective):** < 15 menit untuk konfigurasi ulang SMTP jika terjadi pergantian kredensial atau server cPanel.
  - **RPO (Recovery Point Objective):** 0 detik (tidak ada data reservasi yang hilang karena kegagalan email, sebab database menyimpan transaksi sebelum email dikirim).
  - **Operational Fallback:** Tim konsultan memiliki akses langsung ke Strapi Admin Panel (`/admin`) sebagai *Single Source of Truth* untuk memantau seluruh reservasi berstatus `Baru`, sehingga operasional kantor tidak bergantung 100% pada keterbacaan email.

---

## 4. Backend Moat & System Strengths

- **Core Technical Signature:**
  *Zero-Loss Client Intake with Decoupled Notification Engine* — Arsitektur reservasi dua lapis (*two-tier intake*) yang memisahkan integritas data konsultasi hukum privat dari fluktuasi relay komunikasi pihak ketiga.
- **Why it's uncopyable in a quarter:**
  Bagi firma hukum dan konsultan manajemen strategis seperti Dharma Banten, kepercayaan klien dimulai sejak detik pertama kontak. Banyak implementasi standar membuat kesalahan dengan menautkan pengiriman email secara sinkron atau bergantung pada layanan pihak ketiga tanpa *fallback*. Sistem ini menjamin data calon klien tertampung secara persisten, terproteksi dari *leakage*, dan siap diintegrasikan dengan alur kerja internal konsultan tanpa risiko *lost lead* akibat *downtime* mail server hosting.
- **Compound advantage over time:**
  Database konsultasi menjadi aset data terpusat (*centralized knowledge base*) yang bersih, terstruktur, dan patuh pada tata kelola privasi data. Pola kebutuhan hukum perusahaan di wilayah Banten dapat dianalisis untuk pengembangan portofolio layanan firma secara berkelanjutan.

---

## 5. Security & Data Integrity

- **Access Control Rules:**
  - Endpoint `POST /api/consultations` dibuka secara terproteksi untuk publik (*Public role* hanya diizinkan aksi `create`).
  - Aksi `find`, `findOne`, `update`, dan `delete` hanya diizinkan untuk peran terotentikasi (*Authenticated / Admin Strapi*) guna menjaga kerahasiaan data seluruh klien.
- **Data Persistence Rules:**
  - Penyimpanan dilakukan melalui transaksi database Strapi yang menjamin integritas ACID.
  - Nilai status reservasi selalu diawali dengan `Baru` dan hanya dapat diubah oleh staf/admin melalui panel Strapi.
- **Privacy Boundaries:**
  - Koneksi ke cPanel SMTP wajib menggunakan enkripsi TLS/SSL (Port 465 dengan SSL atau Port 587 dengan STARTTLS).
  - Data kontak dan deskripsi masalah hukum klien tidak pernah dicatat ke dalam log publik atau query parameter URL.
  - Password email dan kredensial cPanel disimpan secara eksklusif dalam berkas `.env` server.

---

## 6. Implementation Technical Architecture

### Component Diagram

```
[ Frontend Client ]
       │
       ▼ (1) POST /api/consultations (JSON)
[ Strapi 5 Content API / Controller ]
       │
       ▼ (2) Validate & Persist
[ Database (consultations table) ] ── (3) Return 201 Created ──► [ Frontend (Success UI) ]
       │
       ▼ (4) Trigger Async Notification (Non-blocking)
[ Document Service Middleware / Consultation Service ]
       │
       ▼ (5) Nodemailer Transport (Port 465/587 SSL/TLS)
[ cPanel SMTP Relay (mail.dharmabantenconsultant.com) ]
       │
       ▼ (6) Deliver Internal Alert
[ Inbox: info@dharmabantenconsultant.com ]
```

### Environment Configuration Schema (`backend/.env`)

```ini
# SMTP Configuration (cPanel Webmail)
SMTP_HOST=mail.dharmabantenconsultant.com
SMTP_PORT=465
SMTP_USERNAME=info@dharmabantenconsultant.com
SMTP_PASSWORD=your_cpanel_email_password
SMTP_SECURE=true

# Notification Settings
NOTIFICATION_RECIPIENT_EMAIL=info@dharmabantenconsultant.com
NOTIFICATION_SENDER_EMAIL="Dharma Banten System" <info@dharmabantenconsultant.com>
```

---

## Research Log

> Verifikasi klaim teknis dan rujukan dokumentasi:

- **2026-09-07** — *Strapi 5 Official Nodemailer Provider:* Provider resmi `@strapi/provider-email-nodemailer` merupakan solusi standar untuk integrasi SMTP custom (seperti cPanel Webmail) pada Strapi 5 ([Strapi Documentation: Email Plugin](https://docs.strapi.io/dev-docs/plugins/email#nodemailer)).
- **2026-09-07** — *Strapi 5 Document Service & Event Interception:* Rekomendasi resmi Strapi 5 mengutamakan *Document Service Middleware* (`strapi.documents.use`) atau kustomisasi *Core Service* dibandingkan *legacy database lifecycles* untuk menangani *post-action triggers* secara konsisten dan aman dari duplikasi event ([Strapi Documentation: Document Service](https://docs.strapi.io/dev-docs/backend-customization/document-service)).

---

## Revision History

- **2026-09-07** — Status: `Draft` (Penyusunan arsitektur awal berdasarkan kebutuhan notifikasi reservasi cPanel SMTP non-blocking).
- **2026-09-07** — Status: `Approved` (Persetujuan pengguna terhadap spesifikasi arsitektur teknis dan panduan konfigurasi SMTP cPanel).
