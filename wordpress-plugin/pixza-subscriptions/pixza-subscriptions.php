<?php
/**
 * Plugin Name: Pixza Subscriptions
 * Description: Manages Pixza AI subscriptions, credits, token usage, and admin dashboard.
 * Version: 1.0.0
 * Author: Pixza
 * Text Domain: pixza
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'PIXZA_VERSION', '1.0.0' );
define( 'PIXZA_SECRET', defined('PIXZA_API_SECRET') ? PIXZA_API_SECRET : get_option('pixza_api_secret', '') );

// ── Activation: create tables & set defaults ─────────────────
register_activation_hook( __FILE__, 'pixza_activate' );
function pixza_activate() {
    global $wpdb;
    $charset = $wpdb->get_charset_collate();

    // Token usage log table
    $sql = "CREATE TABLE IF NOT EXISTS {$wpdb->prefix}pixza_usage (
        id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id     BIGINT UNSIGNED NOT NULL,
        action      VARCHAR(64)  NOT NULL,
        model       VARCHAR(128) NOT NULL DEFAULT '',
        provider    VARCHAR(64)  NOT NULL DEFAULT '',
        credits     INT          NOT NULL DEFAULT 1,
        prompt      TEXT,
        created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_created (created_at)
    ) $charset;";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta( $sql );

    // Default plan credit limits stored as option
    add_option( 'pixza_plan_credits', json_encode([
        'free'   => 50,
        'pro'    => 2000,
        'agency' => 10000,
    ]));
    add_option( 'pixza_api_secret', wp_generate_password(32, false) );
}

// ── REST API ─────────────────────────────────────────────────
add_action( 'rest_api_init', 'pixza_register_routes' );
function pixza_register_routes() {
    $ns = 'pixza/v1';

    // Public: register
    register_rest_route( $ns, '/register', [
        'methods'             => 'POST',
        'callback'            => 'pixza_register_user',
        'permission_callback' => '__return_true',
    ]);

    // Authenticated: credits balance
    register_rest_route( $ns, '/credits', [
        'methods'             => 'GET',
        'callback'            => 'pixza_get_credits',
        'permission_callback' => 'pixza_auth_check',
    ]);

    // Server-to-server: deduct credits
    register_rest_route( $ns, '/credits/deduct', [
        'methods'             => 'POST',
        'callback'            => 'pixza_deduct_credits',
        'permission_callback' => 'pixza_secret_check',
    ]);

    // Server-to-server: add credits (top-up / purchase)
    register_rest_route( $ns, '/credits/add', [
        'methods'             => 'POST',
        'callback'            => 'pixza_add_credits',
        'permission_callback' => 'pixza_secret_check',
    ]);

    // Authenticated: subscription info
    register_rest_route( $ns, '/subscription', [
        'methods'             => 'GET',
        'callback'            => 'pixza_get_subscription',
        'permission_callback' => 'pixza_auth_check',
    ]);

    // Authenticated: create Stripe checkout
    register_rest_route( $ns, '/checkout', [
        'methods'             => 'POST',
        'callback'            => 'pixza_create_checkout',
        'permission_callback' => 'pixza_auth_check',
    ]);

    // Authenticated: cancel subscription
    register_rest_route( $ns, '/subscription/cancel', [
        'methods'             => 'POST',
        'callback'            => 'pixza_cancel_subscription',
        'permission_callback' => 'pixza_auth_check',
    ]);

    // Authenticated: usage history
    register_rest_route( $ns, '/usage', [
        'methods'             => 'GET',
        'callback'            => 'pixza_get_usage',
        'permission_callback' => 'pixza_auth_check',
    ]);

    // Authenticated: generations list
    register_rest_route( $ns, '/generations', [
        'methods'             => ['GET', 'POST'],
        'callback'            => 'pixza_generations_handler',
        'permission_callback' => 'pixza_auth_check',
    ]);

    // Authenticated: API keys
    register_rest_route( $ns, '/api-keys', [
        'methods'             => ['GET', 'POST'],
        'callback'            => 'pixza_api_keys_handler',
        'permission_callback' => 'pixza_auth_check',
    ]);

    // Stripe webhook (public, verified by signature)
    register_rest_route( $ns, '/stripe/webhook', [
        'methods'             => 'POST',
        'callback'            => 'pixza_stripe_webhook',
        'permission_callback' => '__return_true',
    ]);

    // Admin: list users
    register_rest_route( $ns, '/admin/users', [
        'methods'             => 'GET',
        'callback'            => 'pixza_admin_list_users',
        'permission_callback' => 'pixza_secret_check',
    ]);

    // Admin: update user
    register_rest_route( $ns, '/admin/users/(?P<id>\d+)', [
        'methods'             => 'POST',
        'callback'            => 'pixza_admin_update_user',
        'permission_callback' => 'pixza_secret_check',
    ]);

    // Admin: set user credits
    register_rest_route( $ns, '/admin/users/(?P<id>\d+)/credits', [
        'methods'             => 'POST',
        'callback'            => 'pixza_admin_set_credits',
        'permission_callback' => 'pixza_secret_check',
    ]);

    // Admin: stats
    register_rest_route( $ns, '/admin/stats', [
        'methods'             => 'GET',
        'callback'            => 'pixza_admin_stats',
        'permission_callback' => 'pixza_secret_check',
    ]);

    // Coupon validate
    register_rest_route( $ns, '/coupons/validate', [
        'methods'             => 'POST',
        'callback'            => 'pixza_validate_coupon',
        'permission_callback' => '__return_true',
    ]);
}

// ── Permission helpers ────────────────────────────────────────
function pixza_auth_check( WP_REST_Request $req ): bool {
    $auth = $req->get_header('Authorization');
    if ( $auth && str_starts_with($auth, 'Bearer ') ) {
        $token = substr($auth, 7);
        $user  = pixza_validate_jwt( $token );
        if ( $user ) {
            wp_set_current_user( $user->ID );
            return true;
        }
    }
    return is_user_logged_in();
}

function pixza_secret_check( WP_REST_Request $req ): bool {
    $secret = $req->get_header('X-WP-Secret');
    return $secret && hash_equals( PIXZA_SECRET, $secret );
}

function pixza_validate_jwt( string $token ): ?WP_User {
    // Delegate to JWT Auth plugin if available
    if ( function_exists('jwt_auth_get_user_by_token') ) {
        $user = jwt_auth_get_user_by_token( $token );
        return $user instanceof WP_User ? $user : null;
    }
    // Fallback: check application passwords or custom token meta
    $users = get_users([
        'meta_key'   => 'pixza_auth_token',
        'meta_value' => hash('sha256', $token),
        'number'     => 1,
    ]);
    return $users[0] ?? null;
}

// ── Plan config helper ────────────────────────────────────────
function pixza_plan_credits(): array {
    $raw = get_option('pixza_plan_credits', '');
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : ['free' => 50, 'pro' => 2000, 'agency' => 10000];
}

// ── User registration ─────────────────────────────────────────
function pixza_register_user( WP_REST_Request $req ): WP_REST_Response|WP_Error {
    $username = sanitize_user( $req->get_param('username') ?? '' );
    $email    = sanitize_email( $req->get_param('email') ?? '' );
    $password = $req->get_param('password') ?? '';
    $name     = sanitize_text_field( $req->get_param('name') ?? $username );

    if ( ! $username || ! $email || ! $password )
        return new WP_Error('missing_fields', 'username, email and password are required', ['status' => 400]);

    if ( username_exists($username) )
        return new WP_Error('username_exists', 'Username already taken', ['status' => 409]);

    if ( email_exists($email) )
        return new WP_Error('email_exists', 'Email already registered', ['status' => 409]);

    $user_id = wp_create_user( $username, $password, $email );
    if ( is_wp_error($user_id) ) return $user_id;

    wp_update_user(['ID' => $user_id, 'display_name' => $name, 'first_name' => $name]);

    $limits = pixza_plan_credits();
    update_user_meta( $user_id, 'plan',          'free' );
    update_user_meta( $user_id, 'credits',        $limits['free'] );
    update_user_meta( $user_id, 'credits_limit',  $limits['free'] );
    update_user_meta( $user_id, 'generations_count', 0 );

    return new WP_REST_Response( pixza_user_data( get_user_by('id', $user_id) ), 201 );
}

// ── Credits ───────────────────────────────────────────────────
function pixza_get_credits( WP_REST_Request $req ): WP_REST_Response {
    $user    = wp_get_current_user();
    $plan    = get_user_meta( $user->ID, 'plan', true ) ?: 'free';
    $limits  = pixza_plan_credits();
    $limit   = (int)( get_user_meta($user->ID, 'credits_limit', true) ?: $limits[$plan] ?? 50 );
    $credits = (int)( get_user_meta($user->ID, 'credits', true) );
    if ( ! get_user_meta($user->ID, 'credits', false) ) {
        // First time — initialise
        update_user_meta( $user->ID, 'credits', $limit );
        $credits = $limit;
    }
    return new WP_REST_Response(['credits' => $credits, 'limit' => $limit, 'plan' => $plan]);
}

function pixza_deduct_credits( WP_REST_Request $req ): WP_REST_Response|WP_Error {
    $user_id = (int) $req->get_param('user_id');
    $amount  = (int) $req->get_param('amount');
    $reason  = sanitize_text_field( $req->get_param('reason') ?? 'generation' );
    $model   = sanitize_text_field( $req->get_param('model') ?? '' );
    $provider= sanitize_text_field( $req->get_param('provider') ?? '' );

    if ( ! $user_id || $amount < 1 )
        return new WP_Error('invalid_params', 'user_id and amount required', ['status' => 400]);

    $current = (int) get_user_meta( $user_id, 'credits', true );
    if ( $current < $amount )
        return new WP_Error('insufficient_credits', "Not enough credits ($current < $amount)", ['status' => 402]);

    $new_balance = $current - $amount;
    update_user_meta( $user_id, 'credits', $new_balance );

    // Increment lifetime generation count
    $count = (int) get_user_meta( $user_id, 'generations_count', true );
    update_user_meta( $user_id, 'generations_count', $count + 1 );

    // Log usage
    global $wpdb;
    $wpdb->insert( $wpdb->prefix . 'pixza_usage', [
        'user_id'    => $user_id,
        'action'     => $reason,
        'model'      => $model,
        'provider'   => $provider,
        'credits'    => $amount,
        'created_at' => current_time('mysql'),
    ]);

    return new WP_REST_Response(['credits' => $new_balance, 'deducted' => $amount]);
}

function pixza_add_credits( WP_REST_Request $req ): WP_REST_Response|WP_Error {
    $user_id = (int) $req->get_param('user_id');
    $amount  = (int) $req->get_param('amount');
    $plan    = sanitize_text_field( $req->get_param('plan') ?? '' );

    if ( ! $user_id || $amount < 1 )
        return new WP_Error('invalid_params', 'user_id and amount required', ['status' => 400]);

    $current = (int) get_user_meta( $user_id, 'credits', true );
    $new_balance = $current + $amount;
    update_user_meta( $user_id, 'credits', $new_balance );

    if ( $plan ) {
        update_user_meta( $user_id, 'plan', $plan );
        $limits = pixza_plan_credits();
        update_user_meta( $user_id, 'credits_limit', $limits[$plan] ?? $amount );
    }

    return new WP_REST_Response(['credits' => $new_balance, 'added' => $amount, 'plan' => $plan ?: get_user_meta($user_id, 'plan', true)]);
}

// ── Usage history ─────────────────────────────────────────────
function pixza_get_usage( WP_REST_Request $req ): WP_REST_Response {
    global $wpdb;
    $user    = wp_get_current_user();
    $page    = max(1, (int)($req->get_param('page') ?? 1));
    $per     = min(50, max(1, (int)($req->get_param('per_page') ?? 20)));
    $offset  = ($page - 1) * $per;

    $rows = $wpdb->get_results( $wpdb->prepare(
        "SELECT * FROM {$wpdb->prefix}pixza_usage WHERE user_id = %d ORDER BY created_at DESC LIMIT %d OFFSET %d",
        $user->ID, $per, $offset
    ), ARRAY_A );

    $total = (int) $wpdb->get_var( $wpdb->prepare(
        "SELECT COUNT(*) FROM {$wpdb->prefix}pixza_usage WHERE user_id = %d", $user->ID
    ));

    return new WP_REST_Response(['items' => $rows, 'total' => $total, 'pages' => ceil($total / $per)]);
}

// ── Subscription ──────────────────────────────────────────────
function pixza_get_subscription( WP_REST_Request $req ): WP_REST_Response {
    $user = wp_get_current_user();
    $plan = get_user_meta( $user->ID, 'plan', true ) ?: 'free';
    $sub_id     = get_user_meta( $user->ID, 'stripe_subscription_id', true );
    $next_pay   = get_user_meta( $user->ID, 'subscription_next_payment', true );
    $status     = get_user_meta( $user->ID, 'subscription_status', true ) ?: ($plan === 'free' ? 'free' : 'active');

    return new WP_REST_Response([
        'id'           => $sub_id ?: null,
        'status'       => $status,
        'plan'         => $plan,
        'next_payment' => $next_pay ?: null,
    ]);
}

function pixza_cancel_subscription( WP_REST_Request $req ): WP_REST_Response|WP_Error {
    $user   = wp_get_current_user();
    $sub_id = get_user_meta( $user->ID, 'stripe_subscription_id', true );
    if ( ! $sub_id ) return new WP_Error('no_subscription', 'No active subscription', ['status' => 404]);

    // Call Stripe to cancel
    $stripe_key = get_option('pixza_stripe_secret_key', '');
    if ( $stripe_key ) {
        $res = wp_remote_post( "https://api.stripe.com/v1/subscriptions/$sub_id", [
            'headers' => ['Authorization' => 'Bearer ' . $stripe_key],
            'body'    => ['cancel_at_period_end' => 'true'],
        ]);
    }

    update_user_meta( $user->ID, 'subscription_status', 'cancelled' );
    return new WP_REST_Response(['success' => true]);
}

// ── Stripe Checkout ───────────────────────────────────────────
function pixza_create_checkout( WP_REST_Request $req ): WP_REST_Response|WP_Error {
    $user       = wp_get_current_user();
    $plan       = sanitize_text_field( $req->get_param('plan') ?? 'pro' );
    $stripe_key = get_option('pixza_stripe_secret_key', '');
    $app_url    = get_option('pixza_app_url', home_url());

    if ( ! $stripe_key )
        return new WP_Error('stripe_not_configured', 'Stripe not configured', ['status' => 500]);

    $price_ids = [
        'pro'    => get_option('pixza_stripe_price_pro', ''),
        'agency' => get_option('pixza_stripe_price_agency', ''),
    ];
    $price_id = $price_ids[$plan] ?? '';
    if ( ! $price_id )
        return new WP_Error('invalid_plan', "No price configured for plan: $plan", ['status' => 400]);

    $res = wp_remote_post( 'https://api.stripe.com/v1/checkout/sessions', [
        'headers' => [
            'Authorization' => 'Bearer ' . $stripe_key,
            'Content-Type'  => 'application/x-www-form-urlencoded',
        ],
        'body' => http_build_query([
            'mode'                                 => 'subscription',
            'customer_email'                       => $user->user_email,
            'line_items[0][price]'                 => $price_id,
            'line_items[0][quantity]'              => 1,
            'success_url'                          => $app_url . '/settings?upgraded=1',
            'cancel_url'                           => $app_url . '/settings?cancelled=1',
            'metadata[user_id]'                    => $user->ID,
            'metadata[plan]'                       => $plan,
            'subscription_data[metadata][user_id]' => $user->ID,
            'subscription_data[metadata][plan]'    => $plan,
        ]),
    ]);

    if ( is_wp_error($res) ) return new WP_Error('stripe_error', $res->get_error_message(), ['status' => 500]);
    $data = json_decode( wp_remote_retrieve_body($res), true );
    if ( empty($data['url']) ) return new WP_Error('stripe_error', $data['error']['message'] ?? 'Checkout failed', ['status' => 500]);

    return new WP_REST_Response(['checkout_url' => $data['url']]);
}

// ── Stripe Webhook ────────────────────────────────────────────
function pixza_stripe_webhook( WP_REST_Request $req ): WP_REST_Response|WP_Error {
    $stripe_key     = get_option('pixza_stripe_secret_key', '');
    $webhook_secret = get_option('pixza_stripe_webhook_secret', '');
    $payload        = $req->get_body();
    $sig            = $req->get_header('stripe-signature');

    // Verify signature if webhook secret is set
    if ( $webhook_secret && $sig ) {
        $valid = pixza_verify_stripe_signature( $payload, $sig, $webhook_secret );
        if ( ! $valid ) return new WP_Error('invalid_signature', 'Webhook signature invalid', ['status' => 400]);
    }

    $event = json_decode( $payload, true );
    $type  = $event['type'] ?? '';
    $obj   = $event['data']['object'] ?? [];

    switch ( $type ) {
        case 'checkout.session.completed':
            $user_id = (int)($obj['metadata']['user_id'] ?? 0);
            $plan    = sanitize_text_field( $obj['metadata']['plan'] ?? 'pro' );
            $sub_id  = $obj['subscription'] ?? '';
            if ( $user_id ) {
                $limits = pixza_plan_credits();
                update_user_meta( $user_id, 'plan',                    $plan );
                update_user_meta( $user_id, 'credits',                 $limits[$plan] ?? 2000 );
                update_user_meta( $user_id, 'credits_limit',           $limits[$plan] ?? 2000 );
                update_user_meta( $user_id, 'stripe_subscription_id',  $sub_id );
                update_user_meta( $user_id, 'subscription_status',     'active' );
            }
            break;

        case 'invoice.payment_succeeded':
            // Monthly renewal — reset credits
            $sub_id  = $obj['subscription'] ?? '';
            $user_id = pixza_user_by_subscription( $sub_id );
            if ( $user_id ) {
                $plan   = get_user_meta( $user_id, 'plan', true ) ?: 'pro';
                $limits = pixza_plan_credits();
                update_user_meta( $user_id, 'credits', $limits[$plan] ?? 2000 );
                update_user_meta( $user_id, 'subscription_status', 'active' );
                $next = date('Y-m-d', strtotime('+1 month'));
                update_user_meta( $user_id, 'subscription_next_payment', $next );
            }
            break;

        case 'customer.subscription.deleted':
        case 'invoice.payment_failed':
            $sub_id  = $obj['id'] ?? $obj['subscription'] ?? '';
            $user_id = pixza_user_by_subscription( $sub_id );
            if ( $user_id ) {
                update_user_meta( $user_id, 'plan',                'free' );
                update_user_meta( $user_id, 'subscription_status', 'cancelled' );
                $limits = pixza_plan_credits();
                update_user_meta( $user_id, 'credits_limit', $limits['free'] );
                // Don't zero out credits — let them use what's left
            }
            break;
    }

    return new WP_REST_Response(['received' => true]);
}

function pixza_user_by_subscription( string $sub_id ): int {
    $users = get_users(['meta_key' => 'stripe_subscription_id', 'meta_value' => $sub_id, 'number' => 1]);
    return $users[0]->ID ?? 0;
}

function pixza_verify_stripe_signature( string $payload, string $sig_header, string $secret ): bool {
    $parts = [];
    foreach ( explode(',', $sig_header) as $part ) {
        [$k, $v] = explode('=', $part, 2);
        $parts[$k][] = $v;
    }
    $timestamp = $parts['t'][0] ?? 0;
    $expected  = hash_hmac('sha256', "$timestamp.$payload", $secret);
    foreach ( ($parts['v1'] ?? []) as $v ) {
        if ( hash_equals($expected, $v) ) return true;
    }
    return false;
}

// ── Generations ───────────────────────────────────────────────
function pixza_generations_handler( WP_REST_Request $req ): WP_REST_Response {
    $user = wp_get_current_user();
    if ( $req->get_method() === 'POST' ) {
        $post_id = wp_insert_post([
            'post_type'   => 'pixza_generation',
            'post_status' => 'private',
            'post_author' => $user->ID,
            'post_title'  => sanitize_text_field( substr($req->get_param('prompt') ?? '', 0, 100) ),
            'meta_input'  => [
                'mode'        => sanitize_text_field( $req->get_param('mode') ?? 'image' ),
                'model'       => sanitize_text_field( $req->get_param('model') ?? '' ),
                'provider'    => sanitize_text_field( $req->get_param('provider') ?? '' ),
                'output_url'  => esc_url_raw( $req->get_param('output_url') ?? '' ),
                'output_type' => sanitize_text_field( $req->get_param('output_type') ?? 'image' ),
                'status'      => sanitize_text_field( $req->get_param('status') ?? 'done' ),
                'prompt'      => sanitize_textarea_field( $req->get_param('prompt') ?? '' ),
            ],
        ]);
        return new WP_REST_Response(['id' => $post_id], 201);
    }

    // GET
    $page    = max(1, (int)($req->get_param('page') ?? 1));
    $per     = min(50, (int)($req->get_param('per_page') ?? 20));
    $posts   = get_posts([
        'post_type'      => 'pixza_generation',
        'post_status'    => 'private',
        'author'         => $user->ID,
        'posts_per_page' => $per,
        'paged'          => $page,
        'orderby'        => 'date',
        'order'          => 'DESC',
    ]);
    $total = (int) wp_count_posts('pixza_generation')->private;
    $items = array_map(fn($p) => [
        'id'         => $p->ID,
        'prompt'     => get_post_meta($p->ID, 'prompt', true),
        'output_url' => get_post_meta($p->ID, 'output_url', true),
        'mode'       => get_post_meta($p->ID, 'mode', true),
        'model'      => get_post_meta($p->ID, 'model', true),
        'created_at' => $p->post_date,
    ], $posts);

    return new WP_REST_Response(['items' => $items, 'total' => $total]);
}

// ── API Keys ──────────────────────────────────────────────────
function pixza_api_keys_handler( WP_REST_Request $req ): WP_REST_Response {
    $user = wp_get_current_user();
    if ( $req->get_method() === 'POST' ) {
        $provider = sanitize_text_field( $req->get_param('provider') ?? '' );
        $key      = sanitize_text_field( $req->get_param('key') ?? '' );
        $keys     = (array) json_decode( get_user_meta($user->ID, 'api_keys', true) ?: '{}', true );
        $keys[$provider] = $key;
        update_user_meta( $user->ID, 'api_keys', json_encode($keys) );
        return new WP_REST_Response(['success' => true]);
    }
    $keys = (array) json_decode( get_user_meta($user->ID, 'api_keys', true) ?: '{}', true );
    return new WP_REST_Response(['keys' => $keys]);
}

// ── Coupon validation ─────────────────────────────────────────
function pixza_validate_coupon( WP_REST_Request $req ): WP_REST_Response|WP_Error {
    $code = sanitize_text_field( $req->get_param('code') ?? '' );
    if ( ! $code ) return new WP_Error('missing_code', 'Coupon code required', ['status' => 400]);

    // Check WooCommerce coupon if available
    if ( function_exists('wc_get_coupon_id_by_code') ) {
        $coupon_id = wc_get_coupon_id_by_code( $code );
        if ( $coupon_id ) {
            $coupon = new WC_Coupon( $coupon_id );
            return new WP_REST_Response([
                'id'            => $coupon_id,
                'code'          => $code,
                'discount_type' => $coupon->get_discount_type(),
                'amount'        => $coupon->get_amount(),
                'description'   => $coupon->get_description(),
                'expiry_date'   => $coupon->get_date_expires() ? $coupon->get_date_expires()->date('Y-m-d') : null,
            ]);
        }
    }

    // Fallback: check custom coupon option
    $coupons = (array) json_decode( get_option('pixza_coupons', '{}'), true );
    if ( isset($coupons[$code]) ) return new WP_REST_Response($coupons[$code]);

    return new WP_Error('invalid_coupon', 'Coupon not found or expired', ['status' => 404]);
}

// ── Admin endpoints ───────────────────────────────────────────
function pixza_admin_list_users( WP_REST_Request $req ): WP_REST_Response {
    $page    = max(1, (int)($req->get_param('page') ?? 1));
    $per     = min(100, (int)($req->get_param('per_page') ?? 20));
    $search  = sanitize_text_field( $req->get_param('search') ?? '' );
    $plan    = sanitize_text_field( $req->get_param('plan') ?? '' );

    $args = [
        'number'  => $per,
        'offset'  => ($page - 1) * $per,
        'orderby' => 'registered',
        'order'   => 'DESC',
    ];
    if ( $search ) $args['search'] = "*$search*";
    if ( $plan )   { $args['meta_key'] = 'plan'; $args['meta_value'] = $plan; }

    $users = get_users($args);
    $total = (int) count_users()['total_users'];

    $data = array_map('pixza_user_data', $users);
    return new WP_REST_Response(['users' => $data, 'total' => $total, 'pages' => ceil($total / $per)]);
}

function pixza_admin_update_user( WP_REST_Request $req ): WP_REST_Response|WP_Error {
    $user_id = (int) $req->get_param('id');
    if ( ! get_user_by('id', $user_id) ) return new WP_Error('not_found', 'User not found', ['status' => 404]);

    if ( $plan = sanitize_text_field($req->get_param('plan') ?? '') )
        update_user_meta( $user_id, 'plan', $plan );
    if ( $credits = $req->get_param('credits') )
        update_user_meta( $user_id, 'credits', (int)$credits );
    if ( $limit = $req->get_param('credits_limit') )
        update_user_meta( $user_id, 'credits_limit', (int)$limit );
    if ( $name = sanitize_text_field($req->get_param('name') ?? '') )
        wp_update_user(['ID' => $user_id, 'display_name' => $name]);

    return new WP_REST_Response(['success' => true, 'user' => pixza_user_data(get_user_by('id', $user_id))]);
}

function pixza_admin_set_credits( WP_REST_Request $req ): WP_REST_Response|WP_Error {
    $user_id = (int) $req->get_param('id');
    if ( ! get_user_by('id', $user_id) ) return new WP_Error('not_found', 'User not found', ['status' => 404]);

    if ( null !== $req->get_param('credits') )
        update_user_meta( $user_id, 'credits', (int)$req->get_param('credits') );
    if ( null !== $req->get_param('credits_limit') )
        update_user_meta( $user_id, 'credits_limit', (int)$req->get_param('credits_limit') );
    if ( $plan = sanitize_text_field($req->get_param('plan') ?? '') )
        update_user_meta( $user_id, 'plan', $plan );

    return new WP_REST_Response(['success' => true]);
}

function pixza_admin_stats( WP_REST_Request $req ): WP_REST_Response {
    global $wpdb;
    $counts = count_users();
    $total  = $counts['total_users'];

    $pro    = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->usermeta} WHERE meta_key='plan' AND meta_value='pro'");
    $agency = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->usermeta} WHERE meta_key='plan' AND meta_value='agency'");
    $gens   = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}pixza_usage");
    $credits= (int) $wpdb->get_var("SELECT SUM(credits) FROM {$wpdb->prefix}pixza_usage");

    return new WP_REST_Response([
        'total_users'       => $total,
        'pro_users'         => $pro,
        'agency_users'      => $agency,
        'free_users'        => $total - $pro - $agency,
        'total_generations' => $gens,
        'credits_issued'    => $credits ?: 0,
    ]);
}

// ── User data helper ──────────────────────────────────────────
function pixza_user_data( WP_User $user ): array {
    $plan    = get_user_meta($user->ID, 'plan', true) ?: 'free';
    $limits  = pixza_plan_credits();
    $limit   = (int)(get_user_meta($user->ID, 'credits_limit', true) ?: $limits[$plan] ?? 50);
    $credits = get_user_meta($user->ID, 'credits', false) ? (int)get_user_meta($user->ID, 'credits', true) : $limit;

    return [
        'id'         => $user->ID,
        'username'   => $user->user_login,
        'name'       => $user->display_name,
        'email'      => $user->user_email,
        'registered' => $user->user_registered,
        'roles'      => $user->roles,
        'meta'       => [
            'plan'               => $plan,
            'credits'            => $credits,
            'credits_limit'      => $limit,
            'generations_count'  => (int)(get_user_meta($user->ID, 'generations_count', true) ?: 0),
            'onboarding_done'    => (bool) get_user_meta($user->ID, 'onboarding_done', true),
            'preferred_model'    => get_user_meta($user->ID, 'preferred_model', true) ?: '',
        ],
    ];
}

// ── Custom post type: pixza_generation ───────────────────────
add_action('init', function() {
    register_post_type('pixza_generation', [
        'public'   => false,
        'supports' => ['title', 'custom-fields'],
        'label'    => 'Pixza Generations',
    ]);
});

// ── Admin menu ────────────────────────────────────────────────
add_action('admin_menu', 'pixza_admin_menu');
function pixza_admin_menu() {
    add_menu_page('Pixza', 'Pixza', 'manage_options', 'pixza', 'pixza_admin_page', 'dashicons-art', 30);
    add_submenu_page('pixza', 'Subscribers', 'Subscribers', 'manage_options', 'pixza-subscribers', 'pixza_subscribers_page');
    add_submenu_page('pixza', 'Settings', 'Settings', 'manage_options', 'pixza-settings', 'pixza_settings_page');
}

function pixza_admin_page() { pixza_subscribers_page(); }

function pixza_subscribers_page() {
    global $wpdb;
    $search = sanitize_text_field($_GET['s'] ?? '');
    $plan   = sanitize_text_field($_GET['plan'] ?? '');
    $paged  = max(1, (int)($_GET['paged'] ?? 1));
    $per    = 20;

    $args = ['number' => $per, 'offset' => ($paged - 1) * $per, 'orderby' => 'registered', 'order' => 'DESC'];
    if ($search) $args['search'] = "*$search*";
    if ($plan)   { $args['meta_key'] = 'plan'; $args['meta_value'] = $plan; }

    $users = get_users($args);
    $total = count_users()['total_users'];
    $pages = ceil($total / $per);

    echo '<div class="wrap"><h1>Pixza Subscribers</h1>';
    echo '<form method="get"><input type="hidden" name="page" value="pixza-subscribers">';
    echo '<p class="search-box"><input type="search" name="s" value="' . esc_attr($search) . '" placeholder="Search users..."> ';
    echo '<select name="plan"><option value="">All Plans</option>';
    foreach (['free','pro','agency'] as $p) echo "<option value='$p'" . selected($plan,$p,false) . ">$p</option>";
    echo '</select> <button class="button">Filter</button></p></form>';

    echo '<table class="wp-list-table widefat fixed striped">';
    echo '<thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Plan</th><th>Credits</th><th>Limit</th><th>Generations</th><th>Registered</th><th>Actions</th></tr></thead><tbody>';

    foreach ($users as $u) {
        $plan_val  = get_user_meta($u->ID, 'plan', true) ?: 'free';
        $credits   = (int)(get_user_meta($u->ID, 'credits', true) ?: 0);
        $limit     = (int)(get_user_meta($u->ID, 'credits_limit', true) ?: 50);
        $gens      = (int)(get_user_meta($u->ID, 'generations_count', true) ?: 0);
        $badge     = ['free' => '#888', 'pro' => '#7c3aed', 'agency' => '#d97706'][$plan_val] ?? '#888';
        echo "<tr>
            <td>{$u->ID}</td>
            <td><strong>" . esc_html($u->display_name) . "</strong></td>
            <td>" . esc_html($u->user_email) . "</td>
            <td><span style='background:$badge;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px'>" . esc_html(strtoupper($plan_val)) . "</span></td>
            <td>$credits</td>
            <td>$limit</td>
            <td>$gens</td>
            <td>" . date('Y-m-d', strtotime($u->user_registered)) . "</td>
            <td><a href='?page=pixza-subscribers&edit={$u->ID}' class='button button-small'>Edit</a></td>
        </tr>";
    }
    echo '</tbody></table>';
    echo "<p>Page $paged of $pages — $total total users</p>";

    // Inline edit form
    if (!empty($_GET['edit'])) {
        $uid = (int)$_GET['edit'];
        $eu  = get_user_by('id', $uid);
        if ($eu) {
            if (!empty($_POST['pixza_save_user'])) {
                check_admin_referer('pixza_edit_user_' . $uid);
                update_user_meta($uid, 'plan',          sanitize_text_field($_POST['plan']));
                update_user_meta($uid, 'credits',       (int)$_POST['credits']);
                update_user_meta($uid, 'credits_limit', (int)$_POST['credits_limit']);
                echo '<div class="notice notice-success"><p>Saved.</p></div>';
            }
            $ep = get_user_meta($uid, 'plan', true) ?: 'free';
            $ec = (int)(get_user_meta($uid, 'credits', true) ?: 0);
            $el = (int)(get_user_meta($uid, 'credits_limit', true) ?: 50);
            echo "<div style='background:#fff;padding:20px;margin-top:20px;border:1px solid #ccc;max-width:400px'>";
            echo "<h2>Edit: " . esc_html($eu->display_name) . "</h2>";
            echo "<form method='post'>";
            wp_nonce_field('pixza_edit_user_' . $uid);
            echo "<table class='form-table'><tr><th>Plan</th><td><select name='plan'>";
            foreach (['free','pro','agency'] as $p) echo "<option value='$p'" . selected($ep,$p,false) . ">$p</option>";
            echo "</select></td></tr>";
            echo "<tr><th>Credits</th><td><input type='number' name='credits' value='$ec'></td></tr>";
            echo "<tr><th>Credit Limit</th><td><input type='number' name='credits_limit' value='$el'></td></tr>";
            echo "</table><p><button name='pixza_save_user' value='1' class='button button-primary'>Save</button></p></form></div>";
        }
    }
    echo '</div>';
}

function pixza_settings_page() {
    if (!empty($_POST['pixza_save_settings'])) {
        check_admin_referer('pixza_settings');
        update_option('pixza_stripe_secret_key',    sanitize_text_field($_POST['stripe_secret'] ?? ''));
        update_option('pixza_stripe_webhook_secret',sanitize_text_field($_POST['stripe_webhook'] ?? ''));
        update_option('pixza_stripe_price_pro',     sanitize_text_field($_POST['price_pro'] ?? ''));
        update_option('pixza_stripe_price_agency',  sanitize_text_field($_POST['price_agency'] ?? ''));
        update_option('pixza_app_url',              esc_url_raw($_POST['app_url'] ?? ''));
        update_option('pixza_api_secret',           sanitize_text_field($_POST['api_secret'] ?? ''));
        echo '<div class="notice notice-success"><p>Settings saved.</p></div>';
    }
    $s = fn($k) => esc_attr(get_option($k, ''));
    echo '<div class="wrap"><h1>Pixza Settings</h1><form method="post">';
    wp_nonce_field('pixza_settings');
    echo '<table class="form-table">
        <tr><th>Stripe Secret Key</th><td><input class="regular-text" type="password" name="stripe_secret" value="' . $s('pixza_stripe_secret_key') . '"></td></tr>
        <tr><th>Stripe Webhook Secret</th><td><input class="regular-text" type="password" name="stripe_webhook" value="' . $s('pixza_stripe_webhook_secret') . '"></td></tr>
        <tr><th>Stripe Price ID — Pro</th><td><input class="regular-text" name="price_pro" value="' . $s('pixza_stripe_price_pro') . '" placeholder="price_xxx"></td></tr>
        <tr><th>Stripe Price ID — Agency</th><td><input class="regular-text" name="price_agency" value="' . $s('pixza_stripe_price_agency') . '" placeholder="price_xxx"></td></tr>
        <tr><th>App URL</th><td><input class="regular-text" name="app_url" value="' . $s('pixza_app_url') . '" placeholder="https://app.pixza.ai"></td></tr>
        <tr><th>API Secret (X-WP-Secret)</th><td><input class="regular-text" name="api_secret" value="' . $s('pixza_api_secret') . '"><p class="description">Copy this into your Next.js WP_API_SECRET env var.</p></td></tr>
    </table>';
    echo '<p><button name="pixza_save_settings" value="1" class="button button-primary">Save Settings</button></p></form></div>';
}
