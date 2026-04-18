# Payload Library

Payload Library is a Next.js website with a programmer-themed UI that mirrors category content from [swisskyrepo/PayloadsAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings).

## Features

- Build-time content snapshot from upstream GitHub repository
- Searchable category index
- Facet filters (e.g., Injection, Authentication, Misconfiguration) and paginated results
- Full markdown rendering per category
- Table of contents anchors and copy button for code blocks
- Attribution and usage disclaimer page
- Scheduled GitHub Action to refresh data and validate lint/build

## Run locally

```bash
npm install
npm run sync:data
npm run dev
```

Then open <http://localhost:3000>.

## Scripts

- `npm run sync:data` fetches and transforms upstream categories into `data/generated/categories.json`
- `npm run lint` runs ESLint
- `npm run build` builds production assets

## Notes

- Content is sourced from upstream and intended for educational and authorized security testing contexts only.
- If `data/generated/categories.json` is missing, run `npm run sync:data` before launching the app.
