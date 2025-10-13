# Assignment Calculator Frontend

This React + Vite application powers the Assignment Calculator UI. The app fetches assignment type definitions from the Flask backend when available and falls back to a pre-built cache when the API is offline.

## Getting Started

```bash
npm install
npm run dev
```

## Useful Scripts

- `npm run dev` – start the Vite development server.
- `npm run build` – type-check and produce a production bundle.
- `npm run lint` – run ESLint over the source files.
- `npm run build-cache` – regenerate the assignment type cache module from the backend data (see below).

## Assignment Type Cache

The frontend expects a generated module at `src/generated/cache.ts`. Run `npm run build-cache` (which invokes `python3 ../scripts/build_assignment_cache.py`) whenever the backend assignment type files under `app/data/types/` change. The script:

1. Reads the current assignment type documents via `type_store.list_types()`.
2. Writes a canonical cache to `public/cache.ts` and a mirrored copy to `src/generated/cache.ts`.
3. Records the generation timestamp in `app/data/types/_metadata.json` so the backend can expose freshness information at `/types/metadata`.

At runtime the frontend attempts to fetch live `/types` data. If the request fails, it logs a warning and falls back to the generated cache module.
