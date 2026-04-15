<?php
/**
 * Plugin Name: Pixza Studio Backend
 * Plugin URI: https://pixzastudio.com
 * Description: REST API endpoints for Pixza Studio - auth, subscriptions, generations, email, API keys
 * Version: 1.1.0
 * Author: Lekh Labs
 * Author URI: https://lekhlabs.com
 * License: GPL2
 */

if (!defined('ABSPATH')) exit;

define('PIXZA_VERSION', '1.1.0');
define('PIXZA_SECRET', get_option('pixza_api_secret', ''));

// ── Register REST routes ──────────────────────────────────────
add_action('rest_api_init', function () {
    $ns = 'pixza/v1';

    register_rest_route($ns, '/register', [
        'methods'             => 'POST',
        'callback'            => 'pixza_register_user',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route($ns, '/api-keys', [
        ['methods' => 'GET',    'callback' => 'pixza_get_api_keys',   'permission_callback' => 'pixza_auth'],
        ['methods' => 'POST',   'callback' => 'pixza_save_api_key',   'permission_callback' => 'pixza_auth'],
        ['methods' => 'DELETE', 'callback' => 'pixza_delete_api_key', 'permission_callback' => 'pixza_auth'],
    ]);

    register_rest_route($ns, '/subscription',        ['methods' => 'GET',  'callback' => 'pixza_get_subscription',    'permission_callback' => 'pixza_auth']);
    register_rest_route($ns, '/subscription/cancel', ['methods' => 'POST', 'callback' => 'pixza_cancel_subscription', 'permission_callback' => 'pixza_auth']);
    register_rest_route($ns, '/checkout',            ['methods' => 'POST', 'callback' => 'pixza_create_checkout',     'permission_callback' => 'pixza_auth']);

    register_rest_route($ns, '/coupons/validate', [
        'methods'             => 'POST',
        'callback'            => 'pixza_validate_coupon',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route($ns, '/generations', [
        ['methods' => 'GET',  'callback' => 'pixza_get_generations', 'permission_callback' => 'pixza_auth'],
        ['methods' => 'POST', 'callback' => 'pixza_save_generation', 'permission_callback' => 'pixza_auth'],
    ]);

    register_rest_route($ns, '/email/send', [
        'methods'             => 'POST',
        'callback'            => 'pixza_send_email',
        'permission_callback' => 'pixza_server_auth',
    ]);

    // Blog posts (public read, server-auth write)
    register_rest_route($ns, '/posts', [
        ['methods' => 'GET',  'callback' => 'pixza_get_posts',    'permission_callback' => '__return_true'],
        ['methods' => 'POST', 'callback' => 'pixza_create_post',  'permission_callback' => 'pixza_server_auth'],
    ]);
    register_rest_route($ns, '/posts/(?P<slug>[a-z0-9-]+)', [
        'methods'             => 'GET',
        'callback'            => 'pixza_get_post',
        'permission_callback' => '__return_true',
    ]);
});

// ── Auth helpers ──────────────────────────────────────────────

function pixza_get_bearer_token(WP_REST_Request $req): string {
    // 1. Standard Authorization header
    $auth = $req->get_header('Authorization') ?? '';

    // 2. Server vars (some hosts rename it)
    if (empty($auth)) $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($auth)) $auth = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (empty($auth)) $auth = $_SERVER['HTTP_X_AUTHORIZATION'] ?? '';

    // 3. Query param fallback for hosts that strip Authorization header (Hostinger shared)
    if (empty($auth) && !empty($_GET['_pixza_token'])) {
        $auth = 'Bearer ' . sanitize_text_field($_GET['_pixza_token']);
    }

    if (preg_match('/Bearer\s+(.+)/i', $auth, $m)) {
        return trim($m[1]);
    }
    return '';
}

function pixza_resolve_user_from_token(WP_REST_Request $req): bool {
    if (is_user_logged_in()) return true;

    $token  = pixza_get_bearer_token($req);
    if (empty($token)) return false;

    $secret = defined('JWT_AUTH_SECRET_KEY') ? JWT_AUTH_SECRET_KEY : '';
    if (empty($secret)) return false;

    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;

    $payload = json_decode(
        base64_decode(str_pad(strtr($parts[1], '-_', '+/'), strlen($parts[1]) % 4, '=', STR_PAD_RIGHT)),
        true
    );

    if (empty($payload['data']['user']['id'])) return false;

    wp_set_current_user((int) $payload['data']['user']['id']);
    return is_user_logged_in();
}

function pixza_auth(WP_REST_Request $req): bool {
    return pixza_resolve_user_from_token($req);
}

function pixza_server_auth(WP_REST_Request $req): bool {
    return $req->get_header('X-WP-Secret') === PIXZA_SECRET;
}

// ── Register user ─────────────────────────────────────────────
function pixza_register_user(WP_REST_Request $req) {
    $data     = $req->get_json_params();
    $username = sanitize_user($data['username'] ?? '');
    $email    = sanitize_email($data['email'] ?? '');
    $password = $data['password'] ?? '';
    $name     = sanitize_text_field($data['name'] ?? $username);

    if (!$username || !$email || !$password) {
        return new WP_Error('missing_fields', 'username, email and password required', ['status' => 400]);
    }
    if (username_exists($username) || email_exists($email)) {
        return new WP_Error('user_exists', 'Username or email already in use', ['status' => 409]);
    }

    $user_id = wp_create_user($username, $password, $email);
    if (is_wp_error($user_id)) return $user_id;

    wp_update_user(['ID' => $user_id, 'display_name' => $name, 'first_name' => $name]);
    update_user_meta($user_id, 'pixza_plan', 'free');

    pixza_trigger_email($email, $name, 'welcome');

    return rest_ensure_response(['id' => $user_id, 'username' => $username, 'email' => $email]);
}

// ── API Keys ──────────────────────────────────────────────────
function pixza_get_api_keys(WP_REST_Request $req) {
    $user_id = get_current_user_id();
    $raw     = get_user_meta($user_id, 'pixza_api_keys', true) ?: [];
    $masked  = [];
    foreach ($raw as $provider => $key) {
        $masked[$provider] = str_repeat('*', max(0, strlen($key) - 4)) . substr($key, -4);
    }
    return rest_ensure_response(['keys' => $masked]);
}

function pixza_save_api_key(WP_REST_Request $req) {
    $user_id  = get_current_user_id();
    $provider = sanitize_text_field($req->get_param('provider'));
    $key      = sanitize_text_field($req->get_param('key'));
    $keys     = get_user_meta($user_id, 'pixza_api_keys', true) ?: [];
    $keys[$provider] = $key;
    update_user_meta($user_id, 'pixza_api_keys', $keys);
    return rest_ensure_response(['success' => true]);
}

function pixza_delete_api_key(WP_REST_Request $req) {
    $user_id  = get_current_user_id();
    $provider = sanitize_text_field($req->get_param('provider'));
    $keys     = get_user_meta($user_id, 'pixza_api_keys', true) ?: [];
    unset($keys[$provider]);
    update_user_meta($user_id, 'pixza_api_keys', $keys);
    return rest_ensure_response(['success' => true]);
}

// ── Subscription ──────────────────────────────────────────────
function pixza_get_subscription(WP_REST_Request $req) {
    $user_id = get_current_user_id();
    $plan    = get_user_meta($user_id, 'pixza_plan', true) ?: 'free';

    if (function_exists('wcs_get_users_subscriptions')) {
        foreach (wcs_get_users_subscriptions($user_id) as $sub) {
            if ($sub->has_status('active')) {
                return rest_ensure_response([
                    'id'           => $sub->get_id(),
                    'status'       => 'active',
                    'plan'         => $plan,
                    'next_payment' => $sub->get_date('next_payment'),
                ]);
            }
        }
    }
    return rest_ensure_response(['plan' => $plan, 'status' => 'active', 'next_payment' => '']);
}

function pixza_create_checkout(WP_REST_Request $req) {
    $user_id    = get_current_user_id();
    $plan       = sanitize_text_field($req->get_param('plan'));
    $coupon     = sanitize_text_field($req->get_param('coupon') ?? '');
    $product_ids = [
        'pro'    => get_option('pixza_pro_product_id'),
        'agency' => get_option('pixza_agency_product_id'),
    ];
    $product_id = $product_ids[$plan] ?? null;
    if (!$product_id) return new WP_Error('invalid_plan', 'Invalid plan', ['status' => 400]);

    $url = add_query_arg([
        'add-to-cart' => $product_id,
        'quantity'    => 1,
        'coupon_code' => $coupon,
    ], function_exists('wc_get_checkout_url') ? wc_get_checkout_url() : home_url('/checkout'));

    return rest_ensure_response(['checkout_url' => $url]);
}

function pixza_cancel_subscription(WP_REST_Request $req) {
    $user_id = get_current_user_id();
    if (function_exists('wcs_get_users_subscriptions')) {
        foreach (wcs_get_users_subscriptions($user_id) as $sub) {
            if ($sub->has_status('active')) $sub->cancel_order();
        }
    }
    update_user_meta($user_id, 'pixza_plan', 'free');
    return rest_ensure_response(['success' => true]);
}

// ── Coupons ───────────────────────────────────────────────────
function pixza_validate_coupon(WP_REST_Request $req) {
    if (!class_exists('WC_Coupon')) {
        return new WP_Error('no_woocommerce', 'WooCommerce not active', ['status' => 503]);
    }
    $code   = sanitize_text_field($req->get_param('code'));
    $coupon = new WC_Coupon($code);
    if (!$coupon->get_id()) return new WP_Error('invalid', 'Invalid coupon', ['status' => 404]);
    return rest_ensure_response([
        'code'          => $code,
        'discount_type' => $coupon->get_discount_type(),
        'amount'        => $coupon->get_amount(),
        'description'   => $coupon->get_description(),
        'expiry_date'   => $coupon->get_date_expires() ? $coupon->get_date_expires()->date('Y-m-d') : null,
    ]);
}

// ── Generations ───────────────────────────────────────────────
function pixza_get_generations(WP_REST_Request $req) {
    $user_id = get_current_user_id();
    $page    = max(1, (int) ($req->get_param('page') ?? 1));
    $per     = min(50, (int) ($req->get_param('per_page') ?? 20));

    $query = new WP_Query([
        'post_type'      => 'pixza_generation',
        'author'         => $user_id,
        'posts_per_page' => $per,
        'paged'          => $page,
        'post_status'    => 'publish',
        'orderby'        => 'date',
        'order'          => 'DESC',
    ]);

    $items = array_map(function ($post) {
        return [
            'id'         => $post->ID,
            'prompt'     => get_post_meta($post->ID, 'prompt', true),
            'output_url' => get_post_meta($post->ID, 'output_url', true),
            'mode'       => get_post_meta($post->ID, 'mode', true),
            'model'      => get_post_meta($post->ID, 'model', true),
            'created_at' => $post->post_date,
        ];
    }, $query->posts);

    return rest_ensure_response(['items' => $items, 'total' => $query->found_posts]);
}

function pixza_save_generation(WP_REST_Request $req) {
    $user_id = get_current_user_id();
    $data    = $req->get_json_params();

    $post_id = wp_insert_post([
        'post_type'   => 'pixza_generation',
        'post_status' => 'publish',
        'post_author' => $user_id,
        'post_title'  => substr($data['prompt'] ?? 'Generation', 0, 80),
    ]);

    if (is_wp_error($post_id)) return $post_id;

    foreach (['prompt', 'mode', 'model', 'provider', 'output_url', 'output_type', 'status'] as $key) {
        if (isset($data[$key])) update_post_meta($post_id, $key, sanitize_text_field($data[$key]));
    }

    $count = (int) get_user_meta($user_id, 'pixza_generations_count', true);
    update_user_meta($user_id, 'pixza_generations_count', $count + 1);

    return rest_ensure_response(['id' => $post_id]);
}

// ── Email ─────────────────────────────────────────────────────
function pixza_send_email(WP_REST_Request $req) {
    $data     = $req->get_json_params();
    $to       = sanitize_email($data['to'] ?? '');
    $template = sanitize_text_field($data['template'] ?? '');
    $vars     = $data['vars'] ?? [];
    if (!$to) return new WP_Error('missing_to', 'Email required', ['status' => 400]);
    pixza_trigger_email($to, $vars['name'] ?? '', $template, $vars);
    return rest_ensure_response(['success' => true]);
}

function pixza_trigger_email(string $to, string $name, string $template, array $vars = []) {
    $templates = [
        'welcome'         => ['subject' => 'Welcome to Pixza Studio!',   'body' => pixza_email_welcome($name)],
        'upgrade'         => ['subject' => "You're now on Pro!",          'body' => pixza_email_upgrade($name)],
        'reset_password'  => ['subject' => 'Reset your Pixza password',   'body' => pixza_email_reset($vars['link'] ?? '')],
        'generation_done' => ['subject' => 'Your generation is ready',    'body' => pixza_email_generation($vars['url'] ?? '')],
        'weekly_digest'   => ['subject' => 'Your Pixza weekly digest',    'body' => pixza_email_digest($name)],
    ];
    $tpl = $templates[$template] ?? null;
    if (!$tpl) return;
    $headers = ['Content-Type: text/html; charset=UTF-8', 'From: Pixza Studio <noreply@pixzastudio.com>'];
    wp_mail($to, $tpl['subject'], $tpl['body'], $headers);
}

function pixza_email_base(string $content): string {
    return '<!DOCTYPE html><html><body style="margin:0;padding:0;background:#040406;font-family:Inter,system-ui,sans-serif;"><div style="max-width:560px;margin:40px auto;background:#0e0e10;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;"><div style="background:linear-gradient(135deg,#92dce5,#d64933);padding:24px;text-align:center;"><span style="font-size:20px;font-weight:700;color:#080808;">Pixza Studio</span></div><div style="padding:32px;color:#eee5e9;">' . $content . '</div><div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);font-size:12px;color:rgba(238,229,233,0.3);text-align:center;">2025 Pixza Studio by Lekh Labs</div></div></body></html>';
}

function pixza_email_welcome(string $name): string {
    return pixza_email_base('<h2 style="margin:0 0 16px;font-size:22px;">Welcome, ' . esc_html($name) . '!</h2><p style="color:rgba(238,229,233,0.6);line-height:1.6;">Your Pixza Studio account is ready. Start creating AI-powered images, videos, and 3D models.</p><a href="https://pixzastudio.com/create" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#92dce5;color:#080808;border-radius:10px;font-weight:700;text-decoration:none;">Start Creating</a>');
}

function pixza_email_upgrade(string $name): string {
    return pixza_email_base('<h2 style="margin:0 0 16px;font-size:22px;">You\'re on Pro, ' . esc_html($name) . '!</h2><p style="color:rgba(238,229,233,0.6);line-height:1.6;">200 generations/day, all models, priority queue.</p><a href="https://pixzastudio.com/create" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#92dce5;color:#080808;border-radius:10px;font-weight:700;text-decoration:none;">Start Generating</a>');
}

function pixza_email_reset(string $link): string {
    return pixza_email_base('<h2 style="margin:0 0 16px;font-size:22px;">Reset your password</h2><p style="color:rgba(238,229,233,0.6);line-height:1.6;">Click below to reset. Link expires in 1 hour.</p><a href="' . esc_url($link) . '" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#d64933;color:#fff;border-radius:10px;font-weight:700;text-decoration:none;">Reset Password</a>');
}

function pixza_email_generation(string $url): string {
    return pixza_email_base('<h2 style="margin:0 0 16px;font-size:22px;">Your generation is ready</h2>' . ($url ? '<img src="' . esc_url($url) . '" style="width:100%;border-radius:10px;margin:16px 0;">' : '') . '<a href="https://pixzastudio.com/create" style="display:inline-block;padding:12px 28px;background:#92dce5;color:#080808;border-radius:10px;font-weight:700;text-decoration:none;">View Result</a>');
}

function pixza_email_digest(string $name): string {
    return pixza_email_base('<h2 style="margin:0 0 16px;font-size:22px;">Weekly digest, ' . esc_html($name) . '</h2><p style="color:rgba(238,229,233,0.6);line-height:1.6;">New models, templates, and community workflows this week.</p><a href="https://pixzastudio.com/examples" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#92dce5;color:#080808;border-radius:10px;font-weight:700;text-decoration:none;">Explore</a>');
}

// ── Blog posts ────────────────────────────────────────────────
function pixza_get_posts(WP_REST_Request $req) {
    $per_page = min(20, (int)($req->get_param('per_page') ?? 6));
    $page     = max(1,  (int)($req->get_param('page') ?? 1));
    $search   = sanitize_text_field($req->get_param('search') ?? '');

    $args = [
        'post_type'      => 'post',
        'post_status'    => 'publish',
        'posts_per_page' => $per_page,
        'paged'          => $page,
        'orderby'        => 'date',
        'order'          => 'DESC',
    ];
    if ($search) $args['s'] = $search;

    $query = new WP_Query($args);
    $items = array_map('pixza_format_post', $query->posts);

    return rest_ensure_response([
        'items' => $items,
        'total' => $query->found_posts,
        'pages' => $query->max_num_pages,
    ]);
}

function pixza_get_post(WP_REST_Request $req) {
    $slug = $req->get_param('slug');
    $posts = get_posts(['name' => $slug, 'post_type' => 'post', 'post_status' => 'publish', 'numberposts' => 1]);
    if (empty($posts)) return new WP_Error('not_found', 'Post not found', ['status' => 404]);
    return rest_ensure_response(pixza_format_post($posts[0], true));
}

function pixza_create_post(WP_REST_Request $req) {
    $data    = $req->get_json_params();
    $post_id = wp_insert_post([
        'post_title'   => sanitize_text_field($data['title'] ?? ''),
        'post_name'    => sanitize_title($data['slug'] ?? ''),
        'post_content' => wp_kses_post($data['content'] ?? ''),
        'post_excerpt' => sanitize_text_field($data['excerpt'] ?? ''),
        'post_status'  => 'publish',
        'post_author'  => 1,
    ]);
    if (is_wp_error($post_id)) return $post_id;
    return rest_ensure_response(['id' => $post_id]);
}

function pixza_format_post(WP_Post $post, bool $full = false): array {
    $thumbnail = get_the_post_thumbnail_url($post->ID, 'large') ?: '';
    $author    = get_userdata($post->post_author);
    $cats      = wp_get_post_categories($post->ID, ['fields' => 'names']);

    $data = [
        'id'         => $post->ID,
        'slug'       => $post->post_name,
        'title'      => $post->post_title,
        'excerpt'    => wp_strip_all_tags($post->post_excerpt ?: wp_trim_words($post->post_content, 25)),
        'thumbnail'  => $thumbnail,
        'author'     => $author ? $author->display_name : 'Pixza Team',
        'date'       => $post->post_date,
        'categories' => $cats,
        'read_time'  => max(1, (int)(str_word_count(strip_tags($post->post_content)) / 200)) . ' min read',
    ];

    if ($full) {
        $data['content'] = apply_filters('the_content', $post->post_content);
    }

    return $data;
}

// ── Register CPTs ─────────────────────────────────────────────
add_action('init', function () {
    register_post_type('pixza_generation', [
        'public'       => false,
        'show_ui'      => true,
        'label'        => 'Generations',
        'supports'     => ['title', 'author', 'custom-fields'],
        'show_in_rest' => false,
    ]);
    register_post_type('pixza_template', [
        'public'       => true,
        'show_ui'      => true,
        'label'        => 'Templates',
        'supports'     => ['title', 'thumbnail', 'custom-fields'],
        'show_in_rest' => true,
        'rest_base'    => 'pixza_template',
    ]);
});

// ── WooCommerce hooks ─────────────────────────────────────────
add_action('woocommerce_subscription_status_active', function ($subscription) {
    $user_id = $subscription->get_user_id();
    foreach ($subscription->get_items() as $item) {
        $pid = $item->get_product_id();
        if ($pid == get_option('pixza_pro_product_id'))    update_user_meta($user_id, 'pixza_plan', 'pro');
        if ($pid == get_option('pixza_agency_product_id')) update_user_meta($user_id, 'pixza_plan', 'agency');
    }
    $user = get_userdata($user_id);
    if ($user) pixza_trigger_email($user->user_email, $user->display_name, 'upgrade');
});

add_action('woocommerce_subscription_status_cancelled', function ($subscription) {
    update_user_meta($subscription->get_user_id(), 'pixza_plan', 'free');
});

// ── Admin settings ────────────────────────────────────────────
add_action('admin_menu', function () {
    add_options_page('Pixza Studio', 'Pixza Studio', 'manage_options', 'pixza-settings', 'pixza_settings_page');
});

function pixza_settings_page() {
    if (isset($_POST['pixza_save'])) {
        update_option('pixza_api_secret',        sanitize_text_field($_POST['pixza_api_secret']));
        update_option('pixza_pro_product_id',    (int) $_POST['pixza_pro_product_id']);
        update_option('pixza_agency_product_id', (int) $_POST['pixza_agency_product_id']);
        echo '<div class="notice notice-success"><p>Saved.</p></div>';
    }
    $s  = get_option('pixza_api_secret', '');
    $p  = get_option('pixza_pro_product_id', '');
    $a  = get_option('pixza_agency_product_id', '');
    echo '<div class="wrap"><h1>Pixza Studio Settings</h1><form method="post"><table class="form-table">
    <tr><th>API Secret</th><td><input name="pixza_api_secret" value="' . esc_attr($s) . '" class="regular-text"></td></tr>
    <tr><th>Pro Product ID</th><td><input name="pixza_pro_product_id" value="' . esc_attr($p) . '" class="small-text"></td></tr>
    <tr><th>Agency Product ID</th><td><input name="pixza_agency_product_id" value="' . esc_attr($a) . '" class="small-text"></td></tr>
    </table><p><input type="submit" name="pixza_save" class="button-primary" value="Save Settings"></p></form></div>';
}
