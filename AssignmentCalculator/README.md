# Assignment Calculator Frontend

This React + Vite application powers the Assignment Calculator UI. The app fetches assignment type definitions from the Flask backend when available and falls back to a pre-built cache when the API is offline.

## Getting Started

```bash
npm install
npm run dev
```

The dev server proxies API requests from `/api/*` to `http://127.0.0.1:5001` (see `vite.config.ts`), so run the Flask backend alongside the frontend during local development.

## Useful Scripts

- `npm run dev` – start the Vite development server.
- `npm run build` – type-check and produce a production bundle.
- `npm run preview` – serve the last production build locally for smoke testing.
- `npm run lint` – run ESLint over the source files.
- `npm run build-cache` – regenerate the assignment type cache module from the backend data (see below).

## Assignment Type Cache

The frontend expects a generated module at `src/generated/cache.ts`. Run `npm run build-cache` (which invokes `python3 ../scripts/build_assignment_cache.py`) whenever the backend assignment type files under `app/data/types/` change. The script:

1. Reads the current assignment type documents via `type_store.list_types()`.
2. Writes a canonical cache to `public/cache.ts` and a mirrored copy to `src/generated/cache.ts`.
3. Records the generation timestamp in `app/data/types/_metadata.json` so the backend can expose freshness information at `/types/metadata`.

At runtime the frontend attempts to fetch live `/types` data. If the request fails, it logs a warning and falls back to the generated cache module.

## Testing & Quality Checks

Before merging changes or deploying, run the following:

```bash
npm run lint      # Static analysis for TypeScript + React hooks
npm run build     # Type-check + Vite production build
```

Optional checks:

- `npm run preview` – confirm the compiled build renders correctly.
- Exercise the UI with the Flask backend running to verify data flows (assignment types, plan generation, exports).
- If assignment types were edited, run `npm run build-cache` and re-run `npm run build` to ensure generated modules compile.

## Deployment Guide

1. **Set environment variables** – configure `VITE_API_BASE` (e.g. `/api` or a fully-qualified backend URL) for the target environment. In most static hosts this is done via build-time environment configuration.
2. **Build the app**:
   ```bash
   npm install
   npm run build
   ```
3. **Deploy the `dist/` directory** – upload the generated static assets to your hosting platform (Netlify, Vercel, S3 + CloudFront, etc.).
4. **Backend availability** – ensure the Flask API is published at the URL referenced by `VITE_API_BASE`. The frontend will automatically fall back to the cached assignment types if the API is unreachable, but plan generation and exports require the backend to be online.
5. **Post-deploy smoke test** – run `npm run preview` locally with `VITE_API_BASE` mimicking production (or visit the deployed URL) to verify assignment creation, calendar toggles, and ICS/PDF exports work end-to-end.

With these steps the Assignment Calculator frontend can be developed, tested, and deployed confidently alongside the Flask backend.
