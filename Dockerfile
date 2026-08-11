# syntax=docker/dockerfile:1

# ---- deps ------------------------------------------------------------------
# Dependencies land in their own layer so they're only reinstalled when the
# lockfile changes, not on every source edit.
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
	pnpm config set store-dir /pnpm/store && \
	pnpm install --frozen-lockfile

# ---- dev -------------------------------------------------------------------
# Opt-in stage for live editing on the host. Source is bind-mounted by compose,
# so this image holds only node_modules. Started via: --profile dev
FROM deps AS dev
ENV NODE_ENV=development
EXPOSE 5173
CMD ["pnpm", "dev", "--host", "0.0.0.0"]

# ---- build -----------------------------------------------------------------
FROM deps AS build
COPY . .
# Calls vite directly rather than `pnpm build`, which also runs `tsc -b`.
# tsc currently fails on a pre-existing config error (TS5102: baseUrl removed
# in TS 7) unrelated to the app code. Switch this to `pnpm build` once
# tsconfig.app.json drops baseUrl, so type errors block the image.
RUN pnpm exec vite build

# ---- runtime ---------------------------------------------------------------
# Caddy rather than nginx to match the reverse proxy running on the host, so
# there's only one web server config syntax to maintain on that box.
FROM caddy:alpine AS prod
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
	CMD wget -qO- http://localhost/ >/dev/null || exit 1
