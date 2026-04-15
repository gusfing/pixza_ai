# WordPress Setup for Pixza Studio

**Site:** https://seashell-peafowl-234313.hostingersite.com  
**Admin:** https://seashell-peafowl-234313.hostingersite.com/wp-admin

---

## Step 1 — Install JWT Authentication plugin

1. Go to **wp-admin → Plugins → Add New**
2. Search: `JWT Authentication for WP REST API`
3. Install & Activate (by Enrique Chavez)

Then add to `wp-config.php` (via Hostinger File Manager → `public_html/wp-config.php`):

```php
define('JWT_AUTH_SECRET_KEY', 'pixza-jwt-secret-change-this-in-production');
define('JWT_AUTH_CORS_ENABLE', true);
```

Also add to `.htaccess` (same folder):

```apache
RewriteEngine on
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]
```

---

## Step 2 — Install Pixza Studio plugin

1. Go to **wp-admin → Plugins → Add New → Upload Plugin**
2. Upload: `wordpress-plugin/pixza-studio.zip` ← ready to upload
3. Click **Install Now** → **Activate Plugin**

---

## Step 3 — Configure plugin

Go to **wp-admin → Settings → Pixza Studio**:

| Field | Value |
|-------|-------|
| API Secret | `pixza-secret-2025` (copy to `.env` as `WP_API_SECRET`) |
| Pro Product ID | (set after creating WooCommerce product) |
| Agency Product ID | (set after creating WooCommerce product) |

---

## Step 4 — Install WooCommerce (for subscriptions)

1. **Plugins → Add New** → search `WooCommerce` → Install & Activate
2. Run setup wizard
3. **Products → Add New** → create "Pixza Pro" subscription product ($9/mo)
4. Copy product ID to plugin settings

---

## Step 5 — Configure CORS

Add to `wp-config.php`:

```php
// Allow Next.js frontend
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Secret");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
```

Or install **WP CORS** plugin for easier management.

---

## Step 6 — Test the connection

Once done, these endpoints should work:

```bash
# Test JWT login
curl -X POST https://seashell-peafowl-234313.hostingersite.com/wp-json/jwt-auth/v1/token \
  -H "Content-Type: application/json" \
  -d '{"username":"ks05460@gmail.com","password":"YOUR_PASSWORD"}'

# Test Pixza namespace
curl https://seashell-peafowl-234313.hostingersite.com/wp-json/pixza/v1/
```

---

## Current Status

| Component | Status |
|-----------|--------|
| WordPress REST API | ✅ Live |
| JWT Auth plugin | ❌ Not installed |
| Pixza Studio plugin | ❌ Not installed |
| WooCommerce | ❌ Not installed |
| CORS configured | ❌ Pending |
