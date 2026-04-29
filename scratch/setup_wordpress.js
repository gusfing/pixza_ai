/**
 * WordPress Setup Script
 * Run: node scratch/setup_wordpress.js
 * 
 * This script:
 * 1. Tests WordPress connectivity
 * 2. Checks if JWT plugin is active
 * 3. Checks if Pixza plugin is active
 * 4. Creates a test user
 * 5. Tests the full auth flow
 */

const WP_URL = "https://seashell-peafowl-234313.hostingersite.com";
const WP_SECRET = "pixza_secret_key_2026_abc123";

async function test(label, fn) {
  try {
    const result = await fn();
    console.log(`✅ ${label}:`, typeof result === "object" ? JSON.stringify(result).slice(0, 120) : result);
    return result;
  } catch (e) {
    console.log(`❌ ${label}:`, e.message);
    return null;
  }
}

async function main() {
  console.log("\n=== WordPress Connectivity Test ===\n");

  // 1. Basic REST API
  await test("WP REST API", async () => {
    const r = await fetch(`${WP_URL}/wp-json`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const d = await r.json();
    return `v${d.version || "?"} - ${d.name}`;
  });

  // 2. JWT plugin
  await test("JWT Auth plugin", async () => {
    const r = await fetch(`${WP_URL}/wp-json/jwt-auth/v1/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "wronguser", password: "wrongpass" }),
    });
    const d = await r.json();
    // 403 with "incorrect_password" or "invalid_username" means JWT is working
    if (d.code === "incorrect_password" || d.code === "invalid_username" || d.code === "[jwt_auth] incorrect_password") {
      return "JWT plugin active (auth error expected)";
    }
    if (r.status === 403 && d.code) return `JWT active, code: ${d.code}`;
    throw new Error(`Unexpected: ${r.status} ${JSON.stringify(d).slice(0,80)}`);
  });

  // 3. Pixza plugin
  await test("Pixza plugin", async () => {
    const r = await fetch(`${WP_URL}/wp-json/pixza/v1/credits`, {
      headers: { "X-WP-Secret": WP_SECRET },
    });
    if (r.status === 401) return "Plugin active (auth required)";
    if (r.status === 404) throw new Error("Plugin NOT installed - upload wordpress-plugin/pixza-subscriptions/ to wp-content/plugins/");
    const d = await r.json();
    return `Plugin active: ${JSON.stringify(d).slice(0,80)}`;
  });

  // 4. Admin stats (tests WP_API_SECRET)
  await test("Admin stats (WP_API_SECRET)", async () => {
    const r = await fetch(`${WP_URL}/wp-json/pixza/v1/admin/stats`, {
      headers: { "X-WP-Secret": WP_SECRET },
    });
    if (r.status === 404) throw new Error("Pixza plugin not installed");
    if (r.status === 403) throw new Error("WP_API_SECRET mismatch");
    return await r.json();
  });

  console.log("\n=== Setup Instructions ===\n");
  console.log("1. Upload wordpress-plugin/pixza-subscriptions/ to your WordPress wp-content/plugins/");
  console.log("2. Activate the plugin in WP Admin > Plugins");
  console.log("3. Go to WP Admin > Pixza > Settings and copy the API Secret to .env as WP_API_SECRET");
  console.log("4. Make sure JWT Authentication for WP REST API plugin is installed and active");
  console.log("5. Add to wp-config.php BEFORE require_once ABSPATH . 'wp-settings.php':");
  console.log("   define('JWT_AUTH_SECRET_KEY', 'your-secret-key-here');");
  console.log("   define('JWT_AUTH_CORS_ENABLE', true);");
  console.log("\nPlugin file location: wordpress-plugin/pixza-subscriptions/pixza-subscriptions.php");
}

main().catch(console.error);
