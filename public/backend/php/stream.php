<?php
/**
 * OmniChat High-Performance Low-Resource SSE Realtime Stream
 * EventSource stream with Last-Event-ID, typing, heartbeat and auto-reconnect
 */

require_once __DIR__ . '/bootstrap.php';

use OmniChat\Database\Database;
use OmniChat\Realtime\SSEService;
use OmniChat\Core\Security;
use OmniChat\Auth\AuthService;
use OmniChat\API\AuthController;

Security::initCors();

$convId = trim($_GET['conv_id'] ?? $_GET['conversation_id'] ?? '');
$lastId = (int)($_GET['last_id'] ?? 0);
$role = ($_GET['role'] ?? '') === 'operator' ? 'operator' : 'visitor';

try {
    $pdo = Database::getInstance();
    
    // Check if operator token supplied
    $token = AuthController::getBearerToken() ?: ($_GET['token'] ?? '');
    if ($token) {
        $op = AuthService::validateToken($pdo, $token);
        if ($op) {
            $role = 'operator';
        }
    }

    SSEService::stream($pdo, $convId, $lastId, $role);
} catch (\Throwable $e) {
    http_response_code(500);
    echo "event: error\ndata: " . json_encode(['error' => $e->getMessage()]) . "\n\n";
    exit;
}
