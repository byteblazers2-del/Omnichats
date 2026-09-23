<?php
namespace OmniChat\Core;

use PDO;

class Security {
    public static function initCors(): void {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
        $allowedOrigins = Config::get('app.cors_allowed_origins', ['*']);

        if (in_array('*', $allowedOrigins, true) || in_array($origin, $allowedOrigins, true)) {
            header("Access-Control-Allow-Origin: {$origin}");
        }
        
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Last-Event-ID');

        if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }

    public static function sanitizeString(?string $str, int $maxLength = 5000): string {
        if ($str === null) return '';
        $clean = trim($str);
        // Strip null bytes and non-printable control chars except standard newlines/tabs
        $clean = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $clean);
        $clean = strip_tags($clean);
        return mb_substr($clean, 0, $maxLength, 'UTF-8');
    }

    public static function sanitizeEmail(?string $email): string {
        if (!$email) return '';
        return filter_var(trim($email), FILTER_SANITIZE_EMAIL) ?: '';
    }

    public static function validateRateLimit(PDO $pdo, string $action = 'api', int $maxAttempts = 120, int $windowSeconds = 60): bool {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $ipHash = hash('sha256', $ip . Config::get('app.secret_key'));
        $now = time();

        try {
            // Clean up old rate limits occasionally (1 in 100 chance)
            if (mt_rand(1, 100) === 1) {
                $del = $pdo->prepare("DELETE FROM omni_rate_limits WHERE window_start < ?");
                $del->execute([$now - 3600]);
            }

            $stmt = $pdo->prepare("SELECT attempts, window_start FROM omni_rate_limits WHERE ip_hash = ? AND action = ?");
            $stmt->execute([$ipHash, $action]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($row) {
                if ($now - $row['window_start'] > $windowSeconds) {
                    // Reset window
                    $upd = $pdo->prepare("UPDATE omni_rate_limits SET attempts = 1, window_start = ? WHERE ip_hash = ? AND action = ?");
                    $upd->execute([$now, $ipHash, $action]);
                    return true;
                } else {
                    if ($row['attempts'] >= $maxAttempts) {
                        Logger::warning("Rate limit exceeded for action: {$action}", ['ip' => $ip]);
                        return false;
                    }
                    $upd = $pdo->prepare("UPDATE omni_rate_limits SET attempts = attempts + 1 WHERE ip_hash = ? AND action = ?");
                    $upd->execute([$ipHash, $action]);
                    return true;
                }
            } else {
                $ins = $pdo->prepare("INSERT INTO omni_rate_limits (ip_hash, action, attempts, window_start) VALUES (?, ?, 1, ?)");
                $ins->execute([$ipHash, $action, $now]);
                return true;
            }
        } catch (\Exception $e) {
            // Fail open if table doesn't exist yet during install
            return true;
        }
    }

    public static function generateCsrfToken(): string {
        if (empty($_SESSION['omnichat_csrf_token'])) {
            $_SESSION['omnichat_csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['omnichat_csrf_token'];
    }

    public static function validateCsrfToken(?string $token): bool {
        if (!$token || empty($_SESSION['omnichat_csrf_token'])) {
            return false;
        }
        return hash_equals($_SESSION['omnichat_csrf_token'], $token);
    }
}
