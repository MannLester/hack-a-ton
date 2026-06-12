# Local Dockerized Convex Handoff

Use this handoff when an agent needs to set up or debug the local Dockerized Convex instance for this repo.

## Goal

Run Convex locally through Docker, push this repo's Convex functions and schema, seed demo data, and connect the Next.js app to the local backend.

## Repo Facts

- Docker Compose file: `docker-compose.convex.yml`
- Convex app code: `convex/`
- Convex provider: `components/convex-provider.tsx`
- Frontend env read by the app: `NEXT_PUBLIC_CONVEX_URL`
- Local Convex backend URL from this repo: `http://127.0.0.1:3220`
- Local Convex HTTP actions URL from this repo: `http://127.0.0.1:3221`
- Local Convex dashboard URL from this repo: `http://127.0.0.1:6792`
- Docker volume name is managed by the Compose project `hack-a-ton-convex`.

The Compose file maps Convex's default container ports to host ports:

- Container backend `3210` maps to host `3220`.
- Container HTTP actions `3211` maps to host `3221`.
- Container dashboard `6791` maps to host `6792`.

## Important Rules

- Do not commit unless the user explicitly asks.
- Do not read `.env`, `.env.local`, or other secret env files unless permissions allow it.
- If you edit files, run `npm run lint`, `npm run typecheck`, and `npm run build` after the edit.
- Keep changes small and repo-specific.

## Prerequisites

- Docker Desktop or another Docker engine must be running.
- Node dependencies must be installed with `npm install` if `node_modules/` is missing.
- The project uses `convex` from `package.json`; prefer `npx convex ...` so the local package is used.

## Setup Steps

1. Start the local Convex backend and dashboard.

```sh
docker compose -f docker-compose.convex.yml up -d
```

2. Check that the backend is healthy.

```sh
curl http://127.0.0.1:3220/version
```

Expected result: a Convex version response. If this fails, inspect Docker logs before changing code.

```sh
docker compose -f docker-compose.convex.yml logs backend
```

3. Generate a local admin key.

```sh
docker compose -f docker-compose.convex.yml exec backend ./generate_admin_key.sh
```

Keep this key local. Do not commit it.

4. Add local Convex env values.

The agent should ensure the local development env has these values:

```sh
CONVEX_SELF_HOSTED_URL='http://127.0.0.1:3220'
CONVEX_SELF_HOSTED_ADMIN_KEY='<admin key from generate_admin_key.sh>'
NEXT_PUBLIC_CONVEX_URL='http://127.0.0.1:3220'
```

Use the existing env approach in the repo. If env files are blocked by permissions, ask the user before reading or editing them.

5. Push Convex schema and functions to the local backend.

```sh
npx convex dev
```

Keep this command running while developing when possible. If an agent needs a one-time deploy style push, inspect `npx convex --help` and use the self-hosted env values above.

6. Seed demo data in another terminal after Convex functions are pushed.

```sh
npx convex run seed:seedDemoData
```

For larger demo counts, use:

```sh
npx convex run seed:seedDemoData '{"includeLargeInterestCounts":true}'
```

7. Start the Next.js app.

```sh
npm run dev
```

The app should use `NEXT_PUBLIC_CONVEX_URL` through `components/convex-provider.tsx`.

8. Open the local Convex dashboard.

```text
http://127.0.0.1:6792
```

Use the generated admin key if the dashboard asks for one.

## Verification Checklist

- `docker compose -f docker-compose.convex.yml ps` shows `backend` and `dashboard` running.
- `curl http://127.0.0.1:3220/version` returns a version response.
- Dashboard loads at `http://127.0.0.1:6792`.
- `npx convex dev` connects to `http://127.0.0.1:3220` and pushes `convex/` code.
- `npx convex run seed:seedDemoData` completes without errors.
- `npm run dev` starts the app and pages using Convex data do not show connection errors.

## Common Issues

### Port Already In Use

The host ports are `3220`, `3221`, and `6792`. If one is taken, stop the conflicting process or change the host port in `docker-compose.convex.yml`.

If the port mapping changes, also update the env values and dashboard deployment URL.

### Dashboard Loads But Cannot Reach Backend

Check `NEXT_PUBLIC_DEPLOYMENT_URL` inside `docker-compose.convex.yml`. In this repo it should point to `http://127.0.0.1:3220`.

Restart after changing Compose env:

```sh
docker compose -f docker-compose.convex.yml up -d
```

### App Runs Without Convex Data

Check `NEXT_PUBLIC_CONVEX_URL`. The provider returns plain children when this env value is missing, so the app may render without a Convex client instead of crashing immediately.

### Convex CLI Uses Cloud Instead Of Local Backend

Make sure these env vars are present in the shell or local env file used by the CLI:

```sh
CONVEX_SELF_HOSTED_URL='http://127.0.0.1:3220'
CONVEX_SELF_HOSTED_ADMIN_KEY='<admin key>'
```

Then rerun `npx convex dev`.

### Need A Clean Local Convex Database

This removes local Convex data. Only do this if the user agrees or the task clearly asks for a reset.

```sh
docker compose -f docker-compose.convex.yml down -v
docker compose -f docker-compose.convex.yml up -d
```

After reset, generate a new admin key, push functions again, and rerun the seed command.

## Useful Commands

```sh
docker compose -f docker-compose.convex.yml up -d
docker compose -f docker-compose.convex.yml ps
docker compose -f docker-compose.convex.yml logs backend
docker compose -f docker-compose.convex.yml logs dashboard
docker compose -f docker-compose.convex.yml exec backend ./generate_admin_key.sh
curl http://127.0.0.1:3220/version
npx convex dev
npx convex run seed:seedDemoData
npm run dev
```

## References

- Convex self-hosting docs: `https://docs.convex.dev/self-hosting`
- Convex backend self-hosted guide: `https://github.com/get-convex/convex-backend/blob/main/self-hosted/README.md`
