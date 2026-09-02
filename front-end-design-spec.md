# Front-End Design Specification: Dharma Banten Konsultan

> **Status:** `Approved`
> **Last Revised:** 2026-09-03
> **Revision Count:** 1

---

## 1. Brand Mental Model & Differentiation Moat *(The Anchor)*

- **Brand Personality**: *Bespoke, authoritative, serene, precise, high-touch.*
- **Emotional Truth**: Ketenangan dan kepastian hukum — *"Urusan hukum ketenagakerjaan dan organisasi Anda berada di tangan penasihat paling kompeten dan terpercaya."*
- **Brand Moat**: Presisi interaksi micro-tactile, tipografi editorial klasik dipadu modernitas minimalis, serta alur konsultasi privat tanpa gesekan (*frictionless scheduling*).
- **2nd/3rd Idea Commitment**: Menghindari elemen form generic/kaku bawaan browser. Menggantikan native date input yang pasif menjadi kombinasi *interactive date strip buttons* (kartu tanggal cepat dengan status aktif yang jelas) dan *bespoke calendar trigger card* dengan ikon kalender beraksen emas dan klik langsung.
- **Visual Anti-Patterns**: 
  - ❌ Komponen form bertumpuk sesak tanpa ruang bernapas (*cramped layouts*).
  - ❌ Input kalender native yang tidak memiliki visual affordance (tidak terlihat bisa diklik).
  - ❌ Tombol slot waktu yang kecil dan saling menempel rapat.
  - ❌ Dropdown generic atau form monolitik membosankan.

---

## 2. Brand Material & Surface Feel Signature *(Serves the Moat)*

- **Inferred Brand Texture**: Deep Slate Navy (`#0B0C0E` / `#0F172A`) dengan kontras aksen emas kencana (*Regal Gold* `#C59B27` / `#D4A017`) dan permukaan kartu *Off-White Ivory* (`#FFFFFF` dengan border halus `#E2E8F0`).
- **Surface Material Effects**: Hairline border dengan transisi hover ber-elevasi halus (`translateY(-2px)` + soft gold shadow glow), micro-spring physics untuk interaksi klik kartu tanggal dan jam.
- **Sensory & Tactile Physics**:
  - Kartu tanggal dan jam memberikan feedback visual seketika saat di-hover dan dipilih.
  - Pilihan aktif ditandai dengan latar navy solid, teks kontras tinggi, dan indikator titik/aksen emas.

---

## 3. Calculated Spatial Pacing & Information Flow Control *(Serves the Moat)*

- **Spatial Rhythm**:
  - Mengubah jarak antar komponen booking dari yang sebelumnya padat/sesak menjadi ritme lapang:
    - Jarak antar seksi (*Scheduler gap*): `3.2rem` (naik dari 2.7rem).
    - Jarak grid pilihan waktu (*Time Slots gap*): `0.85rem` (naik dari 0.55rem).
    - Padding tombol waktu: `1.05rem 0.75rem` dengan border-radius `0.5rem`.
    - Spacing judul dan deskripsi (*Heading line-height*): dinaikkan dari `0.96` menjadi `1.18` dengan `max-width: 18ch` agar tidak bertumpuk sesak.
    - Spacing aksi tombol (*Step Actions*): `margin-top: 3.5rem; padding-top: 1.75rem; border-top: 1px solid #E2E8F0`.
- **Focal Isolation Strategy**:
  - Satu fokus visual per langkah: Pada Langkah 2, pengguna dipandu secara hierarkis: (1) Kartu Tanggal Utama, (2) Pilihan Waktu WIB, (3) Preview Jadwal Terpilih yang menonjol.
- **Cognitive Assimilation Controls**:
  - Grouping jelas antara pemilihan tanggal cepat (*Upcoming Business Days*) dan pemilihan tanggal kustom melalui kalender.

---

## 4. Opinionated Typography & Token Palette *(Serves the Moat)*

- **Display Font**: Editorial Serif (Playfair / Georgia / Times New Roman) untuk judul langkah dan headline nilai prestise.
- **Body & UI Font**: Inter / Plus Jakarta Sans dengan tracking terukur dan kerning presisi.
- **Color Tokens**:
  - Background Utama: `#F8FAFC`
  - Deep Navy Surface: `#0B0C0E` / `#0F172A`
  - Accent Gold: `#C59B27` / `#D4A017`
  - Border Hairline: `#E2E8F0` / `#CBD5E1`
  - Text Muted: `#64748B` / `#475569`
  - Focus Ring: `rgba(197, 155, 39, 0.25)`

---

## 5. Technical Front-End Extensions *(Moat via Micro-Interactions)*

- Menggunakan ref native `HTMLInputElement.showPicker()` pada kartu kalender kustom untuk memicu popup kalender secara instan saat pengguna mengklik kartu atau tombol kalender.
- Transisi status tanggal dan waktu menggunakan motion spring lembut dengan penghormatan `prefers-reduced-motion`.

---

## 6. Form-Function Equilibrium & UX 101 Contract *(The Non-Negotiable Boundary)*

- **Accessibility**: 
  - Kontras teks memenuhi WCAG AA / AAA (Navy `#0F172A` di atas putih `#FFFFFF`, Emas gelap `#B3881E` untuk teks aksen).
  - Navigasi keyboard penuh (`role="radiogroup"`, `role="radio"`, `aria-checked`, `aria-label`, `tabIndex={0}`).
  - State aktif dan focus ring terlihat jelas (`:focus-visible`).
- **Readability & Affordance**:
  - Komponen pemilihan tanggal secara eksplisit terlihat sebagai elemen interaktif (*click affordance* kuat berupa kartu dengan ikon kalender, tag "Pilih", hover lift, dan kursor pointer).
  - Teks instruksi jelas dan tidak membingungkan.

---

## 7. Top-Fold & Component Impression Plan

- **Interactive Date Component**: Pengguna langsung mengenali tanggal yang bisa diklik lewat deretan kartu hari & tanggal (*Interactive Date Carousel/Grid*) serta tombol kartu kalender elegan.
- **Visual Breathing Room**: Layout terasa eksklusif, luas, tenang, dan tidak terburu-buru (*unrushed, authoritative consultation experience*).

---

## Revision History

- 2026-09-03 — Status: `Approved` (Penyempurnaan interaktivitas pemilihan tanggal & pelapangan ruang antar elemen sesuai arahan).
- 2026-09-03 — Status: `Approved` (Penyederhanaan UI: menghapus deretan tanggal atas, menetapkan kartu interaktif tunggal dengan judul 'Pilih Tanggal' sebagai komponen pemilih utama).
