<?php
namespace OmniChat\Chat;

use PDO;
use OmniChat\Core\Security;
use OmniChat\Core\Logger;

class MessageService {
    public static function sendMessage(PDO $pdo, array $data): array {
        $convId = Security::sanitizeString($data['conversation_id'] ?? '');
        $clientMsgId = Security::sanitizeString($data['client_message_id'] ?? '');
        $sender = in_array($data['sender'] ?? '', ['visitor', 'operator', 'system'], true) ? $data['sender'] : 'visitor';
        $senderName = Security::sanitizeString($data['sender_name'] ?? ($sender === 'visitor' ? 'کاربر مهمان' : 'پشتیبان'), 100);
        $text = Security::sanitizeString($data['text'] ?? '', 10000);
        $fileAttachment = !empty($data['file_attachment']) ? json_encode($data['file_attachment'], JSON_UNESCAPED_UNICODE) : null;

        if (empty($convId) || (empty($text) && empty($fileAttachment))) {
            throw new \Exception("متن پیام یا فایل پیوست الزامی است.");
        }

        // 1. Idempotency Check: If client_message_id is supplied and exists, return existing row
        if (!empty($clientMsgId)) {
            $chk = $pdo->prepare("SELECT * FROM omni_messages WHERE client_message_id = ? LIMIT 1");
            $chk->execute([$clientMsgId]);
            $existing = $chk->fetch();
            if ($existing) {
                return self::formatMessage($existing);
            }
        }

        // 2. Ensure Conversation Exists or Auto-Create
        $stmtConv = $pdo->prepare("SELECT * FROM omni_conversations WHERE id = ?");
        $stmtConv->execute([$convId]);
        $conv = $stmtConv->fetch();

        $now = date('Y-m-d H:i:s');

        if (!$conv) {
            $visId = Security::sanitizeString($data['visitor_id'] ?? 'vis_' . substr(md5($convId), 0, 10));
            $visEmail = Security::sanitizeEmail($data['visitor_email'] ?? '');
            $deptId = Security::sanitizeString($data['department_id'] ?? 'dept_tech');
            $visIp = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
            $visUa = substr($_SERVER['HTTP_USER_AGENT'] ?? 'Web Browser', 0, 150);

            $insConv = $pdo->prepare("
                INSERT INTO omni_conversations 
                (id, visitor_id, visitor_name, visitor_email, visitor_ip, visitor_browser, department_id, status, unread_count, last_message_at, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 1, ?, ?)
            ");
            $insConv->execute([$convId, $visId, $senderName, $visEmail, $visIp, $visUa, $deptId, $now, $now]);
        } else {
            if ($conv['is_blocked']) {
                throw new \Exception("این گفتگو به دلیل قوانین امنیتی مسدود شده است.");
            }
            $unreadInc = ($sender === 'visitor') ? 1 : 0;
            $updConv = $pdo->prepare("
                UPDATE omni_conversations 
                SET last_message_at = ?, unread_count = unread_count + ?, status = 'active'
                WHERE id = ?
            ");
            $updConv->execute([$now, $unreadInc, $convId]);
        }

        // 3. Insert Message
        $insMsg = $pdo->prepare("
            INSERT INTO omni_messages 
            (client_message_id, conversation_id, sender, sender_name, text, file_attachment, is_read, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $isRead = ($sender === 'operator') ? 1 : 0;
        $insMsg->execute([$clientMsgId ?: null, $convId, $sender, $senderName, $text, $fileAttachment, $isRead, $now]);
        $msgId = $pdo->lastInsertId();

        // 4. Clear typing indicator on message sent
        $delTyping = $pdo->prepare("DELETE FROM omni_typing WHERE conversation_id = ? AND sender = ?");
        $delTyping->execute([$convId, $sender]);

        $fetchMsg = $pdo->prepare("SELECT * FROM omni_messages WHERE id = ?");
        $fetchMsg->execute([$msgId]);
        return self::formatMessage($fetchMsg->fetch());
    }

    public static function getMessages(PDO $pdo, string $convId, int $limit = 50, int $beforeId = 0): array {
        $limit = min(100, max(1, $limit));

        if ($beforeId > 0) {
            $stmt = $pdo->prepare("
                SELECT * FROM omni_messages 
                WHERE conversation_id = ? AND id < ? 
                ORDER BY id DESC LIMIT ?
            ");
            $stmt->bindValue(1, $convId);
            $stmt->bindValue(2, $beforeId, PDO::PARAM_INT);
            $stmt->bindValue(3, $limit, PDO::PARAM_INT);
            $stmt->execute();
        } else {
            $stmt = $pdo->prepare("
                SELECT * FROM (
                    SELECT * FROM omni_messages 
                    WHERE conversation_id = ? 
                    ORDER BY id DESC LIMIT ?
                ) sub ORDER BY id ASC
            ");
            $stmt->bindValue(1, $convId);
            $stmt->bindValue(2, $limit, PDO::PARAM_INT);
            $stmt->execute();
        }

        $rows = $stmt->fetchAll();
        return array_map([self::class, 'formatMessage'], $rows);
    }

    public static function editMessage(PDO $pdo, int $messageId, string $newText, string $operatorId): array {
        $newText = Security::sanitizeString($newText, 10000);
        if (empty($newText)) {
            throw new \Exception("متن ویرایش شده نباید خالی باشد.");
        }

        $now = date('Y-m-d H:i:s');
        $upd = $pdo->prepare("
            UPDATE omni_messages 
            SET text = ?, is_edited = 1, edited_at = ? 
            WHERE id = ?
        ");
        $upd->execute([$newText, $now, $messageId]);

        $stmt = $pdo->prepare("SELECT * FROM omni_messages WHERE id = ?");
        $stmt->execute([$messageId]);
        return self::formatMessage($stmt->fetch());
    }

    public static function deleteMessage(PDO $pdo, int $messageId): bool {
        $stmt = $pdo->prepare("DELETE FROM omni_messages WHERE id = ?");
        return $stmt->execute([$messageId]);
    }

    public static function markRead(PDO $pdo, string $convId): void {
        $upd = $pdo->prepare("UPDATE omni_messages SET is_read = 1 WHERE conversation_id = ? AND is_read = 0");
        $upd->execute([$convId]);

        $updConv = $pdo->prepare("UPDATE omni_conversations SET unread_count = 0 WHERE id = ?");
        $updConv->execute([$convId]);
    }

    public static function setTyping(PDO $pdo, string $convId, string $sender, string $senderName): void {
        $now = time();
        $stmt = $pdo->prepare("
            INSERT INTO omni_typing (conversation_id, sender, sender_name, updated_at) 
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE sender_name = VALUES(sender_name), updated_at = VALUES(updated_at)
        ");
        $stmt->execute([$convId, $sender, $senderName, $now]);
    }

    public static function getTyping(PDO $pdo, string $convId, string $excludeSender): ?array {
        $threshold = time() - 4; // Typing expires after 4 seconds
        $stmt = $pdo->prepare("
            SELECT * FROM omni_typing 
            WHERE conversation_id = ? AND sender != ? AND updated_at >= ?
            LIMIT 1
        ");
        $stmt->execute([$convId, $excludeSender, $threshold]);
        return $stmt->fetch() ?: null;
    }

    public static function formatMessage(array $row): array {
        return [
            'id' => (int)$row['id'],
            'clientMessageId' => $row['client_message_id'] ?? null,
            'conversationId' => $row['conversation_id'],
            'sender' => $row['sender'],
            'senderName' => $row['sender_name'],
            'text' => $row['text'],
            'timestamp' => date('H:i', strtotime($row['created_at'])),
            'createdAt' => $row['created_at'],
            'read' => (bool)$row['is_read'],
            'isEdited' => (bool)$row['is_edited'],
            'editedAt' => $row['edited_at'],
            'fileAttachment' => !empty($row['file_attachment']) ? json_decode($row['file_attachment'], true) : null
        ];
    }
}
