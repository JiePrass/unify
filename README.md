# Unify

**Unify** adalah platform inovatif yang dirancang untuk menghubungkan individu yang membutuhkan bantuan dengan relawan di sekitar mereka. Dengan sistem gamifikasi seperti misi dan lencana (badges), Unify mendorong kolaborasi komunitas yang positif dan bermakna.

## 🏗️ Arsitektur Proyek

Proyek ini terdiri dari tiga komponen utama:
1.  **Backend**: REST API menggunakan Node.js, Express, dan Prisma ORM.
2.  **Mobile Apps**: Aplikasi mobile lintas platform menggunakan Expo (React Native).
3.  **Website**: Landing page dan dashboard web menggunakan Next.js.

---

## 🚀 Panduan Instalasi

Ikuti langkah-langkah di bawah ini untuk menjalankan Unify di lingkungan pengembangan lokal Anda.

### 📋 Prasyarat
- **Node.js** (v18 atau lebih baru)
- **NPM** atau **PNPM**
- **Git**
- **Sistem Database** (PostgreSQL)

### 1. Kloning Repositori
```bash
git clone https://github.com/JiePrass/unify.git
cd unify
```

### 2. Setup Backend
Masuk ke direktori backend dan instal dependensi.
```bash
cd backend
npm install
```

#### Konfigurasi Environment
Salin file `.env.sample` menjadi `.env` dan lengkapi variabel yang dibutuhkan (Database URL, JWT Secret, dll).
```bash
cp .env.sample .env
```

#### Setup Database (Prisma)
Jalankan migrasi database dan generate Prisma client.
```bash
npx prisma db push
npx prisma generate
```

#### Jalankan Backend
```bash
npm run dev
```
Backend akan berjalan di `http://localhost:3000` (atau port sesuai `.env`).

---

### 3. Setup Mobile Apps
Masuk ke direktori mobile-apps dan instal dependensi.
```bash
cd ../mobile-apps
npm install
```

#### Konfigurasi Environment
Salin file `.env.sample` menjadi `.env`.
```bash
cp .env.sample .env
```
Sesuaikan `EXPO_PUBLIC_API_BASE_URL` dengan alamat IP backend Anda (gunakan alamat IP lokal jika testing di perangkat fisik).

#### Jalankan Mobile Apps
```bash
npx expo start
```
Gunakan **Expo Go** di Android/iOS atau jalankan emulator untuk melihat aplikasi.

---

### 4. Setup Website
Masuk ke direktori website dan instal dependensi.
```bash
cd ../website
npm install
```

#### Jalankan Website
```bash
npm run dev
```
Website akan tersedia di `http://localhost:3001` (atau port default Next.js).

---

## ✨ Fitur Utama
- **Sistem Bantuan Real-time**: Meminta dan memberikan bantuan dengan pelacakan status.
- **Gamifikasi**: Selesaikan misi untuk mendapatkan poin dan lencana unik.
- **Notifikasi Terintegrasi**: Update otomatis untuk setiap aktivitas bantuan dan pesan baru.
- **Chat**: Komunikasi langsung antara peminta bantuan dan relawan.
- **Reputasi**: Sistem skor berdasarkan kualitas kontribusi relawan.

## 🛠️ Tech Stack
- **Frontend App**: React Native (Expo), TypeScript
- **Frontend Web**: Next.js, Tailwind CSS, Shadcn UI.
- **Backend**: Node.js, Express, Prisma, Socket.io.
- **Database**: PostgreSQL

---

Dibuat dengan ❤️ oleh **Renjie Syarbaini Prasetya**.
