# Pixza Studio — Production Readiness TODO

> Last updated: April 2026  
> Status: Work in progress. Check off items as completed.

---

## 🔴 MUST DO BEFORE GOING LIVE (Manual Actions Required)

These cannot be fixed in code — they require your action:

- [ ] **Rotate ALL exposed credentials** — your `.env` was committed with real keys:
  - [ ] `DATABASE_URL` — change PostgreSQL password in Coolify
  - [ ] `WP_API_SECRET` — change in Coolify env + WordPress plugin settings
  - [ ] `AUTH_SECRET` / `NEXTAUTH_SECRET` — regenerate with `openssl rand -base64 32`
  - [ ] `WC_CONSUMER_KEY` / `WC_CONSUMER_SECRET` — revoke in WooCommerce → Settings → REST API
  - [ ] `CLOUDFLARE_API_TOKEN` — revoke at dash.cloudflare.com → My Profile → API Tokens
  - [ ] `WAVESPEED_API_KEY` — revoke at wavespeed.ai dashboard
  - [ ] `KIE_API_KEY` — revoke at kie.ai dashboard

- [ ] **Set `GEMINI_API_KEY`** in Coolify — currently `"na"`, image generation is broken

- [ ] **Set `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`** in Coolify  
  Without Redis, rate limiting falls back to in-memory (10/hr) and resets on every deploy

- [ ] **Run Prisma migrations** locally before next deploy:
  ```bash
  npx prisma migrate dev --name init
  git add prisma/migrations
  git commit -m "chore: add initial prisma migration"
  git push
  ```
  The Dockerfile now runs `prisma migrate deploy` — it needs the migrations folder to exist

- [ ] **Set `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`** if you want Google OAuth to work  
  Currently configured in `src/lib/auth.ts` but keys are missing from Coolify env

---

## 🟠 HIGH PRIORITY — Broken Features

- [ ] **`/api/generations` doesn't support WP auth** — only works with NextAuth session  
  File: `src/app/api/generations/route.ts`  
  Fix: Add WP token fallback (same pattern as `/api/user/quota/route.ts`)

- [ ] **Gallery page uses `?page=` param but API uses cursor pagination**  
  File: `src/app/gallery/page.tsx` fetches `?page=1` but `generations/route.ts` uses cursor  
  Fix: Either switch gallery to cursor-based or add page param to generations API

- [ ] **`/api/open-directory` has no auth check** — any user can trigger OS file dialogs  
  File: `src/app/api/open-directory/route.ts`  
  Fix: Add localhost-only check (same as `open-file/route.ts`)

- [ ] **`/api/logs` has no auth check** — anyone can write log files to the server  
  File: `src/app/api/logs/route.ts`  
  Fix: Add auth check or restrict to localhost

- [ ] **`/api/save-generation` has no auth check** — anyone can write files to the server  
  File: `src/app/api/save-generation/route.ts`  
  Fix: Add auth check

- [ ] **`/api/browse-directory` has no auth check** — opens native OS file picker  
  File: `src/app/api/browse-directory/route.ts`  
  Fix: Add localhost-only check

- [ ] **`src/lib/stripe.ts` crashes on import if `STRIPE_SECRET_KEY` is not set**  
  Uses `process.env.STRIPE_SECRET_KEY!` — will throw at module load  
  Fix: Guard with null check or remove if Stripe is fully deprecated

- [ ] **Onboarding API keys are not saved** — `keys` state in onboarding is never persisted  
  File: `src/app/onboarding/page.tsx`  
  Fix: Save keys to `useWorkflowStore` on "Continue" in the providers step

- [ ] **`/api/chat` has no auth check** — anyone can use your Gemini API key for free  
  File: `src/app/api/chat/route.ts`  
  Fix: Add WP token auth check

- [ ] **`/api/llm` has no auth check** — same issue, exposes Gemini/OpenAI/Anthropic keys  
  File: `src/app/api/llm/route.ts`  
  Fix: Add auth check

---

## 🟡 MEDIUM — Polish & Reliability

- [ ] **`test-db` folder still exists** (empty) — delete it  
  Path: `src/app/api/test-db/` (empty directory left after file deletion)

- [ ] **`src/lib/stripe.ts` is unused** — Stripe was migrated to WordPress  
  Fix: Delete the file and remove any imports

- [ ] **`STRIPE_SECRET_KEY` not in `.env.example`** — if someone imports stripe.ts it crashes  
  Fix: Either add to `.env.example` as optional or delete the file

- [ ] **`/api/user/quota` still uses NextAuth as primary** — should prefer WP token  
  File: `src/app/api/user/quota/route.ts`  
  Fix: Check WP token first (it's the primary auth system)

- [ ] **`/api/generations` returns `nextCursor` but gallery uses `page` param**  
  Inconsistent pagination — pick one approach

- [ ] **`COEP` header breaks third-party embeds** — `require-corp` in `next.config.ts` blocks  
  loading images from Unsplash, HuggingFace, etc. in the browser  
  Fix: Only apply COEP to routes that need ONNX (`/create`), not globally

- [ ] **`src/app/api/test-db/` empty folder** — clean up  
  Run: `rmdir src/app/api/test-db`

- [ ] **`OPENAI_API_KEY` and `ANTHROPIC_API_KEY` not in `.env.example`**  
  Used in `src/app/api/llm/route.ts` but not documented  
  Fix: Add to `.env.example` as optional

- [ ] **`src/app/api/stripe/` routes return 501** — misleading, should return 404 or be deleted  
  Files: `src/app/api/stripe/checkout/route.ts`, `src/app/api/stripe/webhook/route.ts`

- [ ] **`/api/community-workflows` has no auth** — public read is fine but POST should be authed  
  Check: `src/app/api/community-workflows/route.ts`

- [ ] **`/api/workflow` has no auth check** — workflows can be read/written by anyone  
  File: `src/app/api/workflow/route.ts`

- [ ] **`/api/list-workflows` has no auth check**  
  File: `src/app/api/list-workflows/route.ts`

---

## 🟢 LOW — Nice to Have

- [ ] **Email verification on signup** — users can sign up with fake emails  
  Fix: Add WP email verification flow

- [ ] **Password strength indicator** on signup page

- [ ] **"Remember me" on signin doesn't actually do anything** — checkbox state is never used  
  File: `src/app/auth/signin/page.tsx`

- [ ] **Onboarding doesn't mark `onboarding_done` in WP** — users see it every time  
  Fix: Call `wpUpdateUserMeta` with `{ onboarding_done: true }` on completion

- [ ] **`/examples` page content** — check if it has real content or is a placeholder

- [ ] **Footer links** — Privacy and Terms pages exist but footer links use `#`  
  File: `src/app/landing/page.tsx` footer section

- [ ] **`/contact` form doesn't actually send** — `handleSubmit` just sets `submitted = true`  
  File: `src/app/contact/page.tsx`  
  Fix: Wire to WP email endpoint or a form service

- [ ] **Blog newsletter subscribe form** doesn't do anything  
  File: `src/app/blog/page.tsx`

- [ ] **`src/app/api/images/[id]/` directory is empty** — dead route

- [ ] **`src/app/api/providers/` directory** — check if fal/replicate subdirs have routes

- [ ] **`src/app/api/workflow-images/` route** — check if it's used or orphaned

- [ ] **`src/app/api/load-generation/` route** — check if it's used or orphaned

- [ ] **Add `Content-Security-Policy` header** for XSS protection

- [ ] **Add `X-Frame-Options: DENY`** to prevent clickjacking

- [ ] **Error page** — `/auth/error` is referenced in `src/lib/auth.ts` but may not exist

---

## ✅ ALREADY FIXED

- [x] `/api/test-db` public debug endpoint — deleted
- [x] `/api/env-status` leaking API key info — now admin-only
- [x] `/auth/forgot-password` 404 — page created
- [x] `/gallery` 404 — full gallery page built
- [x] `/profile` 404 — redirects to settings
- [x] Rate limiting bypassed without Redis — now enforces 10/hr fallback in production
- [x] Dockerfile `prisma db push` (destructive) — changed to `prisma migrate deploy`
- [x] Docker health check missing — added HEALTHCHECK + `/api/health` endpoint
- [x] `WP_API_SECRET` empty string allowed — extracted to constant
- [x] Hardcoded WordPress URL fallback — removed
- [x] 18 API route files with `console.log` — stripped
- [x] Missing env vars in `.env.example` — added Google OAuth, DB, Cloudflare, WC, Redis
- [x] No `robots.txt` or `sitemap.xml` — both created
- [x] `.env` in `.gitignore` — confirmed
