<?php
namespace OmniChat\Core;

class Config {
    private static ?array $settings = null;
    private static string $configFile = __DIR__ . '/../../config.php';

    public static function load(): array {
        if (self::$settings !== null) {
            return self::$settings;
        }

        if (file_exists(self::$configFile)) {
            self::$settings = require self::$configFile;
        } else {
            self::$settings = [
                'db' => [
                    'host' => getenv('DB_HOST') ?: '127.0.0.1',
                    'port' => getenv('DB_PORT') ?: 3306,
                    'name' => getenv('DB_NAME') ?: 'omnichat_db',
                    'user' => getenv('DB_USER') ?: 'root',
                    'pass' => getenv('DB_PASS') ?: '',
                    'charset' => 'utf8mb4'
                ],
                'app' => [
                    'secret_key' => getenv('APP_SECRET') ?: 'omnichat_default_secret_key_change_me',
                    'environment' => getenv('APP_ENV') ?: 'production',
                    'cors_allowed_origins' => ['*'],
                    'rate_limit_per_minute' => 120,
                    'max_upload_size_mb' => 10,
                    'allowed_upload_extensions' => ['png', 'jpg', 'jpeg', 'gif', 'webp', 'pdf', 'zip', 'txt', 'docx', 'xlsx']
                ]
            ];
        }

        return self::$settings;
    }

    public static function get(string $key, $default = null) {
        $data = self::load();
        $parts = explode('.', $key);
        foreach ($parts as $part) {
            if (!is_array($data) || !isset($data[$part])) {
                return $default;
            }
            $data = $data[$part];
        }
        return $data;
    }

    public static function save(array $newConfig): bool {
        self::$settings = $newConfig;
        $content = "<?php\n// OmniChat Enterprise Self-Hosted Configuration\n// Auto-generated on " . date('Y-m-d H:i:s') . "\n\nreturn " . var_export($newConfig, true) . ";\n";
        return (bool)file_put_contents(self::$configFile, $content, LOCK_EX);
    }

    public static function isInstalled(): bool {
        $lockFile = __DIR__ . '/../../installed.lock';
        return file_exists($lockFile);
    }
}
