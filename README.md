# NeuroRehab

Small React/Vite app for tracking a rehabilitation routine, daily supplements,
activities, ratings, and weekly trends. It is deployed on Vercel and stores user
data in Supabase.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Supabase Auth + Postgres
- Vercel Analytics
- Vitest
- Oxlint

## Environment

Create a local `.env` file with the public Supabase project values:

```sh
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

The app validates these at startup so missing Vercel/local env vars fail early.

## Development

```sh
npm install
npm run dev
npm test -- --run
npm run build
npm run lint
```

If `npm run lint` fails because an Oxlint native binding is missing, refresh
dependencies with a clean install. This can happen when npm skips optional
platform packages.

## Supabase

The current schema and seed data live in `supabase/schema.sql`.

Important notes:

- RLS is enabled on user-owned tables.
- `activities.name` is unique so seed data can be upserted without duplicates.
- Client code uses the anon key only; never add service-role keys to Vite env.
