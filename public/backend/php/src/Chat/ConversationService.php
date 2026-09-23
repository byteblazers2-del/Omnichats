<?php
namespace OmniChat\Chat;

use PDO;
use OmniChat\Core\Security;

class ConversationService {
    public static function getConversations(PDO $pdo, array $filters = []): array {
        $sql = "SELECT c.* FROM omni_conversations c WHERE 1=1 ";
        $params = [];

        if (!empty($filters['status'])) {
            $sql .= " AND c.status = ? ";
            $params[] = $filters['status'];
        }

        if (!empty($filters['department_id'])) {
            $sql .= " AND c.department_id = ? ";
            $params[] = $filters['department_id'];
        }

        if (!empty($filters['operator_id'])) {
            $sql .= " AND (c.operator_id = ? OR c.operator_id IS NULL) ";
            $params[] = $filters['operator_id'];
        }

        if (!empty($filters['search'])) {
            $sql .= " AND (c.visitor_name LIKE ? OR c.visitor_email LIKE ? OR c.visitor_phone LIKE ?) ";
            $term = '%' . $filters['search'] . '%';
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        $sql .= " ORDER BY c.last_message_at DESC LIMIT 100";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $convs = $stmt->fetchAll();

        $result = [];
        foreach ($convs as $c) {
            // Fetch last 30 messages for active context
            $stmtMsg = $pdo->prepare("
                SELECT * FROM (
                    SELECT * FROM omni_messages WHERE conversation_id = ? ORDER BY id DESC LIMIT 30
                ) sub ORDER BY id ASC
            ");
            $stmtMsg->execute([$c['id']]);
            $msgs = $stmtMsg->fetchAll();

            $formattedMsgs = array_map([MessageService::class, 'formatMessage'], $msgs);

            $result[] = [
                'id' => $c['id'],
                'visitorId' => $c['visitor_id'],
                'visitorName' => $c['visitor_name'],
                'visitorEmail' => $c['visitor_email'],
                'visitorPhone' => $c['visitor_phone'],
                'visitorIp' => $c['visitor_ip'],
                'visitorLocation' => $c['visitor_location'] ?: 'ایران',
                'visitorBrowser' => $c['visitor_browser'] ?: 'Chrome',
                'visitorDevice' => $c['visitor_device'] ?: 'Desktop',
                'currentPage' => $c['current_page'] ?: '/',
                'departmentId' => $c['department_id'] ?: 'dept_tech',
                'operatorId' => $c['operator_id'],
                'status' => $c['status'],
                'unreadCount' => (int)$c['unread_count'],
                'isBlocked' => (bool)$c['is_blocked'],
                'blockedReason' => $c['blocked_reason'],
                'tags' => !empty($c['tags']) ? json_decode($c['tags'], true) : [],
                'internalNotes' => !empty($c['internal_notes']) ? json_decode($c['internal_notes'], true) : [],
                'lastMessageAt' => date('H:i', strtotime($c['last_message_at'])),
                'messages' => $formattedMsgs
            ];
        }

        return $result;
    }

    public static function updateMeta(PDO $pdo, string $convId, array $meta): void {
        $updates = [];
        $params = [];

        if (isset($meta['tags'])) {
            $updates[] = "tags = ?";
            $params[] = json_encode(array_values($meta['tags']), JSON_UNESCAPED_UNICODE);
        }

        if (isset($meta['internal_notes'])) {
            $updates[] = "internal_notes = ?";
            $params[] = json_encode(array_values($meta['internal_notes']), JSON_UNESCAPED_UNICODE);
        }

        if (isset($meta['department_id'])) {
            $updates[] = "department_id = ?";
            $params[] = Security::sanitizeString($meta['department_id']);
        }

        if (isset($meta['operator_id'])) {
            $updates[] = "operator_id = ?";
            $params[] = Security::sanitizeString($meta['operator_id']);
        }

        if (isset($meta['status'])) {
            $updates[] = "status = ?";
            $params[] = in_array($meta['status'], ['active', 'pending', 'closed'], true) ? $meta['status'] : 'active';
        }

        if (!empty($updates)) {
            $params[] = $convId;
            $sql = "UPDATE omni_conversations SET " . implode(', ', $updates) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        }
    }

    public static function toggleBlock(PDO $pdo, string $convId, bool $isBlocked, ?string $reason): void {
        $stmt = $pdo->prepare("UPDATE omni_conversations SET is_blocked = ?, blocked_reason = ? WHERE id = ?");
        $stmt->execute([$isBlocked ? 1 : 0, $isBlocked ? Security::sanitizeString($reason) : null, $convId]);
    }

    public static function deleteConversation(PDO $pdo, string $convId): void {
        $delMsg = $pdo->prepare("DELETE FROM omni_messages WHERE conversation_id = ?");
        $delMsg->execute([$convId]);

        $delTyping = $pdo->prepare("DELETE FROM omni_typing WHERE conversation_id = ?");
        $delTyping->execute([$convId]);

        $delConv = $pdo->prepare("DELETE FROM omni_conversations WHERE id = ?");
        $delConv->execute([$convId]);
    }
}
