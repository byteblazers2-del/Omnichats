<?php
/**
 * Plugin Name: OmniChat Self-Hosted Live Support
 * Plugin URI: https://github.com/omnichat/self-hosted
 * Description: افزونه بومی و فوق‌العاده سبک چت آنلاین بدون نیاز به سرویس‌های اشتراکی خارجی و سازگار کامل با ووکامرس.
 * Version: 3.0.0
 * Author: OmniChat Enterprise
 * Text Domain: omni-chat
 */

if (!defined('ABSPATH')) {
    exit;
}

class OmniChat_WP_Plugin {

    public function __construct() {
        add_action('wp_footer', [$this, 'inject_widget_script']);
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);
    }

    public function inject_widget_script() {
        $server_url = get_option('omnichat_server_url', site_url('/omnichat'));
        $current_user = wp_get_current_user();
        
        $user_meta = [
            'isLoggedIn' => is_user_logged_in(),
            'name' => is_user_logged_in() ? $current_user->display_name : 'مهمان',
            'email' => is_user_logged_in() ? $current_user->user_email : '',
        ];

        // WooCommerce Cart value detection if active
        if (function_exists('WC') && WC()->cart) {
            $user_meta['cartCount'] = WC()->cart->get_cart_contents_count();
            $user_meta['cartTotal'] = WC()->cart->get_cart_total();
        }

        ?>
        <!-- OmniChat Native WordPress Micro-Widget -->
        <script>
            window.OmniChatConfig = {
                endpoint: "<?php echo esc_url($server_url); ?>",
                userData: <?php echo json_encode($user_meta); ?>,
                lazy: true,
                compressImages: true
            };
            (function(d, s, u) {
                var js = d.createElement(s); js.async = true; js.defer = true;
                js.src = u + '/widget.min.js';
                var h = d.getElementsByTagName(s)[0]; h.parentNode.insertBefore(js, h);
            })(document, 'script', "<?php echo esc_url($server_url); ?>");
        </script>
        <?php
    }

    public function add_admin_menu() {
        add_menu_page(
            'چت آنلاین OmniChat',
            'چت آنلاین',
            'manage_options',
            'omnichat-settings',
            [$this, 'render_admin_page'],
            'dashicons-format-chat',
            30
        );
    }

    public function register_settings() {
        register_setting('omnichat_options', 'omnichat_server_url');
    }

    public function render_admin_page() {
        ?>
        <div class="wrap" style="max-width: 600px; direction: rtl;">
            <h1>تنظیمات افزونه چت آنلاین مستقل OmniChat</h1>
            <p>این افزونه ویجت چت را به شکل خودکار در تمام صفحات فروشگاه و وبسایت بارگذاری می‌کند.</p>
            <form method="post" action="options.php">
                <?php
                settings_fields('omnichat_options');
                do_settings_sections('omnichat_options');
                ?>
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row">آدرس سرور بک‌اند چت:</th>
                        <td>
                            <input type="text" name="omnichat_server_url" value="<?php echo esc_attr(get_option('omnichat_server_url', site_url('/omnichat'))); ?>" class="regular-text" style="direction: ltr;" />
                            <p class="description">آدرس پوشه‌ای که فایل‌های backend/php را در آن آپلود کرده‌اید.</p>
                        </td>
                    </tr>
                </table>
                <?php submit_button('ذخیره تنظیمات'); ?>
            </form>
        </div>
        <?php
    }
}

new OmniChat_WP_Plugin();
