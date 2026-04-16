# Pixza Studio — Master Setup & Deployment Guide

Welcome to the **Pixza Studio** master guide. This document covers everything you need to set up the WordPress backend, deploy the AI engine to a VPS via Coolify, and configure cloud storage.

---

## 🏗️ Part 1: WordPress Backend Setup

Node Banana (Pixza Studio) uses WordPress as the source of truth for users and subscriptions.

### 1. Requirements
- A WordPress site (e.g., Hostinger WordPress).
- Plugin: **JWT Authentication for WP REST API** (by Enrique Chavez).
- Plugin: **Pixza Studio Plugin** (found in `/wordpress-plugin`).

### 2. Configuration
Add these lines to your `wp-config.php`:
```php
define('JWT_AUTH_SECRET_KEY', 'your-secure-jwt-secret');
define('JWT_AUTH_CORS_ENABLE', true);
```

Add these lines to your `.htaccess`:
```apache
RewriteEngine on
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]
```

---

## 🚀 Part 2: Deployment via Coolify

We recommend using the **Dockerfile** build pack for maximum stability.

### 1. Setup Resource
1. Create a **New Resource** → **Public/Private Repository**.
2. Select branch `master`.
3. Set **Build Pack** to `Dockerfile`.
4. Set **Port** to `3000`.

### 2. Environment Variables (Required)
| Key | Description |
| :--- | :--- |
| `DATABASE_URL` | Your Neon/PostgreSQL connection string. |
| `NEXT_PUBLIC_WP_URL` | Your WordPress site URL (no trailing slash). |
| `WP_API_SECRET` | Matches the secret in your WP Pixza Studio plugin settings. |
| `NEXT_PUBLIC_APP_URL` | The URL where the app is hosted (e.g., your sslip.io or domain). |
| `NEXTAUTH_SECRET` | A random secure string for session integrity. |
| `GEMINI_API_KEY` | Required for AI generation and workflow tools. |

### 3. Persistent Storage
Ensure your generated images persist across deployments:
1. Go to **Storage** tab.
2. Add a Volume:
   - **Mount Path**: `/app/storage`
   - **Name**: `node-banana-media`

---

## ☁️ Part 3: S3 Cloud Storage (MinIO / Garage / R2)

If you prefer cloud storage over local disk:
1. Set up a bucket in MinIO or Cloudflare R2.
2. Add these environment variables to Coolify:
   - `R2_ACCESS_KEY_ID`: Your Access Key.
   - `R2_SECRET_ACCESS_KEY`: Your Secret Key.
   - `R2_BUCKET_NAME`: Your bucket name.
   - `R2_ENDPOINT`: Your S3 endpoint (e.g., `https://...`).
   - `R2_PUBLIC_URL`: The public URL to view the files.

The app will automatically switch from local disk to S3 when these variables are detected.

---

## 👨‍💼 Part 4: Promoting an Admin
Once the app is running, you need an Admin account to manage it.
1. Sign up on the app via your WordPress account.
2. SSH into your VPS and use Docker to run the promotion script:
   ```bash
   docker exec -it <container_name> node scripts/promote_admin.js your@email.com
   ```

---

## 🐞 Support & Troubleshooting
- **404 Errors**: Ensure the port is set to `3000` and `HOSTNAME` is `0.0.0.0` in your Docker config.
- **Login Issues**: Check CORS settings on your WordPress site to allow your app's domain.
