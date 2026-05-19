# coax.ink

A tool for coaxing poems out of any text by subtraction.

Paste a speech, a contract, a recipe, a letter. Click words to make them
disappear. What remains is a poem.

No accounts. No servers. Your redaction lives entirely in its URL.

[coax.ink](https://coax.ink)

## Run locally

```
npm install
npm run dev
```

## Test and build

```
npm test
npm run build
```

The output in `dist/` is a static site. Drop it on Cloudflare Pages, Vercel,
Netlify, or any static host.

## Deploy to Cloudflare Pages

Connect this repository in the Cloudflare dashboard and set:

- Build command: `npm run build`
- Build output directory: `dist`
- Node version: `20` (set `NODE_VERSION` in environment variables)

No `wrangler.toml` is needed; everything Cloudflare needs is in the dashboard
settings and in `public/_headers`. There are no secrets, environment values,
or runtime configuration to manage.

## License

MIT. See [LICENSE](LICENSE). The design philosophy lives in [PRD.md](PRD.md).
The Newsreader typeface is licensed under the
[SIL Open Font License 1.1](public/fonts/OFL.txt).
