<?php
namespace OmniChat\Realtime;

use PDO;
use OmniChat\Chat\MessageService;

class SSEService {
    public static function stream(PDO $pdo, string $convId, int $lastId = 0, string $currentRole = 'visitor'): void {
        // SSE Headers
        header('Content-Type: text/event-stream; charset=utf-8');
        header('Cache-Control: no-cache, no-transform');
        header('Connection: keep-alive');
        header('X-Accel-Buffering: no'); // Nginx reverse proxy buffering disabled

        // Release PHP session lock immediately so concurrent requests aren't blocked
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_write_close();
        }

        // Support Last-Event-ID HTTP Header
        if (isset($_SERVER['HTTP_LAST_EVENT_ID']) && is_numeric($_SERVER['HTTP_LAST_EVENT_ID'])) {
            $lastId = (int)$_SERVER['HTTP_LAST_EVENT_ID'];
        }

        ignore_user_abort(true);
        set_time_limit(30);

        $startTime = time();
        $lastPing = time();
        $lastTypingState = false;

        // Tell client to retry after 2000ms if disconnected
        echo "retry: 2000\n\n";
        if (ob_get_level() > 0) ob_flush();
        flush();

        while (!connection_aborted() && (time() - $startTime < 25)) {
            // 1. Fetch new messages indexed by id > lastId
            if (!empty($convId)) {
                $stmt = $pdo->prepare("
                    SELECT * FROM omni_messages 
                    WHERE conversation_id = ? AND id > ? 
                    ORDER BY id ASC LIMIT 20
                ");
                $stmt->execute([$convId, $lastId]);
                $rows = $stmt->fetchAll();

                if (!empty($rows)) {
                    foreach ($rows as $row) {
                        $lastId = (int)$row['id'];
                        $formatted = MessageService::formatMessage($row);
                        
                        echo "id: {$lastId}\n";
                        echo "event: message\n";
                        echo "data: " . json_encode($formatted, JSON_UNESCAPED_UNICODE) . "\n\n";
                    }
                    if (ob_get_level() > 0) ob_flush();
                    flush();
                }

                // 2. Check typing indicator for the other party
                $excludeSender = ($currentRole === 'operator') ? 'operator' : 'visitor';
                $typingRow = MessageService::getTyping($pdo, $convId, $excludeSender);
                $isTypingNow = ($typingRow !== null);

                if ($isTypingNow !== $lastTypingState) {
                    $lastTypingState = $isTypingNow;
                    echo "event: typing\n";
                    echo "data: " . json_encode([
                        'isTyping' => $isTypingNow,
                        'senderName' => $typingRow['sender_name'] ?? ''
                    ], JSON_UNESCAPED_UNICODE) . "\n\n";
                    
                    if (ob_get_level() > 0) ob_flush();
                    flush();
                }
            }

            // 3. Heartbeat ping every 10 seconds to keep connection alive through NAT/firewalls
            if (time() - $lastPing >= 10) {
                $lastPing = time();
                echo ": heartbeat " . time() . "\n\n";
                if (ob_get_level() > 0) ob_flush();
                flush();
            }

            // 1-second gentle sleep interval (zero CPU impact on cPanel / shared hosts)
            sleep(1);
        }

        // Final gentle close so browser reconnects gracefully
        echo ": end-stream\n\n";
        if (ob_get_level() > 0) ob_flush();
        flush();
    }
}
