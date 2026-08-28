import { CalendarDay, Package, ServicePillar } from '../types';

export const heroImages = [
  'https://images.pexels.com/photos/5668790/pexels-photo-5668790.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1600&w=2400',
  'https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1600&w=2400',
  'https://images.pexels.com/photos/5669602/pexels-photo-5669602.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1600&w=2400',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2400&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2400&q=80',
  'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=2400&q=80',
];

export const heroImage = heroImages[0];

export const pillars: ServicePillar[] = [
  {
    id: 'Talenta',
    number: '01',
    title: 'Dharma Banten Talenta',
    descriptor: 'Kepemimpinan dan kapabilitas SDM',
    description:
      'Pelatihan dan pendampingan yang mengubah arah strategis menjadi kepemimpinan yang cakap dan percaya diri di setiap tingkatan organisasi.',
    points: ['Pengembangan kepemimpinan', 'Kapabilitas manajerial', 'Budaya & kinerja organisasi'],
  },
  {
    id: 'HR',
    number: '02',
    title: 'Dharma Banten HR',
    descriptor: 'Tata kelola tenaga kerja yang kokoh',
    description:
      'Fondasi HR praktis yang melindungi organisasi dan memberikan ritme operasional SDM yang stabil, tertib, dan teratur.',
    points: ['Rekrutmen & kontrak kerja', 'Struktur penggajian & kebijakan', 'Hubungan industrial & kepatuhan'],
  },
  {
    id: 'Legal',
    number: '03',
    title: 'Dharma Banten Legal',
    descriptor: 'Kejelasan hukum di setiap keputusan krusial',
    description:
      'Konsultasi hukum ketenagakerjaan, perizinan bisnis, dan penyelesaian perselisihan dengan pertimbangan komersial yang matang.',
    points: ['Hukum ketenagakerjaan', 'Perizinan usaha & kepatuhan', 'Mediasi & litigasi PHI'],
  },
];

export const packages: Package[] = [
  {
    id: 'talenta-consultation',
    service: 'Talenta',
    label: 'Konsultasi Sekali Sesi',
    title: 'Perspektif Kepemimpinan',
    price: 'Mulai Rp 2.500.000',
    description: 'Sesi fokus untuk membedah tantangan kepemimpinan atau kapabilitas manajerial mendesak.',
    included: ['Sesi konsultasi 90 menit', 'Review konteks & dinamika awal', 'Ringkasan rekomendasi tertulis'],
  },
  {
    id: 'talenta-retainer',
    service: 'Talenta',
    label: 'Retainer Bulanan',
    title: 'Mitra Kapabilitas',
    price: 'Sesuai lingkup bulanan',
    description: 'Pendampingan berkelanjutan bagi pengembangan kepemimpinan dan talenta organisasi yang sedang bertumbuh.',
    included: [
      'Akses prioritas penasihat',
      'Evaluasi kepemimpinan bulanan',
      'Panduan roadmap pelatihan',
    ],
  },
  {
    id: 'talenta-enterprise',
    service: 'Talenta',
    label: 'Enterprise Khusus',
    title: 'Program Transformasi',
    price: 'Berdasarkan proposal',
    description: 'Program pengembangan komprehensif yang dirancang khusus untuk transformasi skala organisasi.',
    included: [
      'Desain ruang lingkup & discovery',
      'Tim proyek berdedikasi',
      'Laporan progres eksekutif',
    ],
  },
  {
    id: 'hr-consultation',
    service: 'HR',
    label: 'Konsultasi Sekali Sesi',
    title: 'Perspektif Tenaga Kerja',
    price: 'Mulai Rp 2.500.000',
    description:
      'Saran praktis untuk mengatasi isu mendesak seputar HR, kebijakan, kontrak, atau relasi karyawan.',
    included: ['Sesi konsultasi 90 menit', 'Review dokumen & kontrak awal', 'Ringkasan langkah tindak lanjut tertulis'],
  },
  {
    id: 'hr-retainer',
    service: 'HR',
    label: 'Retainer Bulanan',
    title: 'Penasihat Berkelanjutan',
    price: 'Sesuai lingkup bulanan',
    description:
      'Kemitraan penasihat yang andal dan responsif bagi manajemen puncak dalam tata kelola SDM.',
    included: [
      'Akses konsultasi prioritas',
      'Review kepatuhan terjadwal',
      'Dukungan hubungan industrial',
    ],
  },
  {
    id: 'hr-enterprise',
    service: 'HR',
    label: 'Enterprise Khusus',
    title: 'Proyek Manajemen SDM',
    price: 'Berdasarkan proposal',
    description: 'Mandat khusus untuk restrukturisasi HR, penyusunan Peraturan Perusahaan (PP), atau hubungan industrial.',
    included: [
      'Desain discovery & ruang lingkup',
      'Tim konsultan berdedikasi',
      'Laporan progres eksekutif',
    ],
  },
  {
    id: 'legal-consultation',
    service: 'Legal',
    label: 'Konsultasi Sekali Sesi',
    title: 'Konsultasi Terfokus',
    price: 'Mulai Rp 2.500.000',
    description: 'Sesi kerja terarah untuk membedah keputusan hukum atau ketenagakerjaan yang mendesak.',
    included: ['Sesi konsultasi 90 menit', 'Review dokumen legalitas awal', 'Ringkasan langkah tindak lanjut tertulis'],
  },
  {
    id: 'legal-retainer',
    service: 'Legal',
    label: 'Retainer Bulanan',
    title: 'Mitra Hukum Terpadu',
    price: 'Sesuai lingkup bulanan',
    description: 'Penasihat hukum ketenagakerjaan dan korporasi yang responsif untuk mendukung keputusan jajaran direksi.',
    included: ['Akses konsultasi prioritas', 'Tinjauan hukum berkala', 'Dukungan pembaruan regulasi'],
  },
  {
    id: 'legal-enterprise',
    service: 'Legal',
    label: 'Enterprise Khusus',
    title: 'Proyek Hukum Strategis',
    price: 'Berdasarkan proposal',
    description: 'Mandat khusus untuk perizinan usaha, audit kepatuhan korporasi, atau mitigasi kesiapan sengketa.',
    included: [
      'Desain discovery & ruang lingkup',
      'Tim konsultan berdedikasi',
      'Laporan progres eksekutif',
    ],
  },
];

export const calendarDays: CalendarDay[] = [
  { day: 'Sel', date: '16' },
  { day: 'Rab', date: '17' },
  { day: 'Kam', date: '18' },
  { day: 'Jum', date: '19' },
  { day: 'Sen', date: '22' },
  { day: 'Sel', date: '23' },
  { day: 'Rab', date: '24' },
  { day: 'Kam', date: '25' },
];

export const timeSlots: string[] = ['09:00', '10:30', '13:30', '15:00'];
