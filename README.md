# Finara API

RESTful API for a personal finance management application, built with **NestJS**, **Drizzle ORM**, and **PostgreSQL**.

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

Edit `.env` and fill in your values (defaults work with Docker Compose):

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/finara_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRES_IN=7d
```

### 3. Start Database with Docker Compose

```bash
# Start PostgreSQL only (recommended for local development)
docker-compose up postgres -d

# Or start everything (including the app container)
docker-compose up -d
```

### 4. Run Database Migration

Generate and apply the initial migration:

```bash
yarn db:generate   # Generate SQL migration files from schema
yarn db:migrate    # Apply migrations to the database
```

### 5. Start the Application

```bash
# Development (hot-reload)
yarn start:dev

# Production
yarn build
yarn start:prod
```

The API will be available at: **http://localhost:3000/api/v1**

---

## Database Commands

| Command | Description |
|---|---|
| `yarn db:generate` | Generate SQL migration files from schema changes |
| `yarn db:migrate` | Apply pending migrations to the database |
| `yarn db:push` | Push schema changes directly (dev only, no migration files) |
| `yarn db:studio` | Open Drizzle Studio (visual DB browser) |

---

## Project Structure

```
finara-api/
├── drizzle/                    # Generated migration SQL files
├── src/
│   ├── common/
│   │   ├── filters/            # Global exception filters
│   │   ├── guards/             # Auth guards (JWT, etc.)
│   │   ├── interceptors/       # Response interceptors
│   │   └── pipes/              # Validation pipes (Zod)
│   ├── config/                 # Module-level config factories
│   ├── database/
│   │   ├── schema.ts           # Drizzle ORM table definitions
│   │   └── index.ts            # Drizzle db instance
│   ├── modules/
│   │   └── database/           # Global DatabaseModule (DI provider)
│   ├── utils/
│   │   └── hash.util.ts        # bcrypt helpers
│   ├── app.module.ts
│   └── main.ts
├── drizzle.config.ts           # Drizzle Kit configuration
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── package.json
```

---

## API Response Format

All responses follow a consistent envelope:

**Success:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request successful",
  "data": { ... },
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
# Unit tests
yarn test

# Watch mode
yarn test:watch

# Coverage
yarn test:cov

# E2E tests
yarn test:e2e
```

---

## Docker (Full Stack)

To run both the database and the app in Docker:

```bash
docker-compose up -d
```

Then run migrations from inside the container:

```bash
docker-compose exec app yarn db:migrate
```
