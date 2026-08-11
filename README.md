# Wordler

A Wordle helper. Enter your guesses, mark each letter green/yellow/gray, and it
filters the remaining possible words. State persists to localStorage.

```sh
pnpm install
pnpm dev          # http://localhost:5173
pnpm test         # reducer + storage tests
```

## Deploying to the Mac mini

Static bundle served by Caddy in a container, intended to sit behind the Caddy
instance on the host. Same config syntax in both places, on purpose.

```sh
docker compose up -d --build      # production, http://<host>:8080
docker compose logs -f wordler
docker compose down
```

Live-reload server instead of the static build (bind-mounts source, port 5173):

```sh
docker compose --profile dev up wordler-dev
```

### Surviving a reboot

`restart: unless-stopped` brings the container back when the Docker daemon
starts — but OrbStack is a user app that starts at **login**, not at boot. On a
headless box that means nothing comes back until someone logs in.

Fix it once, at the host level, and it covers every container:

**System Settings → Users & Groups → Automatic login → <your user>**

(FileVault blocks auto-login on Apple silicon; disable it or use a LaunchDaemon
instead if the disk must stay encrypted.)

Verify with `sudo reboot`, then from another machine: `curl -I http://<host>:8080`.

### Caddy

There are two Caddyfiles, doing different jobs:

- `./Caddyfile` — baked into the image, serves the static files on port 80
  inside the container. Already done.
- The host Caddyfile on the mini — terminates TLS and proxies to the container.
  Not yet set up. When it is, add:

```caddyfile
wordler.<tailnet>.ts.net {
	reverse_proxy localhost:8080
}
```

The container stays on 8080 and needs no changes. To keep the port off the LAN
entirely once Caddy fronts it, bind to loopback in `docker-compose.yml`:
`- "127.0.0.1:8080:80"`.

## Notes

- `pnpm build` runs `tsc -b && vite build`; `tsc -b` currently fails with
  TS5102 (`baseUrl` removed in TS 7) from `tsconfig.app.json`. The Dockerfile
  calls `vite build` directly to work around it. Drop `baseUrl` from
  `tsconfig.app.json` and the Dockerfile can go back to `pnpm build`.
- `pnpm lint` is also broken independently: typescript-eslint 8.66 doesn't
  support TS 7.

---

This project was bootstrapped with the React + TypeScript + Vite template.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
