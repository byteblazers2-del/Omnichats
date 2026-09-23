<?php
/**
 * Plugin Name: OmniChat Enterprise Live Support
 * Plugin URI: https://omnichat.local
 * Description: افزونه رسمی گفتگوی آنلاین سازمانی برای وردپرس و ووکامرس (سلف‌هاستد، بدون وابستگی، ذخیره در دیتابیس خود سایت)
 * Version: 3.0.0
 * Author: OmniChat Enterprise
 * Text Domain: omnichat-wp
 * Domain Path: /languages
 */

if (!defined('ABSPATH')) exit;

class OmniChat_WordPress_Plugin {
    
    public function __construct() {
        register_activation_hook(__FILE__, [$this, 'activate']);
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('wp_footer', [$this, 'render_client_widget']);
    }

    public function activate() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();

        // Create Plugin Tables using WordPress DB prefix
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

        $table_conv = $wpdb->prefix . 'omni_conversations';
        $sql_conv = "CREATE TABLE IF NOT EXISTS $table_conv (
            id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            visitor_name varchar(100) NOT NULL,
            visitor_email varchar(150) NULL,
            user_id bigint(20) UNSIGNED NULL,
            status varchar(20) DEFAULT 'waiting',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";
        dbDelta($sql_conv);

        $table_msg = $wpdb->prefix . 'omni_messages';
        $sql_msg = "CREATE TABLE IF NOT EXISTS $table_msg (
            id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            conversation_id bigint(20) UNSIGNED NOT NULL,
            sender_type varchar(20) NOT NULL,
            sender_name varchar(100) NOT NULL,
            message_text text NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";
        dbDelta($sql_msg);
    }

    public function add_admin_menu() {
        add_menu_page(
            'پشتیبانی آنلاین OmniChat',
            'پشتیبانی OmniChat',
            'manage_options',
            'omnichat-settings',
            [$this, 'render_settings_page'],
            'dashicons-format-chat',
            25
        );
    }

    public function register_settings() {
        register_setting('omnichat_opts_group', 'omnichat_enabled');
        register_setting('omnichat_opts_group', 'omnichat_primary_color');
        register_setting('omnichat_opts_group', 'omnichat_welcome_msg');
    }

    public function render_settings_page() {
        ?>
        <div class="wrap" dir="rtl" style="font-family: Tahoma, sans-serif;">
            <h1>تنظیمات سامانه گفتگوی آنلاین OmniChat Enterprise</h1>
            <p>این افزونه به صورت ۱۰۰٪ سلف‌هاستد و مستقل روی سرور و دیتابیس وردپرس شما کار می‌کند.</p>

            <form method="post" action="options.php" style="background:#fff; padding:20px; border-radius:12px; max-width:600px; box-shadow:0 2px 10px rgba(0,0,0,0.05); margin-top:20px;">
                <?php settings_fields('omnichat_opts_group'); ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">وضعیت ویجت چت</th>
                        <td>
                            <label>
                                <input type="checkbox" name="omnichat_enabled" value="1" <?php checked(1, get_option('omnichat_enabled', 1)); ?> />
                                فعال‌سازی ویجت گفتگو در صفحات سایت
                            </label>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">رنگ تم سازمانی</th>
                        <td>
                            <input type="color" name="omnichat_primary_color" value="<?php echo esc_attr(get_option('omnichat_primary_color', '#007AFF')); ?>" />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">پیام خوش‌آمدگویی پیش‌فرض</th>
                        <td>
                            <textarea name="omnichat_welcome_msg" rows="3" class="large-text"><?php echo esc_textarea(get_option('omnichat_welcome_msg', 'سلام! چطور می‌توانیم به شما کمک کنیم؟')); ?></textarea>
                        </td>
                    </tr>
                </table>

                <?php submit_button('ذخیره تغییرات'); ?>
            </form>
        </div>
        <?php
    }

    public function render_client_widget() {
        if (!get_option('omnichat_enabled', 1)) return;

        $currentUser = wp_get_current_user();
        $userData = [
            'is_logged_in' => is_user_logged_in(),
            'name' => is_user_logged_in() ? $currentUser->display_name : '',
            'email' => is_user_logged_in() ? $currentUser->user_email : ''
        ];
        ?>
        <script>
            window.OmniChatConfig = <?php echo json_encode($userData); ?>;
        </script>
        <script src="<?php echo plugins_url('widget.js', __FILE__); ?>" async></script>
        <?php
    }
}

new OmniChat_WordPress_Plugin();
