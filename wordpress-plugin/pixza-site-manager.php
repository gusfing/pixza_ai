<?php
/**
 * Plugin Name: Pixza Site Manager
 * Plugin URI:  https://pixzastudio.com
 * Description: Manage Pixza Studio site images, settings, and content from WordPress admin
 * Version:     1.0.0
 * Author:      Pixza Studio
 * License:     GPL-2.0+
 * Text Domain: pixza-site-manager
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // No direct access.
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
define( 'PIXZA_VERSION',    '1.0.0' );
define( 'PIXZA_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'PIXZA_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// ---------------------------------------------------------------------------
// Activation / Deactivation
// ---------------------------------------------------------------------------

register_activation_hook( __FILE__, 'pixza_activate' );
register_deactivation_hook( __FILE__, 'pixza_deactivate' );

function pixza_activate() {
    pixza_create_waitlist_table();
    // Seed default options if they don't exist yet.
    foreach ( pixza_default_images() as $key => $url ) {
        if ( false === get_option( 'pixza_img_' . $key ) ) {
            add_option( 'pixza_img_' . $key, $url );
        }
    }
    if ( false === get_option( 'pixza_waitlist_enabled' ) ) {
        add_option( 'pixza_waitlist_enabled', '0' );
    }
    if ( false === get_option( 'pixza_banner_enabled' ) ) {
        add_option( 'pixza_banner_enabled', '0' );
    }
    if ( false === get_option( 'pixza_banner_text' ) ) {
        add_option( 'pixza_banner_text', '' );
    }
    if ( false === get_option( 'pixza_wp_secret' ) ) {
        add_option( 'pixza_wp_secret', wp_generate_password( 32, false ) );
    }
}

function pixza_deactivate() {
    // Nothing to clean up on deactivation (keep data).
}

// ---------------------------------------------------------------------------
// Database table
// ---------------------------------------------------------------------------

function pixza_create_waitlist_table() {
    global $wpdb;
    $table      = $wpdb->prefix . 'pixza_waitlist';
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE IF NOT EXISTS {$table} (
        id         BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        email      VARCHAR(255)        NOT NULL,
        name       VARCHAR(255)                 DEFAULT '',
        created_at DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45)                  DEFAULT '',
        PRIMARY KEY (id),
        UNIQUE KEY email (email)
    ) {$charset_collate};";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta( $sql );
}

// ---------------------------------------------------------------------------
// Default image map
// ---------------------------------------------------------------------------

function pixza_default_images() {
    return array(
        'hero_video'            => '',
        'logo'                  => '',
        'og_image'              => '',
        'landing_hero'          => '',
        'landing_feature_1'     => '',
        'landing_feature_2'     => '',
        'landing_feature_3'     => '',
        'landing_showcase_1'    => '',
        'landing_showcase_2'    => '',
        'landing_showcase_3'    => '',
        'landing_showcase_4'    => '',
        'landing_showcase_5'    => '',
        'landing_showcase_6'    => '',
        'landing_showcase_7'    => '',
        'blog_default_thumbnail'=> '',
        'waitlist_bg'           => '',
    );
}

function pixza_image_labels() {
    return array(
        'hero_video'            => 'Hero Video URL',
        'logo'                  => 'Logo',
        'og_image'              => 'OG / Social Share Image',
        'landing_hero'          => 'Landing – Hero',
        'landing_feature_1'     => 'Landing – Feature 1',
        'landing_feature_2'     => 'Landing – Feature 2',
        'landing_feature_3'     => 'Landing – Feature 3',
        'landing_showcase_1'    => 'Landing – Showcase 1',
        'landing_showcase_2'    => 'Landing – Showcase 2',
        'landing_showcase_3'    => 'Landing – Showcase 3',
        'landing_showcase_4'    => 'Landing – Showcase 4',
        'landing_showcase_5'    => 'Landing – Showcase 5',
        'landing_showcase_6'    => 'Landing – Showcase 6',
        'landing_showcase_7'    => 'Landing – Showcase 7',
        'blog_default_thumbnail'=> 'Blog Default Thumbnail',
        'waitlist_bg'           => 'Waitlist Background',
    );
}

// ---------------------------------------------------------------------------
// Admin menu
// ---------------------------------------------------------------------------

add_action( 'admin_menu', 'pixza_register_menus' );

function pixza_register_menus() {
    add_menu_page(
        __( 'Pixza Manager', 'pixza-site-manager' ),
        __( 'Pixza Manager', 'pixza-site-manager' ),
        'manage_options',
        'pixza-site-images',
        'pixza_page_site_images',
        'dashicons-admin-site',
        60
    );

    add_submenu_page(
        'pixza-site-images',
        __( 'Site Images', 'pixza-site-manager' ),
        __( 'Site Images', 'pixza-site-manager' ),
        'manage_options',
        'pixza-site-images',
        'pixza_page_site_images'
    );

    add_submenu_page(
        'pixza-site-images',
        __( 'Site Settings', 'pixza-site-manager' ),
        __( 'Site Settings', 'pixza-site-manager' ),
        'manage_options',
        'pixza-site-settings',
        'pixza_page_site_settings'
    );

    add_submenu_page(
        'pixza-site-images',
        __( 'Waitlist Emails', 'pixza-site-manager' ),
        __( 'Waitlist Emails', 'pixza-site-manager' ),
        'manage_options',
        'pixza-waitlist-emails',
        'pixza_page_waitlist_emails'
    );
}

// ---------------------------------------------------------------------------
// Enqueue media library on Site Images page
// ---------------------------------------------------------------------------

add_action( 'admin_enqueue_scripts', 'pixza_enqueue_scripts' );

function pixza_enqueue_scripts( $hook ) {
    if ( 'toplevel_page_pixza-site-images' !== $hook ) {
        return;
    }
    wp_enqueue_media();
    wp_enqueue_script(
        'pixza-media-picker',
        PIXZA_PLUGIN_URL . 'assets/media-picker.js',
        array( 'jquery', 'media-upload' ),
        PIXZA_VERSION,
        true
    );
}


// ---------------------------------------------------------------------------
// Admin page: Site Images
// ---------------------------------------------------------------------------

function pixza_page_site_images() {
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( esc_html__( 'You do not have permission to access this page.', 'pixza-site-manager' ) );
    }

    // Handle form save.
    if ( isset( $_POST['pixza_save_images'] ) ) {
        check_admin_referer( 'pixza_save_images_action', 'pixza_images_nonce' );

        foreach ( pixza_default_images() as $key => $default ) {
            $option_key = 'pixza_img_' . $key;
            if ( isset( $_POST[ $option_key ] ) ) {
                $url = esc_url_raw( wp_unslash( $_POST[ $option_key ] ) );
                update_option( $option_key, $url );
            }
        }
        echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__( 'Images saved successfully.', 'pixza-site-manager' ) . '</p></div>';
    }

    $labels = pixza_image_labels();
    ?>
    <div class="wrap">
        <h1><?php esc_html_e( 'Site Images', 'pixza-site-manager' ); ?></h1>
        <p><?php esc_html_e( 'Manage all images used on the Pixza Next.js site. Click "Change Image" to pick from the WordPress media library, or paste a URL directly.', 'pixza-site-manager' ); ?></p>

        <form method="post" action="">
            <?php wp_nonce_field( 'pixza_save_images_action', 'pixza_images_nonce' ); ?>

            <div id="pixza-images-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:20px;margin-top:20px;">
                <?php foreach ( $labels as $key => $label ) :
                    $option_key = 'pixza_img_' . $key;
                    $current_url = get_option( $option_key, '' );
                    $is_video    = ( $key === 'hero_video' );
                    $preview_url = esc_url( $current_url );
                    $truncated   = strlen( $current_url ) > 60 ? substr( $current_url, 0, 57 ) . '...' : $current_url;
                ?>
                <div class="pixza-image-card" style="background:#fff;border:1px solid #ddd;border-radius:6px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,.08);">
                    <strong style="display:block;margin-bottom:8px;font-size:13px;"><?php echo esc_html( $label ); ?></strong>

                    <?php if ( $is_video ) : ?>
                        <div style="background:#f0f0f0;height:80px;display:flex;align-items:center;justify-content:center;border-radius:4px;margin-bottom:8px;font-size:12px;color:#666;">
                            🎬 <?php esc_html_e( 'Video URL', 'pixza-site-manager' ); ?>
                        </div>
                    <?php elseif ( $preview_url ) : ?>
                        <div style="margin-bottom:8px;height:80px;overflow:hidden;border-radius:4px;background:#f0f0f0;">
                            <img src="<?php echo $preview_url; ?>"
                                 alt="<?php echo esc_attr( $label ); ?>"
                                 style="width:100%;height:80px;object-fit:cover;"
                                 onerror="this.style.display='none'" />
                        </div>
                    <?php else : ?>
                        <div style="background:#f0f0f0;height:80px;display:flex;align-items:center;justify-content:center;border-radius:4px;margin-bottom:8px;font-size:12px;color:#999;">
                            <?php esc_html_e( 'No image set', 'pixza-site-manager' ); ?>
                        </div>
                    <?php endif; ?>

                    <input type="url"
                           id="<?php echo esc_attr( $option_key ); ?>"
                           name="<?php echo esc_attr( $option_key ); ?>"
                           value="<?php echo esc_attr( $current_url ); ?>"
                           class="pixza-url-input"
                           style="width:100%;margin-bottom:8px;font-size:11px;"
                           placeholder="https://" />

                    <div style="display:flex;gap:6px;flex-wrap:wrap;">
                        <?php if ( ! $is_video ) : ?>
                        <button type="button"
                                class="button button-primary pixza-media-btn"
                                data-target="<?php echo esc_attr( $option_key ); ?>"
                                style="font-size:12px;">
                            <?php esc_html_e( 'Change Image', 'pixza-site-manager' ); ?>
                        </button>
                        <?php endif; ?>
                        <button type="button"
                                class="button pixza-reset-btn"
                                data-target="<?php echo esc_attr( $option_key ); ?>"
                                data-default=""
                                style="font-size:12px;">
                            <?php esc_html_e( 'Reset to Default', 'pixza-site-manager' ); ?>
                        </button>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>

            <p style="margin-top:24px;">
                <input type="submit"
                       name="pixza_save_images"
                       class="button button-primary button-large"
                       value="<?php esc_attr_e( 'Save All Images', 'pixza-site-manager' ); ?>" />
            </p>
        </form>
    </div>

    <script>
    (function($){
        // Media picker
        $('.pixza-media-btn').on('click', function(){
            var targetId = $(this).data('target');
            var frame = wp.media({
                title: '<?php echo esc_js( __( 'Select or Upload Image', 'pixza-site-manager' ) ); ?>',
                button: { text: '<?php echo esc_js( __( 'Use this image', 'pixza-site-manager' ) ); ?>' },
                multiple: false
            });
            frame.on('select', function(){
                var attachment = frame.state().get('selection').first().toJSON();
                $('#' + targetId).val(attachment.url);
                // Update preview
                var card = $('#' + targetId).closest('.pixza-image-card');
                card.find('img').attr('src', attachment.url).show();
            });
            frame.open();
        });

        // Reset to default
        $('.pixza-reset-btn').on('click', function(){
            var targetId  = $(this).data('target');
            var defaultVal = $(this).data('default');
            $('#' + targetId).val(defaultVal);
            var card = $('#' + targetId).closest('.pixza-image-card');
            card.find('img').attr('src', '').hide();
        });
    })(jQuery);
    </script>
    <?php
}


// ---------------------------------------------------------------------------
// Admin page: Site Settings
// ---------------------------------------------------------------------------

function pixza_page_site_settings() {
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( esc_html__( 'You do not have permission to access this page.', 'pixza-site-manager' ) );
    }

    if ( isset( $_POST['pixza_save_settings'] ) ) {
        check_admin_referer( 'pixza_save_settings_action', 'pixza_settings_nonce' );

        update_option( 'pixza_waitlist_enabled', isset( $_POST['pixza_waitlist_enabled'] ) ? '1' : '0' );
        update_option( 'pixza_banner_enabled',   isset( $_POST['pixza_banner_enabled'] )   ? '1' : '0' );
        update_option( 'pixza_banner_text',      sanitize_text_field( wp_unslash( $_POST['pixza_banner_text'] ?? '' ) ) );

        // Only update secret if a non-empty value was submitted.
        $new_secret = sanitize_text_field( wp_unslash( $_POST['pixza_wp_secret'] ?? '' ) );
        if ( ! empty( $new_secret ) ) {
            update_option( 'pixza_wp_secret', $new_secret );
        }

        echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__( 'Settings saved.', 'pixza-site-manager' ) . '</p></div>';
    }

    $waitlist_enabled = get_option( 'pixza_waitlist_enabled', '0' );
    $banner_enabled   = get_option( 'pixza_banner_enabled',   '0' );
    $banner_text      = get_option( 'pixza_banner_text',      '' );
    $wp_secret        = get_option( 'pixza_wp_secret',        '' );
    ?>
    <div class="wrap">
        <h1><?php esc_html_e( 'Site Settings', 'pixza-site-manager' ); ?></h1>

        <form method="post" action="">
            <?php wp_nonce_field( 'pixza_save_settings_action', 'pixza_settings_nonce' ); ?>

            <table class="form-table" role="presentation">
                <tbody>

                    <tr>
                        <th scope="row">
                            <label for="pixza_waitlist_enabled">
                                <?php esc_html_e( 'Waitlist Mode', 'pixza-site-manager' ); ?>
                            </label>
                        </th>
                        <td>
                            <label>
                                <input type="checkbox"
                                       id="pixza_waitlist_enabled"
                                       name="pixza_waitlist_enabled"
                                       value="1"
                                       <?php checked( '1', $waitlist_enabled ); ?> />
                                <?php esc_html_e( 'Enable waitlist mode (Next.js redirects all pages to /waitlist)', 'pixza-site-manager' ); ?>
                            </label>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row">
                            <label for="pixza_banner_enabled">
                                <?php esc_html_e( 'Announcement Banner', 'pixza-site-manager' ); ?>
                            </label>
                        </th>
                        <td>
                            <label>
                                <input type="checkbox"
                                       id="pixza_banner_enabled"
                                       name="pixza_banner_enabled"
                                       value="1"
                                       <?php checked( '1', $banner_enabled ); ?> />
                                <?php esc_html_e( 'Show announcement banner at top of site', 'pixza-site-manager' ); ?>
                            </label>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row">
                            <label for="pixza_banner_text">
                                <?php esc_html_e( 'Banner Text', 'pixza-site-manager' ); ?>
                            </label>
                        </th>
                        <td>
                            <input type="text"
                                   id="pixza_banner_text"
                                   name="pixza_banner_text"
                                   value="<?php echo esc_attr( $banner_text ); ?>"
                                   class="large-text"
                                   placeholder="<?php esc_attr_e( 'Enter announcement text…', 'pixza-site-manager' ); ?>" />
                            <p class="description"><?php esc_html_e( 'Displayed in the banner when enabled.', 'pixza-site-manager' ); ?></p>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row">
                            <label for="pixza_wp_secret">
                                <?php esc_html_e( 'WP API Secret', 'pixza-site-manager' ); ?>
                            </label>
                        </th>
                        <td>
                            <input type="text"
                                   id="pixza_wp_secret"
                                   name="pixza_wp_secret"
                                   value="<?php echo esc_attr( $wp_secret ); ?>"
                                   class="regular-text"
                                   autocomplete="off" />
                            <p class="description">
                                <?php esc_html_e( 'Set this value as the X-WP-Secret header in your Next.js environment (WORDPRESS_API_SECRET). Leave blank to keep the current value.', 'pixza-site-manager' ); ?>
                            </p>
                        </td>
                    </tr>

                </tbody>
            </table>

            <?php submit_button( __( 'Save Settings', 'pixza-site-manager' ), 'primary', 'pixza_save_settings' ); ?>
        </form>
    </div>
    <?php
}


// ---------------------------------------------------------------------------
// Admin page: Waitlist Emails
// ---------------------------------------------------------------------------

function pixza_page_waitlist_emails() {
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( esc_html__( 'You do not have permission to access this page.', 'pixza-site-manager' ) );
    }

    global $wpdb;
    $table = $wpdb->prefix . 'pixza_waitlist';

    // CSV export.
    if ( isset( $_GET['pixza_export_csv'] ) ) {
        check_admin_referer( 'pixza_export_csv_action', 'pixza_csv_nonce' );

        $rows = $wpdb->get_results( "SELECT email, name, created_at, ip_address FROM {$table} ORDER BY created_at DESC", ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared

        header( 'Content-Type: text/csv; charset=utf-8' );
        header( 'Content-Disposition: attachment; filename="pixza-waitlist-' . gmdate( 'Y-m-d' ) . '.csv"' );
        $out = fopen( 'php://output', 'w' );
        fputcsv( $out, array( 'Email', 'Name', 'Signed Up', 'IP Address' ) );
        foreach ( $rows as $row ) {
            fputcsv( $out, array( $row['email'], $row['name'], $row['created_at'], $row['ip_address'] ) );
        }
        fclose( $out );
        exit;
    }

    // Pagination.
    $per_page    = 50;
    $current_page = max( 1, intval( $_GET['paged'] ?? 1 ) );
    $offset      = ( $current_page - 1 ) * $per_page;

    $total = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table}" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
    $rows  = $wpdb->get_results( // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $wpdb->prepare(
            "SELECT id, email, name, created_at, ip_address FROM {$table} ORDER BY created_at DESC LIMIT %d OFFSET %d",
            $per_page,
            $offset
        )
    );

    $total_pages = (int) ceil( $total / $per_page );
    $export_url  = wp_nonce_url(
        add_query_arg( array( 'page' => 'pixza-waitlist-emails', 'pixza_export_csv' => '1' ), admin_url( 'admin.php' ) ),
        'pixza_export_csv_action',
        'pixza_csv_nonce'
    );
    ?>
    <div class="wrap">
        <h1 style="display:flex;align-items:center;gap:16px;">
            <?php esc_html_e( 'Waitlist Emails', 'pixza-site-manager' ); ?>
            <span class="pixza-badge" style="background:#2271b1;color:#fff;border-radius:12px;padding:2px 10px;font-size:13px;font-weight:600;">
                <?php echo esc_html( number_format_i18n( $total ) ); ?>
            </span>
        </h1>

        <p>
            <a href="<?php echo esc_url( $export_url ); ?>" class="button button-secondary">
                ⬇ <?php esc_html_e( 'Export to CSV', 'pixza-site-manager' ); ?>
            </a>
        </p>

        <?php if ( empty( $rows ) ) : ?>
            <p><?php esc_html_e( 'No waitlist entries yet.', 'pixza-site-manager' ); ?></p>
        <?php else : ?>
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th style="width:40px;"><?php esc_html_e( '#', 'pixza-site-manager' ); ?></th>
                        <th><?php esc_html_e( 'Email', 'pixza-site-manager' ); ?></th>
                        <th><?php esc_html_e( 'Name', 'pixza-site-manager' ); ?></th>
                        <th><?php esc_html_e( 'Signed Up', 'pixza-site-manager' ); ?></th>
                        <th><?php esc_html_e( 'IP Address', 'pixza-site-manager' ); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ( $rows as $row ) : ?>
                    <tr>
                        <td><?php echo esc_html( $row->id ); ?></td>
                        <td><?php echo esc_html( $row->email ); ?></td>
                        <td><?php echo esc_html( $row->name ?: '—' ); ?></td>
                        <td><?php echo esc_html( $row->created_at ); ?></td>
                        <td><?php echo esc_html( $row->ip_address ?: '—' ); ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>

            <?php if ( $total_pages > 1 ) : ?>
            <div class="tablenav bottom" style="margin-top:12px;">
                <div class="tablenav-pages">
                    <?php
                    echo paginate_links( array(
                        'base'      => add_query_arg( 'paged', '%#%' ),
                        'format'    => '',
                        'prev_text' => '&laquo;',
                        'next_text' => '&raquo;',
                        'total'     => $total_pages,
                        'current'   => $current_page,
                    ) );
                    ?>
                </div>
            </div>
            <?php endif; ?>
        <?php endif; ?>
    </div>
    <?php
}


// ---------------------------------------------------------------------------
// REST API – registration
// ---------------------------------------------------------------------------

add_action( 'rest_api_init', 'pixza_register_rest_routes' );

function pixza_register_rest_routes() {
    $ns = 'pixza/v1';

    // Site images
    register_rest_route( $ns, '/site-images', array(
        array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => 'pixza_rest_get_site_images',
            'permission_callback' => 'pixza_rest_auth',
        ),
        array(
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => 'pixza_rest_update_site_image',
            'permission_callback' => 'pixza_rest_auth',
            'args'                => array(
                'key' => array(
                    'required'          => true,
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_key',
                ),
                'url' => array(
                    'required'          => true,
                    'type'              => 'string',
                    'sanitize_callback' => 'esc_url_raw',
                ),
            ),
        ),
    ) );

    // Waitlist status
    register_rest_route( $ns, '/waitlist/status', array(
        array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => 'pixza_rest_get_waitlist_status',
            'permission_callback' => 'pixza_rest_auth',
        ),
        array(
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => 'pixza_rest_set_waitlist_status',
            'permission_callback' => 'pixza_rest_auth',
            'args'                => array(
                'enabled' => array(
                    'required' => true,
                    'type'     => 'boolean',
                ),
            ),
        ),
    ) );

    // Waitlist join (public – no secret required for submission)
    register_rest_route( $ns, '/waitlist/join', array(
        'methods'             => WP_REST_Server::CREATABLE,
        'callback'            => 'pixza_rest_waitlist_join',
        'permission_callback' => '__return_true',
        'args'                => array(
            'email' => array(
                'required'          => true,
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_email',
                'validate_callback' => function( $val ) {
                    return is_email( $val );
                },
            ),
            'name' => array(
                'required'          => false,
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
            ),
        ),
    ) );

    // Waitlist emails list (admin only via secret)
    register_rest_route( $ns, '/waitlist/emails', array(
        'methods'             => WP_REST_Server::READABLE,
        'callback'            => 'pixza_rest_get_waitlist_emails',
        'permission_callback' => 'pixza_rest_auth',
    ) );

    // Settings
    register_rest_route( $ns, '/settings', array(
        array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => 'pixza_rest_get_settings',
            'permission_callback' => 'pixza_rest_auth',
        ),
        array(
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => 'pixza_rest_update_settings',
            'permission_callback' => 'pixza_rest_auth',
        ),
    ) );

    // Google OAuth sync
    register_rest_route( $ns, '/google-auth', array(
        'methods'             => WP_REST_Server::CREATABLE,
        'callback'            => 'pixza_rest_google_auth',
        'permission_callback' => 'pixza_rest_auth',
        'args'                => array(
            'email'  => array( 'required' => true,  'type' => 'string', 'sanitize_callback' => 'sanitize_email' ),
            'name'   => array( 'required' => false, 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ),
            'avatar' => array( 'required' => false, 'type' => 'string', 'sanitize_callback' => 'esc_url_raw' ),
        ),
    ) );
}

// ---------------------------------------------------------------------------
// REST API – authentication helper
// ---------------------------------------------------------------------------

function pixza_rest_auth( WP_REST_Request $request ) {
    $stored_secret = get_option( 'pixza_wp_secret', '' );

    // If no secret is configured, deny all requests.
    if ( empty( $stored_secret ) ) {
        return new WP_Error(
            'pixza_no_secret',
            __( 'API secret not configured.', 'pixza-site-manager' ),
            array( 'status' => 500 )
        );
    }

    $provided = $request->get_header( 'X-WP-Secret' );

    if ( empty( $provided ) || ! hash_equals( $stored_secret, $provided ) ) {
        return new WP_Error(
            'pixza_unauthorized',
            __( 'Invalid or missing X-WP-Secret header.', 'pixza-site-manager' ),
            array( 'status' => 401 )
        );
    }

    return true;
}


// ---------------------------------------------------------------------------
// REST API – callbacks: Site Images
// ---------------------------------------------------------------------------

function pixza_rest_get_site_images( WP_REST_Request $request ) {
    $images = array();
    foreach ( pixza_default_images() as $key => $default ) {
        $images[ $key ] = get_option( 'pixza_img_' . $key, $default );
    }
    return rest_ensure_response( $images );
}

function pixza_rest_update_site_image( WP_REST_Request $request ) {
    $key = $request->get_param( 'key' );
    $url = $request->get_param( 'url' );

    $allowed = array_keys( pixza_default_images() );
    if ( ! in_array( $key, $allowed, true ) ) {
        return new WP_Error(
            'pixza_invalid_key',
            __( 'Invalid image key.', 'pixza-site-manager' ),
            array( 'status' => 400 )
        );
    }

    update_option( 'pixza_img_' . $key, $url );

    return rest_ensure_response( array(
        'success' => true,
        'key'     => $key,
        'url'     => $url,
    ) );
}

// ---------------------------------------------------------------------------
// REST API – callbacks: Waitlist Status
// ---------------------------------------------------------------------------

function pixza_rest_get_waitlist_status( WP_REST_Request $request ) {
    global $wpdb;
    $table = $wpdb->prefix . 'pixza_waitlist';
    $count = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table}" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared

    return rest_ensure_response( array(
        'enabled' => (bool) get_option( 'pixza_waitlist_enabled', '0' ),
        'count'   => $count,
    ) );
}

function pixza_rest_set_waitlist_status( WP_REST_Request $request ) {
    $enabled = (bool) $request->get_param( 'enabled' );
    update_option( 'pixza_waitlist_enabled', $enabled ? '1' : '0' );

    return rest_ensure_response( array(
        'success' => true,
        'enabled' => $enabled,
    ) );
}

// ---------------------------------------------------------------------------
// REST API – callbacks: Waitlist Join
// ---------------------------------------------------------------------------

function pixza_rest_waitlist_join( WP_REST_Request $request ) {
    global $wpdb;
    $table = $wpdb->prefix . 'pixza_waitlist';

    $email = $request->get_param( 'email' );
    $name  = $request->get_param( 'name' ) ?? '';

    // Duplicate check.
    $exists = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE email = %s LIMIT 1", $email ) ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
    if ( $exists ) {
        return rest_ensure_response( array(
            'success' => true,
            'message' => __( 'Already on the waitlist.', 'pixza-site-manager' ),
        ) );
    }

    // Retrieve IP safely.
    $ip = '';
    if ( ! empty( $_SERVER['HTTP_CF_CONNECTING_IP'] ) ) {
        $ip = sanitize_text_field( wp_unslash( $_SERVER['HTTP_CF_CONNECTING_IP'] ) );
    } elseif ( ! empty( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) {
        $forwarded = sanitize_text_field( wp_unslash( $_SERVER['HTTP_X_FORWARDED_FOR'] ) );
        $ip        = trim( explode( ',', $forwarded )[0] );
    } elseif ( ! empty( $_SERVER['REMOTE_ADDR'] ) ) {
        $ip = sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) );
    }

    $inserted = $wpdb->insert(
        $table,
        array(
            'email'      => $email,
            'name'       => $name,
            'ip_address' => $ip,
            'created_at' => current_time( 'mysql', true ),
        ),
        array( '%s', '%s', '%s', '%s' )
    );

    if ( false === $inserted ) {
        return new WP_Error(
            'pixza_db_error',
            __( 'Could not save your email. Please try again.', 'pixza-site-manager' ),
            array( 'status' => 500 )
        );
    }

    return rest_ensure_response( array(
        'success' => true,
        'message' => __( 'You have been added to the waitlist!', 'pixza-site-manager' ),
    ) );
}

// ---------------------------------------------------------------------------
// REST API – callbacks: Waitlist Emails List
// ---------------------------------------------------------------------------

function pixza_rest_get_waitlist_emails( WP_REST_Request $request ) {
    global $wpdb;
    $table = $wpdb->prefix . 'pixza_waitlist';

    $limit  = min( 1000, max( 1, intval( $request->get_param( 'limit' ) ?: 200 ) ) );
    $offset = max( 0, intval( $request->get_param( 'offset' ) ?: 0 ) );

    $rows = $wpdb->get_results( // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $wpdb->prepare(
            "SELECT id, email, name, created_at, ip_address FROM {$table} ORDER BY created_at DESC LIMIT %d OFFSET %d",
            $limit,
            $offset
        ),
        ARRAY_A
    );

    $total = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table}" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared

    return rest_ensure_response( array(
        'total'  => $total,
        'emails' => $rows,
    ) );
}

// ---------------------------------------------------------------------------
// REST API – callbacks: Settings
// ---------------------------------------------------------------------------

function pixza_rest_get_settings( WP_REST_Request $request ) {
    $images = array();
    foreach ( pixza_default_images() as $key => $default ) {
        $images[ $key ] = get_option( 'pixza_img_' . $key, $default );
    }

    return rest_ensure_response( array(
        'waitlist_enabled' => (bool) get_option( 'pixza_waitlist_enabled', '0' ),
        'banner_enabled'   => (bool) get_option( 'pixza_banner_enabled',   '0' ),
        'banner_text'      => get_option( 'pixza_banner_text', '' ),
        'images'           => $images,
    ) );
}

function pixza_rest_update_settings( WP_REST_Request $request ) {
    $body = $request->get_json_params();

    if ( isset( $body['waitlist_enabled'] ) ) {
        update_option( 'pixza_waitlist_enabled', $body['waitlist_enabled'] ? '1' : '0' );
    }
    if ( isset( $body['banner_enabled'] ) ) {
        update_option( 'pixza_banner_enabled', $body['banner_enabled'] ? '1' : '0' );
    }
    if ( isset( $body['banner_text'] ) ) {
        update_option( 'pixza_banner_text', sanitize_text_field( $body['banner_text'] ) );
    }
    if ( isset( $body['images'] ) && is_array( $body['images'] ) ) {
        $allowed = array_keys( pixza_default_images() );
        foreach ( $body['images'] as $key => $url ) {
            $key = sanitize_key( $key );
            if ( in_array( $key, $allowed, true ) ) {
                update_option( 'pixza_img_' . $key, esc_url_raw( $url ) );
            }
        }
    }

    return rest_ensure_response( array( 'success' => true ) );
}


// ---------------------------------------------------------------------------
// Inline media-picker JS (fallback if assets/media-picker.js is absent)
// ---------------------------------------------------------------------------

add_action( 'admin_footer', 'pixza_inline_media_picker_script' );

function pixza_inline_media_picker_script() {
    $screen = get_current_screen();
    if ( ! $screen || 'toplevel_page_pixza-site-images' !== $screen->id ) {
        return;
    }
    // Only output if the external file was NOT enqueued (i.e., file doesn't exist).
    if ( file_exists( PIXZA_PLUGIN_DIR . 'assets/media-picker.js' ) ) {
        return;
    }
    ?>
    <script>
    /* Pixza inline media picker – loaded when assets/media-picker.js is absent */
    (function($){
        $(document).on('click', '.pixza-media-btn', function(){
            var targetId = $(this).data('target');
            if ( typeof wp === 'undefined' || ! wp.media ) { return; }
            var frame = wp.media({
                title: 'Select or Upload Image',
                button: { text: 'Use this image' },
                multiple: false
            });
            frame.on('select', function(){
                var attachment = frame.state().get('selection').first().toJSON();
                $('#' + targetId).val(attachment.url);
                var $card = $('#' + targetId).closest('.pixza-image-card');
                var $img  = $card.find('img');
                if ( $img.length ) {
                    $img.attr('src', attachment.url).show();
                } else {
                    $card.find('div:first-child').html('<img src="' + attachment.url + '" style="width:100%;height:80px;object-fit:cover;" />');
                }
            });
            frame.open();
        });

        $(document).on('click', '.pixza-reset-btn', function(){
            var targetId   = $(this).data('target');
            var defaultVal = $(this).data('default') || '';
            $('#' + targetId).val(defaultVal);
        });
    })(jQuery);
    </script>
    <?php
}


// ---------------------------------------------------------------------------
// REST API – Google OAuth sync
// Creates or logs in a WP user from Google OAuth data
// Called by Next.js after successful Google sign-in
// ---------------------------------------------------------------------------

function pixza_rest_google_auth( WP_REST_Request $request ) {
    $email  = $request->get_param( 'email' );
    $name   = $request->get_param( 'name' )   ?? '';
    $avatar = $request->get_param( 'avatar' ) ?? '';

    if ( ! is_email( $email ) ) {
        return new WP_Error( 'invalid_email', 'Invalid email address.', array( 'status' => 400 ) );
    }

    // Check if user exists
    $user = get_user_by( 'email', $email );

    if ( ! $user ) {
        // Create new WP user
        $username = sanitize_user( strtolower( explode( '@', $email )[0] ) . '_' . wp_rand( 100, 999 ) );
        // Ensure username is unique
        while ( username_exists( $username ) ) {
            $username = sanitize_user( strtolower( explode( '@', $email )[0] ) . '_' . wp_rand( 1000, 9999 ) );
        }

        $user_id = wp_create_user( $username, wp_generate_password( 24, true, true ), $email );

        if ( is_wp_error( $user_id ) ) {
            return new WP_Error( 'create_failed', $user_id->get_error_message(), array( 'status' => 500 ) );
        }

        // Set display name
        wp_update_user( array(
            'ID'           => $user_id,
            'display_name' => $name ?: $username,
            'first_name'   => $name ? explode( ' ', $name )[0] : '',
        ) );

        // Set default meta
        update_user_meta( $user_id, 'pixza_plan',             'free' );
        update_user_meta( $user_id, 'pixza_credits',          100 );
        update_user_meta( $user_id, 'pixza_credits_limit',    100 );
        update_user_meta( $user_id, 'pixza_google_avatar',    $avatar );
        update_user_meta( $user_id, 'pixza_auth_provider',    'google' );

        $user = get_user_by( 'id', $user_id );
    } else {
        // Update avatar if provided
        if ( $avatar ) {
            update_user_meta( $user->ID, 'pixza_google_avatar', $avatar );
        }
    }

    // Generate a signed session token using the WP API secret
    $secret_key = defined( 'JWT_AUTH_SECRET_KEY' ) ? JWT_AUTH_SECRET_KEY : get_option( 'pixza_wp_secret', '' );

    if ( empty( $secret_key ) ) {
        return new WP_Error( 'no_secret', 'JWT secret not configured.', array( 'status' => 500 ) );
    }

    $token_data = array(
        'iss'  => get_bloginfo( 'url' ),
        'iat'  => time(),
        'nbf'  => time(),
        'exp'  => time() + ( DAY_IN_SECONDS * 7 ),
        'data' => array(
            'user' => array(
                'id' => $user->ID,
            ),
        ),
    );

    // Manual JWT encoding (HS256) – URL-safe base64
    $header  = rtrim( strtr( base64_encode( wp_json_encode( array( 'typ' => 'JWT', 'alg' => 'HS256' ) ) ), '+/', '-_' ), '=' );
    $payload = rtrim( strtr( base64_encode( wp_json_encode( $token_data ) ), '+/', '-_' ), '=' );
    $sig     = rtrim( strtr( base64_encode( hash_hmac( 'sha256', "$header.$payload", $secret_key, true ) ), '+/', '-_' ), '=' );
    $token   = "$header.$payload.$sig";

    return rest_ensure_response( array(
        'token'      => $token,
        'user_email' => $user->user_email,
        'user_login' => $user->user_login,
        'user_id'    => $user->ID,
    ) );
}
