# Pixza Studio — Production Deployment

## Stack
- **Framework**: Next.js 16 (App Router)
- **Auth**: NextAuth v5 (Google OAuth + credentials)
- **Database**: PostgreSQL via Prisma (Neon / Supabase / Railway)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Rate limiting**: Upstash Redis
- **Payments**: Stripe
- **Hosting**: Vercel (recommended)

---

## 1. Database

```bash
# Create a free PostgreSQL DB at https://neon.tech
# Copy the connection string to DATABASE_URL in .env.local

# Run migrations
npx prisma migrate deploy

# Or in development
npx prisma migrate dev --name init
```

## 2. Auth secret

```bash
# Generate a secure secret
openssl rand -base64 32
# → paste into AUTH_SECRET
```

## 3. Google OAuth

1. Go to https://console.cloud.google.com → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`
4. Copy Client ID and Secret to env

## 4. Cloudflare R2

1. Create bucket at https://dash.cloudflare.com → R2
2. Create API token with Object Read & Write
3. Set bucket CORS to allow your domain
4. Add a custom domain for public access (R2_PUBLIC_URL)

## 5. Upstash Redis

1. Create free Redis at https://upstash.com
2. Copy REST URL and token

## 6. Stripe

```bash
# Install Stripe CLI for local webhook testing
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Create a product + price in Stripe dashboard
# Copy price ID to STRIPE_PRO_PRICE_ID
```

## 7. Deploy to Vercel

```bash
npm i -g vercel
vercel --prod

# Set all env vars in Vercel dashboard or:
vercel env add DATABASE_URL
vercel env add AUTH_SECRET
# ... etc
```

## 8. Post-deploy

```bash
# Run DB migrations on production
npx prisma migrate deploy
```

---

## Local development

```bash
cp .env.example .env.local
# Fill in at minimum: DATABASE_URL, AUTH_SECRET, GEMINI_API_KEY

npx prisma migrate dev --name init
npm run dev
```
