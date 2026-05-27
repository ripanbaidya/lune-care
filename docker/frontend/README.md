## Frontend — Docker Configuration

This document covers the Docker setup for the LuneCare frontend: a two-stage build that produces a lightweight,
production-ready Nginx image.

## Folder Structure

```
lunecare/
├── web/                    # React + Vite source for frontend
└── docker/
    └── frontend/
        ├── Dockerfile      # Two-stage build
        └── nginx.conf      # Nginx config with SPA routing + API proxy
```

## Dockerfile — Two-Stage Build

**Stage 1: Build**

- Uses `node:22-alpine` as the base image
- Installs dependencies via `npm ci` (deterministic, faster than `npm install` — suitable for CI/CD)
- Copies the full `frontend/` source and runs `npm run build`
- Output: static assets in `/app/dist`

**Stage 2: Serve**

- Uses `nginx:1.27-alpine` (minimal footprint)
- Copies built assets from Stage 1 into Nginx's serve directory
- Applies the custom `nginx.conf` for SPA routing and API proxying
- Exposes port `80`

> The final image contains **only Nginx + static assets** — no Node.js runtime, no source code.

---

## Nginx Configuration

Two key behaviors:

**1. SPA Routing (React Router support)**

```nginx
try_files $uri $uri/ /index.html;
```

Ensures deep-linked React routes (e.g., `/dashboard/transactions`) work correctly on browser refresh — all unmatched
paths fall back to `index.html`.

**2. API Reverse Proxy**

```nginx
location /api/ {
    proxy_pass http://api-gateway:8080;
}
```

Any request starting with `/api/` is proxied internally to the backend container. This eliminates CORS issues because
the browser only ever talks to the frontend's origin.

> `api-gateway` resolves via Docker's internal DNS — containers on the same network can reach each other by service
> name.

## Building the Image

> **Important:** The build context must be the **project root** (`lunecare/`), not the `frontend/` or `docker/` folder.
> The Dockerfile references both `frontend/` and `docker/frontend/` paths.

```shell
# From project root
docker build \
  -f docker/frontend/Dockerfile \
  -t ripanbaidya/lunecare-frontend:latest \
  .
```

## Environment Variables at Build Time

Vite bakes `VITE_*` variables into the static bundle **at build time**, not runtime.

| Scenario                    | How to set `VITE_*` vars                                             |
|-----------------------------|----------------------------------------------------------------------|
| Local dev (`npm run dev`)   | `frontend/.env.local`                                                |
| Docker image build          | Pass as `--build-arg` or set in CI environment before `docker build` |
| Docker Compose (full stack) | Defined in `docker/docker-compose/compose/.env`                      |

> If you need to change `VITE_API_BASE_URL` after building, you must **rebuild the image**. Vite does not support
> runtime injection without additional tooling (e.g., a startup script that replaces a placeholder).

## Pre-flight Checklist

Before using this image in docker-compose or deployment, verify:

- [ ] `npm run build` works locally without errors
- [ ] `nginx.conf` `proxy_pass` points to the correct backend container name (`api-gateway`)
- [ ] Backend container is on the same Docker network (`lunecare_network`)
- [ ] `VITE_API_BASE_URL` and `VITE_GOOGLE_CLIENT_ID` were set correctly at image build time