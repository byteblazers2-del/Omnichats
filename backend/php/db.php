<?php
/**
 * OmniChat Enterprise - Database Connection & Core Helper
 * Zero-dependency, pure PDO with prepared statements
 */

if (!file_exists(__DIR__ . '/config.php')) {
    http_response_code(503);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'status' => 'error',
        'message' => 'OmniChat is not installed yet. Please run /backend/php/install.php first.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

require_once __DIR__ . '/config.php';

class DB {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . (defined('DB_PORT') ? DB_PORT : 3306) . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            try {
                self::$instance = new PDO($dsn, DB_USER, DB_PASS, $options);
            } catch (PDOException $e) {
                http_response_code(500);
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Database connection failed: ' . $e->getMessage()
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
        }
        return self::$instance;
    }
}

// Simple JWT / Token Auth Helper
class Auth {
    public static function generateToken(array $payload): string {
        $secret = defined('JWT_SECRET') ? JWT_SECRET : 'omni_enterprise_secret_key_change_me';
        $header = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
        $payload['exp'] = time() + (86400 * 7); // 7 days validity
        $payloadEncoded = base64_encode(json_encode($payload));
        $signature = hash_hmac('sha256', "$header.$payloadEncoded", $secret, true);
        $signatureEncoded = base64_encode($signature);
        return "$header.$payloadEncoded.$signatureEncoded";
    }

    public static function verifyToken(?string $token): ?array {
        if (!$token) return null;
        $secret = defined('JWT_SECRET') ? JWT_SECRET : 'omni_enterprise_secret_key_change_me';
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;
        [$header, $payload, $signature] = $parts;
        $validSignature = base64_encode(hash_hmac('sha256', "$header.$payload", $secret, true));
        if (!hash_equals($signature, $validSignature)) return null;
        $data = json_decode(base64_decode($payload), true);
        if (!$data || (isset($data['exp']) && $data['exp'] < time())) return null;
        return $data;
    }

    public static function getBearerToken(): ?string {
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? null;
        if ($authHeader && preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return $matches[1];
        }
        return $_GET['token'] ?? null;
    }
}
