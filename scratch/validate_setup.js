
const WP_URL = process.env.NEXT_PUBLIC_WP_URL;
const WC_KEY = process.env.WC_CONSUMER_KEY;
const WC_SECRET = process.env.WC_CONSUMER_SECRET;
const WP_SECRET = process.env.WP_API_SECRET;

async function testSetup() {
  console.log('--- Pixza Studio Setup Validation ---');
  console.log('WP URL:', WP_URL);

  // 1. Test WordPress Public API
  try {
    const res = await fetch(`${WP_URL}/wp-json/wp/v2/pixza_template?per_page=1`);
    if (res.ok) {
        const data = await res.json();
        console.log('✅ WordPress Public API: OK (Found ' + data.length + ' templates)');
    } else {
        console.log('❌ WordPress Public API: FAILED', res.status);
    }
  } catch (e) {
    console.log('❌ WordPress Public API: ERROR', e.message);
  }

  // 2. Test WooCommerce API (Basic Auth)
  try {
    const auth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');
    const res = await fetch(`${WP_URL}/wp-json/wc/v3/products?per_page=1`, {
        headers: {
            'Authorization': `Basic ${auth}`
        }
    });
    if (res.ok) {
        const data = await res.json();
        console.log('✅ WooCommerce API: OK (Authenticated successfully)');
    } else {
        const err = await res.json();
        console.log('❌ WooCommerce API: FAILED', res.status, err.message);
    }
  } catch (e) {
    console.log('❌ WooCommerce API: ERROR', e.message);
  }

  // 3. Test WordPress Secret (if applicable)
  // The code uses WP_API_SECRET for email sending
  if (WP_SECRET) {
    console.log('✅ WordPress Secret Key: Present in .env');
  } else {
    console.log('❌ WordPress Secret Key: MISSING in .env');
  }

  // 4. Test AI Keys
  const aiKeys = ['GEMINI_API_KEY', 'FAL_API_KEY', 'REPLICATE_API_KEY'];
  aiKeys.forEach(k => {
    if (process.env[k]) {
        console.log(`✅ ${k}: OK (Present)`);
    } else {
        console.log(`⚠️ ${k}: MISSING (You might need to add this for AI features)`);
    }
  });

  console.log('--------------------------------------');
}

testSetup();
