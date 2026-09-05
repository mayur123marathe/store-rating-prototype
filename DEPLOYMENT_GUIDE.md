# 🚀 Cloud Deployment Guide: Vercel & Free PostgreSQL

This guide explains how to host the **Frontend on Vercel** and connect it to a free live **PostgreSQL Cloud Database** (via Neon or Supabase) and your **Backend API**.

---

## 🏗️ Architecture in Production

```mermaid
graph LR
    User([User / Interviewer]) -->|HTTPS| VercelFrontend["Frontend on Vercel\n(https://your-app.vercel.app)"]
    VercelFrontend -->|REST API Calls| BackendAPI["Backend API\n(Render / Vercel Serverless)"]
    BackendAPI -->|Prisma Connection| CloudDB[("Cloud PostgreSQL\n(Neon.tech / Supabase)")]
```

---

## ⚡ 3-Step Deployment Walkthrough

### Step 1: Get a Free Cloud PostgreSQL Database (60 Seconds)

Since Vercel is a serverless platform (and cannot run a local PostgreSQL database file), you need a free hosted PostgreSQL connection string.

1. Go to **[Neon.tech](https://neon.tech)** (Recommended: free, fast, 0 config) or **[Supabase.com](https://supabase.com)**.
2. Click **Sign Up** (Sign in with your GitHub account).
3. Click **Create Project** -> name it `roxiler-db`.
4. Copy your **Connection String** (it looks like this):
   ```text
   postgresql://alex:password@ep-cool-cloud-12345.us-east-2.aws.neon.tech/roxiler-db?sslmode=require
   ```
5. From your local terminal, push your schema and seed this new cloud database:
   ```bash
   cd backend
   # Temporary set DATABASE_URL to your new cloud DB string
   npx prisma db push
   npx tsx prisma/seed.ts
   ```
   *(Your cloud PostgreSQL database is now fully created and seeded with all test accounts and ratings!)*

---

### Step 2: Deploy the Backend API

You can deploy the backend to **Render.com** (recommended for standard Express apps) OR to **Vercel**.

#### Option A: Deploy Backend on Render (Easiest & Free)
1. Go to **[Render.com](https://render.com)** and sign in with GitHub.
2. Click **New +** -> **Web Service**.
3. Select your GitHub repository: `mayur123marathe/store-rating-prototype`.
4. Configure settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `DATABASE_URL`: *(Your Neon/Supabase cloud DB string from Step 1)*
   - `JWT_SECRET`: `supersecret_jwt_production_token_2026`
   - `NODE_ENV`: `production`
6. Click **Create Web Service**.
7. Copy your live backend URL (e.g., `https://roxiler-backend.onrender.com`).

---

### Step 3: Deploy Frontend on Vercel

1. Go to **[Vercel.com](https://vercel.com)** and sign in with your GitHub account.
2. Click **Add New...** -> **Project**.
3. Import your repository: **`mayur123marathe/store-rating-prototype`**.
4. In the Project Configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`frontend`**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://roxiler-backend.onrender.com/api` *(or your live backend URL)*
6. Click **Deploy**!

In ~30 seconds, Vercel will build and give you a live production URL:
`https://store-rating-prototype-xxxx.vercel.app`

---

## 🛡️ Why `frontend/vercel.json` is Included

In Single Page Applications (SPAs) built with React Router, if a user navigates to `/stores` or `/admin` and refreshes the page, Vercel's default web server would look for a static file named `stores.html` and return a **404 Not Found**.

We added [`frontend/vercel.json`](./frontend/vercel.json) with rewrite rules:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
This guarantees that all deep routes (e.g. `/admin/users`, `/stores`, `/change-password`) are routed smoothly through React without 404 errors!
