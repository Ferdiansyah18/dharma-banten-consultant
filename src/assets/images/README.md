# Folder Gambar Sumber (Source Assets)

Folder ini digunakan jika Anda ingin mengimpor gambar langsung ke dalam komponen React dengan bundling Vite.

### Cara Penggunaan:
```tsx
import logo from '../assets/images/logo.png';

export function Header() {
  return <img src={logo} alt="Logo" />;
}
```
