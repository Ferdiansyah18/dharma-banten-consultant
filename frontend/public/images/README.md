# Folder Gambar Publik (Static Assets)

Folder ini digunakan untuk menyimpan aset statis seperti favicon dan ikon/logo perusahaan.

### Struktur yang Disarankan:
- `favicon.ico` atau `favicon.png` : Ikon tab browser (favicon)
- `logo.png` / `logo.svg` : Logo perusahaan
- `icon.png` / `icon.svg` : Ikon aplikasi/perusahaan

### Cara Penggunaan:
1. **Di `index.html`**:
   ```html
   <link rel="icon" type="image/png" href="/images/favicon.png" />
   ```

2. **Di Komponen React (JSX/TSX)**:
   ```tsx
   <img src="/images/logo.png" alt="Logo Dharma Banten" />
   ```
