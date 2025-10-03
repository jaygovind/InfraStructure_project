
# SwiftRide Monorepo (Next.js + NextAuth + NestJS + Prisma + MinIO + JWT)

A production-ready starter for a ride-hailing style app:
- **Frontend:** Next.js 14 (App Router) + **NextAuth** (Credentials) calling API via `NEXT_PUBLIC_API_BASE_URL`
- **Backend:** NestJS 10 with **Passport/JWT auth**, Prisma (PostgreSQL), **MinIO** integration, **multipart upload**, **Pino** logging, **Sentry** error tracking, **Prometheus** metrics, CORS
- **Infra:** Dockerfiles + Docker Compose (db + minio + backend + frontend)
- **CI/CD:** GitHub Actions to deploy **frontend** & **backend** to **Railway** (separate services)

---

## 1) Prerequisites

- Node.js **20+**
- Docker + Docker Compose
- Railway account & project
- GitHub repo (for CI/CD)

---

## 2) Local Development (Docker Compose)

```bash
# 1) Unzip and cd
unzip swiftride-monorepo-extended-auth-upload.zip
cd swiftride-monorepo-extended-auth-upload

# 2) Copy env templates
cp apps/frontend/.env.example apps/frontend/.env
cp apps/backend/.env.example apps/backend/.env


🔧 Next Step

Make sure apps/backend/package-lock.json and apps/frontend/package-lock.json exist.
If missing, run:

cd apps/backend && npm install
cd apps/frontend && npm install


Commit both lock files.

Rebuild everything fresh:

cd infra
docker compose down -v --remove-orphans
docker compose build --no-cache
docker compose up

# 3) Start full stack
docker compose -f infra/docker-compose.yml up --build
```

- Frontend → http://localhost:3000  
- Backend → http://localhost:4000/health  
- Metrics → http://localhost:4000/metrics  
- MinIO Console → http://localhost:9001 (user: `minio`, pass: `minio123`)  

---

## 3) Testing Features

### Auth
- Backend login: `POST /auth/login` with body `{ "email": "admin@example.com", "password": "admin" }`  
  - Returns `{ access_token }` (JWT)
- Protected sample: `GET /auth/profile` (send `Authorization: Bearer <token>`)
- Frontend: visit `/api/auth/signin` to sign in with the same credentials (NextAuth → backend).

### Upload to MinIO
- `POST /storage/upload` (multipart/form-data) with field `file`  
  - Saves to MinIO bucket and returns object key + url
- Check storage health: `GET /storage/health`

### DB (Prisma)
- Users list: `GET /users`
- On first run, the migration creates `User` table and seeds one admin user (`admin@example.com`).

---

## 4) Project Structure

```
/apps
  /frontend         # Next.js 14 + NextAuth (Credentials)
  /backend          # NestJS + Prisma + MinIO + Pino + Sentry + JWT + Uploads
/infra
  docker-compose.yml
/.github/workflows
  deploy.yml        # CI to Railway (2 services)
```

---

## 5) Environment Variables

### Frontend (`apps/frontend/.env`)
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=changeme-nextauth-secret
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

### Backend (`apps/backend/.env`)
```
PORT=4000
DATABASE_URL=postgres://postgres:postgres@db:5432/swiftride

# Logging
LOG_LEVEL=info

# JWT
JWT_SECRET=supersecretjwt
JWT_EXPIRES_IN=1d

# Sentry
SENTRY_DSN=

# MinIO
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minio
MINIO_SECRET_KEY=minio123
MINIO_BUCKET=swiftride-media
MINIO_PUBLIC_URL=http://localhost:9000
```

---

## 6) Prisma & Seed

Schema lives at `apps/backend/prisma/schema.prisma`. On container start, migrations are deployed. A seed creates an admin user.

Manual (outside Docker):
```bash
cd apps/backend
npm ci
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.cjs
```

---

## 7) Railway Deployment (CI/CD)

Create **two Railway services** in the same Railway project:
- Service A → points to `apps/frontend`
- Service B → points to `apps/backend`

### GitHub Actions Secrets
- `RAILWAY_API_TOKEN`
- `RAILWAY_FRONTEND_SERVICE_ID`
- `RAILWAY_BACKEND_SERVICE_ID`

### Railway Env (suggested)

**Frontend service:**
```
NEXTAUTH_URL=https://<your-frontend-url>
NEXTAUTH_SECRET=<random-32+ chars>
NEXT_PUBLIC_API_BASE_URL=https://<your-backend-url>
```

**Backend service:**
```
PORT=4000
DATABASE_URL=${{RAILWAY_DATABASE_URL}}  # If using Railway Postgres add-on
LOG_LEVEL=info

JWT_SECRET=<long-random>
JWT_EXPIRES_IN=1d

SENTRY_DSN=<or empty>

MINIO_ENDPOINT=<host or external>
MINIO_PORT=9000
MINIO_USE_SSL=true|false
MINIO_ACCESS_KEY=<key>
MINIO_SECRET_KEY=<secret>
MINIO_BUCKET=swiftride-media
MINIO_PUBLIC_URL=https://<minio-url-or-s3-compatible-url>
```

> In Railway, add a **Postgres** add-on and expose `RAILWAY_DATABASE_URL`.  
> Point `DATABASE_URL` to it or directly use `${{RAILWAY_DATABASE_URL}}`.

---

## 8) Endpoints

- `GET /health`
- `GET /metrics`
- `GET /users`
- `POST /auth/login`
- `GET /auth/profile` (JWT protected)
- `POST /storage/upload` (multipart file → MinIO)
- `GET /storage/health`

---

You're ready to build features on top—rides, drivers, orders, payments, etc.

