# Bastion Arena Survival — Render + PHP migration

Copy `Dockerfile`, `.htaccess`, and the `api/*.php` files into the project root:
`Bastion_Arena_Survival_XAMPP_2_4_PostgreSQL/Bastion_Arena_Survival_CLEAN/`.

Do not delete or replace `index.html`, `styles.css`, game JavaScript files, either `.glb` arena model, or the Supabase data. These files retain the existing `/api/auth`, `/api/me`, `/api/load`, `/api/save`, and `/api/health` URLs used by `account.js`.

## Render settings
- Repository: existing GitHub repository
- Branch: `main`
- Root Directory: `Bastion_Arena_Survival_XAMPP_2_4_PostgreSQL/Bastion_Arena_Survival_CLEAN`
- Runtime: `Docker`
- Health Check Path: `/api/health`

## Environment variables in Render
- `DATABASE_URL`: Supabase PostgreSQL connection URI. Prefer the Supabase Session pooler URI if direct connections are not reachable from Render.
- `JWT_SECRET`: a new random secret of at least 32 characters. Do not reuse any secret that was committed publicly.
- `PGSSLMODE`: `require`

Never commit real credentials. If the public `.env.example` contains actual credentials, rotate the Supabase database password, generate a new JWT secret, replace values in `.env.example` with placeholders, and commit that cleanup.

## Database
If `public.users` and `public.player_saves` already exist, keep them. Do not drop/recreate them. If missing, run `database/bastion.sql` once in Supabase SQL Editor.

## Test after deploy
1. Visit `/api/health`; expected JSON includes `"ok":true` and `"runtime":"php"`.
2. Register a test account, log out, then log in.
3. Save progress, refresh, and confirm the cloud save loads.
