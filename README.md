# RecipeHub Server

Backend API for [RecipeHub](https://recipehub-client-gilt.vercel.app) — a recipe sharing platform.

Live API: https://recipehub-server-eight.vercel.app

Client repository: https://github.com/mimdev14/recipehub-client-.git

- 🔐 JWT authentication with HTTP-only cookies, verified via custom Express middleware protecting all dashboard APIs
- 🍳 Full CRUD API for recipes, with owner-only edit/delete and a free-tier recipe limit
- 🔎 Search, category filtering (`$in`), and server-side pagination
- ❤️ Likes, favorites, and recipe reporting endpoints
- 🛡️ Admin-only routes for managing users, featuring/removing recipes, and resolving reports
- 🚀 Deployed as a Vercel serverless function

## Tech Stack
- Node.js, Express
- jsonwebtoken (JWT)
- MongoDB (native driver)

## Getting Started
```bash
npm install
npm run dev
```
Create a `.env` file based on `.env.example` before running.

## API Routes
- `/api/users/*` — user sync, profile, stats, admin user management
- `/api/recipes/*` — recipe CRUD, likes, favorites, reports, admin recipe management
