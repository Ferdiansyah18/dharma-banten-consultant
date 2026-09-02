require('dotenv').config();

console.error('>>> [DIAGNOSTIC] 1. server.js mulai dieksekusi:', new Date().toISOString());
console.error('>>> [DIAGNOSTIC] 2. Node Version:', process.version);
console.error('>>> [DIAGNOSTIC] 3. DATABASE_CLIENT:', process.env.DATABASE_CLIENT);
console.error('>>> [DIAGNOSTIC] 4. DATABASE_HOST:', process.env.DATABASE_HOST);
console.error('>>> [DIAGNOSTIC] 5. DATABASE_NAME:', process.env.DATABASE_NAME);

const strapi = require('@strapi/strapi');
const path = require('path');

const appDir = __dirname;
const distDir = path.join(__dirname, 'dist');

async function start() {
  console.error('>>> [DIAGNOSTIC] 6. Memanggil createStrapi...');
  const app = strapi.createStrapi({ appDir, distDir });

  console.error('>>> [DIAGNOSTIC] 7. Menjalankan app.load()...');
  await app.load();

  console.error('>>> [DIAGNOSTIC] 8. app.load() SELESAI, memanggil app.listen()...');
  await app.listen();

  console.error('>>> [DIAGNOSTIC] 9. Strapi BERHASIL start & melayani request!');
}

start().catch((err) => {
  console.error('>>> [DIAGNOSTIC] GAGAL dengan error:', err);
  process.exit(1);
});
