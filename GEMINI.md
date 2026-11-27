# Project Guidelines & Security Rules

## 1. Security & Authentication (Strict - No Hardcoded Fallback Secrets)
- **NO HARDCODED FALLBACK SECRETS**: Never use hardcoded fallback strings for secrets, passwords, tokens, or API keys in backend, serverless functions, or frontend code (e.g., NEVER do `process.env.KEY || 'some_fallback_key'`).
- **FAIL FAST & EXPLICITLY**: If an environment variable is missing, reject the request immediately with an explicit error (e.g., `SHOWS_API_KEY is not configured on server`). Never invent or supply default dummy keys.
- **FRONTEND CREDENTIALS**: Frontend client applications must NEVER prefill or embed default secret keys in source files or input defaults. Secrets must be entered explicitly by the user.
- **NO SECRETS IN VCS**: Never commit `.env` files, production credentials, private tokens, or secrets to Git.

## 2. Architecture & Documentation
- ALWAYS inspect `STRUCTURE.md` before making architectural changes or creating new modules.
- Maintain consistency between Netlify Serverless Functions (`netlify/functions/`), `netlify.toml`, and `public/_redirects`.
