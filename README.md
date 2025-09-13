
# Lead Manager — Fullstack Project


> Complete end-to-end Lead Management application (React + Vite frontend, Express + MongoDB backend).  
> This README covers local setup (server), deployment links section, features, API usage, and detailed instructions for running, seeding, and troubleshooting.

---

## Table of Contents
- [Lead Manager — Fullstack Project](#lead-manager--fullstack-project)
  - [Table of Contents](#table-of-contents)
  - [Project Overview](#project-overview)
  - [Features](#features)
  - [Architecture](#architecture)
  - [Live / Deployed Links (attach here)](#live--deployed-links-attach-here)
  - [Local Setup — Backend (detailed)](#local-setup--backend-detailed)
    - [Prerequisites](#prerequisites)
    - [Steps](#steps)
    - [Important backend files](#important-backend-files)
  - [Local Setup — Frontend (brief)](#local-setup--frontend-brief)
    - [Prerequisites](#prerequisites-1)
    - [Steps](#steps-1)
  - [Environment Variables (summary)](#environment-variables-summary)
    - [Backend `.env`](#backend-env)
    - [Frontend `.env` (Vite)](#frontend-env-vite)
  - [API Reference \& Examples](#api-reference--examples)
    - [Auth](#auth)
      - [Register](#register)
      - [Login](#login)
      - [Logout](#logout)
      - [Get current user](#get-current-user)
    - [Leads (all protected — require auth cookie)](#leads-all-protected--require-auth-cookie)
      - [Common filters (query params)](#common-filters-query-params)
    - [cURL Examples](#curl-examples)
  - [Postman Notes](#postman-notes)
  - [Frontend Usage Notes](#frontend-usage-notes)

---

## Project Overview
This project is a simple Lead Management system:
- Backend: Node.js + Express + Mongoose (MongoDB)
- Frontend: React (Vite) with AG Grid for the leads table
- Auth: JWT stored in an `httpOnly` cookie (safer than localStorage)
- Features include lead CRUD, server-side pagination, filtering, per-user ownership, admin role, seed data

---

## Features
- User registration & login (JWT, httpOnly cookie)
- Protected routes (middleware) — `401` for unauthenticated, `403` for forbidden
- Lead CRUD: create, read (single + list), update, delete
- Server-side pagination and flexible filters (`email_contains`, `score_between`, `status_in`, date ranges, boolean flags)
- Per-user ownership (each lead has `created_by`) and admin bypass
- Seed script to create test users (user + admin) and 120 sample leads
- React UI: Login, Register, Leads grid, Create/Edit lead

---

## Architecture
```
[React Vite Frontend]  <--->  [Express API (Render)]  <--->  [MongoDB Atlas]
   (axios withCredentials)        (JWT in httpOnly cookie)      (Mongoose)
```

---

## Live / Deployed Links

- **Frontend (Production):** `https://erino-five.vercel.app/login`
- **Backend (API):** `https://erino-0hrn.onrender.com`
- **Overall Project:** `https://erino-five.vercel.app/login` 

---

## Local Setup — Backend (detailed)

### Prerequisites
- Node.js >= 18, npm
- MongoDB (local or Atlas)
- Git

### Steps
1. Clone repo:
```bash
git clone <repo-url> 
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` (copy `.env.example`):
```bash
cp .env.example .env
```
Edit `.env` and set:
```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/lead_mgmt   # or your Atlas URI
JWT_SECRET=super_secure_random_string
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173
```

4. Start server (development):
```bash
npm run dev
# or
npm start
```

5. Seed database (creates `test@erino.test` / `Test1234!` and `admin@erino.test` / `Admin1234!` plus sample leads):
```bash
npm run seed
```

6. Health check:
```
GET http://localhost:4000/health
# returns { "ok": true }
```

### Important backend files
- `server.js` — entry point
- `src/index.js` — express app setup, cors, cookie parser
- `src/config/db.js` — connect to MongoDB
- `src/models/User.js` & `src/models/Lead.js`
- `src/routes/auth.js` & `src/routes/leads.js`
- `src/utils/seed.js` — seed script

---

## Local Setup — Frontend (brief)

### Prerequisites
- Node.js & npm

### Steps
1. Clone frontend:
```bash
git clone <repo-url> 
cd frontend
```

2. Install:
```bash
npm install
```

3. Environment (create `.env`):
```
VITE_API_BASE=http://localhost:4000/api
```

4. Run dev:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
npm run preview
```

> Note: Vite only exposes env vars prefixed with `VITE_`. Set `VITE_API_BASE` to your backend API for production builds.

---

## Environment Variables (summary)

### Backend `.env`
- `PORT` — port (e.g., 4000)
- `MONGODB_URI` — MongoDB connection string (Atlas or local)
- `JWT_SECRET` — strong secret for JWT signing
- `JWT_EXPIRES_IN` — e.g., `7d`
- `NODE_ENV` — `development` or `production`
- `FRONTEND_ORIGIN` — e.g., `http://localhost:5173` or `https://your-frontend.com`

### Frontend `.env` (Vite)
- `VITE_API_BASE` — `https://your-backend.com/api` or `http://localhost:4000/api`

---

## Seeding and Migration

### Seed
Run:
```bash
npm run seed
```
This:
- Deletes existing users & leads in the target DB (seed script behavior — review before running in production)
- Creates:
  - `test@erino.test` / `Test1234!` (role: user)
  - `admin@erino.test` / `Admin1234!` (role: admin)
  - 120 leads assigned to either test user or admin


## API Reference & Examples

> Base: `{{API_BASE}}` (e.g., `http://localhost:4000/api`)

### Auth
#### Register
- `POST /api/auth/register`
- Body:
```json
{ "email": "user@example.com", "password": "Pass123!", "name": "User" }
```
- Success: `201` — sets httpOnly cookie `token` and returns user object.

#### Login
- `POST /api/auth/login`
- Body:
```json
{ "email":"test@erino.test", "password":"Test1234!" }
```
- Success: `200` — sets cookie and returns user.

#### Logout
- `POST /api/auth/logout` — clears cookie

#### Get current user
- `GET /api/auth/me` — returns authenticated user (requires cookie)

---

### Leads (all protected — require auth cookie)
- `POST /api/leads` — create lead (server sets `created_by` from auth user)
- `GET /api/leads` — list leads (supports pagination & filters)
- `GET /api/leads/:id` — get single (403 if not owner)
- `PUT /api/leads/:id` — update (403 if not owner)
- `DELETE /api/leads/:id` — delete (403 if not owner)

#### Common filters (query params)
- `page`, `limit`
- `email_contains`
- `status`, `status_in` (comma-separated)
- `score_between=20,80`
- `created_between=2024-01-01,2024-12-31`
- `is_qualified=true`

---

### cURL Examples

**Login (store cookie using curl’s cookie jar)**
```bash
curl -c cookiejar.txt -X POST "{{API_BASE}}/auth/login" \
 -H "Content-Type: application/json" \
 -d '{"email":"test@erino.test","password":"Test1234!"}'
```

**List leads (using cookiejar)**
```bash
curl -b cookiejar.txt "{{API_BASE}}/leads?page=1&limit=10"
```

**Create lead**
```bash
curl -b cookiejar.txt -X POST "{{API_BASE}}/leads" \
 -H "Content-Type: application/json" \
 -d '{"first_name":"Alice","last_name":"J","email":"alice@example.com","score":72}'
```

**Get single lead**
```bash
curl -b cookiejar.txt "{{API_BASE}}/leads/<LEAD_ID>"
```

---

## Postman Notes
- Use the Postman UI to preserve cookies (the cookie jar).
- If testing from Postman without cookie support, you can return token from login response temporarily and use `Authorization: Bearer <token>` for testing.
- Ensure `withCredentials: true` is used by the frontend axios instance.

---

## Frontend Usage Notes
- Log in via the Login page — backend will set the `token` cookie.
- AG Grid displays leads from `GET /api/leads`.
- Create/Edit lead uses `/api/leads` endpoints; only owner or admin can edit/delete.
- The UI expects the backend to be reachable via `import.meta.env.VITE_API_BASE` (set at build time).

---
