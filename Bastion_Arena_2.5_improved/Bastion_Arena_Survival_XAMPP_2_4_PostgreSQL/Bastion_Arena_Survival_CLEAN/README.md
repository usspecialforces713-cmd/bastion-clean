# Bastion Arena Survival — clean Vercel + Supabase edition

This folder is the **project root**. Do not upload or deploy a parent folder containing another copy of Bastion. There is no PHP in this edition: Vercel runs the Node.js files in `api/`.

## Project layout

- `index.html`, `styles.css`, `game-*.js`, `*.glb`: game client and 3D assets
- `account.js`: account modal and cloud-save client
- `api/auth.js`, `api/me.js`, `api/save.js`, `api/load.js`: Vercel Node.js API routes
- `api/health.js`: deployment smoke test (no database required)
- `lib/bastion-api.js`: server helpers, PostgreSQL pool and signed session cookie
- `database/bastion.sql`: database schema for Supabase PostgreSQL
- `package.json`: server dependencies

## 1. Create a fresh GitHub repository

1. Create a new, empty repository, e.g. `bastion-arena-survival-clean`.
2. Extract this ZIP.
3. Upload/push the **contents of this folder** to the repository root. The root must directly show `index.html`, `package.json`, `api/`, `lib/`, and `database/`.
4. Do not put the files inside `bastion_xampp/Bastion/` or `bastion_vercel_pg/`.

## 2. Create a new Vercel project

1. In Vercel, choose **Add New → Project** and import the new GitHub repository.
2. Set **Root Directory** to `./` (repository root).
3. Framework preset: **Other**. No build command is required for this static HTML game; leave the output directory empty/default. Vercel should install dependencies from `package.json` and discover functions under `api/`.
4. Deploy once.
5. Open `https://YOUR-NEW-DOMAIN/api/health`. It should return JSON with `ok: true`. If it returns 404, check that `api/health.js` exists at the repository root's `api/` folder and that Root Directory is `./`.

## 3. Create Supabase database tables

1. Create a new Supabase project (or intentionally choose an existing one).
2. Open **SQL Editor** and run all of `database/bastion.sql`.
3. In **Project Settings → Database**, copy a PostgreSQL connection URI. For Vercel, use Supabase's **Session Pooler** connection URI if the direct connection is incompatible with IPv4/serverless connections.

This edition uses its own `public.users` table for Bastion accounts, not Supabase Auth. Do not store a real database password in source files or commit it to GitHub.

## 4. Configure Vercel environment variables

Under **Vercel → Project → Settings → Environment Variables**, add these for **Production** (and Preview if you will test preview deployments):

- `DATABASE_URL`: full PostgreSQL URI copied from Supabase. If the password contains URI-reserved characters, use the correctly URL-encoded connection string.
- `JWT_SECRET`: a private random string of at least 32 characters. Generate locally with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
- `PGSSLMODE`: `require`.

Save the variables and redeploy. Never put `DATABASE_URL` or `JWT_SECRET` in browser-side JavaScript.

## 5. Smoke tests

- `GET /api/health` → `200` JSON with `ok: true` (proves the route is deployed).
- `GET /api/me` → `200` JSON with `user: null` when signed out (proves the session route is deployed; it doesn't need the database for a signed-out session).
- Opening `/api/auth` in a browser sends GET, so `405 Method Not Allowed` is expected; login/register uses POST from the game.
- `500` on auth/save/load usually means missing environment variables, SQL tables not created, or a bad database URI. Inspect **Vercel → Logs → Functions**.

## Notes

The existing cloud save syncs the `runs`, `kills`, `highestLevel`, `best.score`, and `best.wave` values. It does not yet sync a live run, inventory, or unlocked heroes. Local browser saves remain available without logging in.
