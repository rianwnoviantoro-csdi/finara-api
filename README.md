# Finara API

RESTful API untuk aplikasi manajemen keuangan pribadi, dibangun dengan **NestJS**, **Drizzle ORM**, dan **PostgreSQL**.

## Tentang Finara

Finara adalah aplikasi pencatatan keuangan pribadi yang membantu pengguna memantau pemasukan dan pengeluaran secara mudah dan terstruktur.

### Fitur Utama

**Autentikasi**
- Registrasi akun dengan nama, email, dan password
- Login dengan JWT (access token + refresh token)
- Lihat profil akun

**Kategori**
- Kelola kategori transaksi sendiri (income / expense)
- Contoh: Makan, Transport, Belanja, Gaji, Bonus

**Transaksi**
- Catat pemasukan dan pengeluaran harian
- Isi tipe, nominal, kategori, tanggal, dan catatan
- Lihat riwayat dengan pagination dan filter bulan
- Edit dan hapus transaksi

**Laporan**
- Ringkasan keuangan bulanan: total pemasukan, pengeluaran, dan saldo
- Statistik pengeluaran per kategori (pie chart / bar)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS (Node.js / TypeScript) |
| ORM | Drizzle ORM |
| Database | PostgreSQL 16 |
| Validation | Zod + class-validator |
| Auth | JWT (access + refresh tokens) + bcrypt |
| Containerization | Docker + Docker Compose |
| Code Quality | ESLint, Prettier, Husky, lint-staged |

---

## Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [Yarn](https://yarnpkg.com/) >= 1.22
- [Docker](https://www.docker.com/) + Docker Compose

---

## Quick Start

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd finara-api
yarn install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` (defaults work langsung dengan Docker Compose):

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/finara_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRES_IN=7d
```

### 3. Jalankan Database

```bash
docker-compose up postgres -d
```

### 4. Jalankan Migrasi

```bash
yarn db:generate
yarn db:migrate
```

### 5. Jalankan Aplikasi

```bash
yarn start:dev
```

API tersedia di: **http://localhost:3000/api/v1**

---

## Database Commands

| Command | Description |
|---|---|
| `yarn db:generate` | Generate SQL migration dari schema |
| `yarn db:migrate` | Apply migration ke database |
| `yarn db:push` | Push schema langsung (dev only) |
| `yarn db:studio` | Buka Drizzle Studio |

---

## Project Structure

```
finara-api/
├── drizzle/                    # Generated migration SQL
├── src/
│   ├── common/
│   │   ├── filters/            # Global exception filter
│   │   ├── guards/             # JWT auth guard
│   │   ├── interceptors/       # Response interceptor
│   │   └── pipes/              # Zod validation pipe
│   ├── config/                 # Config factories
│   ├── database/
│   │   ├── schema.ts           # Drizzle table definitions
│   │   └── index.ts            # Drizzle db instance
│   ├── modules/
│   │   └── database/           # Global DatabaseModule
│   ├── utils/
│   │   └── hash.util.ts        # bcrypt helpers
│   ├── app.module.ts
│   └── main.ts
├── drizzle.config.ts
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── package.json
```

---

## API Response Format

**Success:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request successful",
  "data": {},
  "timestamp": "2026-03-16T12:00:00.000Z"
}
```

**Error:**
```json
{
  "success": false,
  "statusCode": 400,
  "timestamp": "2026-03-16T12:00:00.000Z",
  "path": "/api/v1/resource",
  "message": "Validation failed"
}
```

---

## Running Tests

```bash
yarn test
yarn test:cov
yarn test:e2e
```
