<?php
namespace OmniChat\Auth;

use PDO;
use OmniChat\Core\Logger;

class AuthService {
    public static function login(PDO $pdo, string $email, string $password): array {
        $stmt = $pdo->prepare("SELECT * FROM omni_operators WHERE email = ?");
        $stmt->execute([$email]);
        $op = $stmt->fetch();

        if (!$op || !password_verify($password, $op['password_hash'])) {
            Logger::warning("Failed login attempt for email: {$email}");
            throw new \Exception("ایمیل یا رمز عبور اشتباه است.");
        }

        // Generate high-entropy 64-char hex session token
        $token = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', time() + (86400 * 30)); // 30 days
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $ua = substr($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown', 0, 255);

        $sess = $pdo->prepare("INSERT INTO omni_sessions (id, operator_id, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)");
        $sess->execute([$token, $op['id'], $ip, $ua, $expiresAt]);

        // Update operator status to online
        $upd = $pdo->prepare("UPDATE omni_operators SET status = 'online' WHERE id = ?");
        $upd->execute([$op['id']]);

        Logger::info("Successful operator login", ['operator_id' => $op['id'], 'email' => $op['email']]);

        unset($op['password_hash']);
        return [
            'token' => $token,
            'operator' => self::formatOperator($op)
        ];
    }

    public static function validateToken(PDO $pdo, string $token): ?array {
        if (empty($token)) return null;

        $stmt = $pdo->prepare("
            SELECT s.id as session_id, s.expires_at, o.* 
            FROM omni_sessions s
            JOIN omni_operators o ON s.operator_id = o.id
            WHERE s.id = ? AND s.expires_at > NOW()
        ");
        $stmt->execute([$token]);
        $row = $stmt->fetch();

        if (!$row) return null;

        unset($row['password_hash']);
        return self::formatOperator($row);
    }

    public static function logout(PDO $pdo, string $token): void {
        $stmt = $pdo->prepare("DELETE FROM omni_sessions WHERE id = ?");
        $stmt->execute([$token]);
    }

    public static function checkPermission(array $operator, string $requiredRole = 'agent'): bool {
        $roles = ['agent' => 1, 'supervisor' => 2, 'admin' => 3];
        $userLevel = $roles[$operator['role'] ?? 'agent'] ?? 1;
        $reqLevel = $roles[$requiredRole] ?? 1;
        return $userLevel >= $reqLevel;
    }

    public static function formatOperator(array $row): array {
        return [
            'id' => $row['id'],
            'name' => $row['name'],
            'email' => $row['email'],
            'role' => $row['role'],
            'departmentId' => $row['department_id'],
            'status' => $row['status'],
            'avatar' => $row['avatar'],
            'ratingAvg' => (float)($row['rating_avg'] ?? 5.0)
        ];
    }
}
