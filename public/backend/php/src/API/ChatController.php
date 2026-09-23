<?php
namespace OmniChat\API;

use PDO;
use OmniChat\Chat\MessageService;
use OmniChat\Chat\ConversationService;
use OmniChat\Auth\AuthService;
use OmniChat\Core\Response;
use OmniChat\Core\Security;

class ChatController {
    public static function handle(PDO $pdo, string $action, ?array $currentOperator): void {
        switch ($action) {
            case 'get_conversations':
                if (!$currentOperator) {
                    Response::unauthorized();
                }

                $filters = [
                    'status' => $_GET['status'] ?? null,
                    'department_id' => $_GET['department_id'] ?? null,
                    'search' => $_GET['search'] ?? null
                ];

                // If regular agent, only show assigned or dept conversations
                if ($currentOperator['role'] === 'agent') {
                    $filters['operator_id'] = $currentOperator['id'];
                }

                $convs = ConversationService::getConversations($pdo, $filters);
                Response::success(['conversations' => $convs]);
                break;

            case 'get_messages':
                $convId = Security::sanitizeString($_GET['conversation_id'] ?? '');
                $limit = (int)($_GET['limit'] ?? 50);
                $beforeId = (int)($_GET['before_id'] ?? 0);

                if (empty($convId)) {
                    Response::error('شناسه گفتگو الزامی است.');
                }

                $messages = MessageService::getMessages($pdo, $convId, $limit, $beforeId);
                Response::success(['messages' => $messages]);
                break;

            case 'send_message':
                $input = json_decode(file_get_contents('php://input'), true) ?: [];

                // If operator is sending, enforce authentication and use currentOperator name
                if (($input['sender'] ?? '') === 'operator') {
                    if (!$currentOperator) {
                        Response::unauthorized('برای ارسال پیام به عنوان اپراتور باید وارد شده باشید.');
                    }
                    $input['sender_name'] = $currentOperator['name'];
                }

                try {
                    $msg = MessageService::sendMessage($pdo, $input);
                    Response::success(['message' => $msg], 'پیام با موفقیت ارسال شد.');
                } catch (\Exception $e) {
                    Response::error($e->getMessage());
                }
                break;

            case 'edit_message':
                if (!$currentOperator) {
                    Response::unauthorized();
                }
                $input = json_decode(file_get_contents('php://input'), true) ?: [];
                $messageId = (int)($input['message_id'] ?? 0);
                $text = $input['text'] ?? '';

                try {
                    $msg = MessageService::editMessage($pdo, $messageId, $text, $currentOperator['id']);
                    Response::success(['message' => $msg], 'پیام ویرایش شد.');
                } catch (\Exception $e) {
                    Response::error($e->getMessage());
                }
                break;

            case 'delete_message':
                if (!$currentOperator) {
                    Response::unauthorized();
                }
                if (!AuthService::checkPermission($currentOperator, 'supervisor')) {
                    Response::forbidden('شما دسترسی حذف پیام را ندارید.');
                }

                $input = json_decode(file_get_contents('php://input'), true) ?: [];
                $messageId = (int)($input['message_id'] ?? 0);
                MessageService::deleteMessage($pdo, $messageId);
                Response::success([], 'پیام حذف شد.');
                break;

            case 'mark_read':
                $input = json_decode(file_get_contents('php://input'), true) ?: [];
                $convId = Security::sanitizeString($input['conversation_id'] ?? '');
                if ($convId) {
                    MessageService::markRead($pdo, $convId);
                }
                Response::success([], 'پیام‌ها خوانده شدند.');
                break;

            case 'set_typing':
                $input = json_decode(file_get_contents('php://input'), true) ?: [];
                $convId = Security::sanitizeString($input['conversation_id'] ?? '');
                $sender = ($input['sender'] ?? '') === 'operator' ? 'operator' : 'visitor';
                $name = Security::sanitizeString($input['sender_name'] ?? ($sender === 'operator' ? ($currentOperator['name'] ?? 'پشتیبان') : 'کاربر مهمان'));

                if ($convId) {
                    MessageService::setTyping($pdo, $convId, $sender, $name);
                }
                Response::success([], 'وضعیت تایپ ثبت شد.');
                break;

            case 'delete_conversation':
                if (!$currentOperator) {
                    Response::unauthorized();
                }
                if (!AuthService::checkPermission($currentOperator, 'admin')) {
                    Response::forbidden('فقط مدیر ارشد دسترسی حذف کامل گفتگو را دارد.');
                }

                $input = json_decode(file_get_contents('php://input'), true) ?: [];
                $convId = Security::sanitizeString($input['conversation_id'] ?? '');
                if ($convId) {
                    ConversationService::deleteConversation($pdo, $convId);
                }
                Response::success([], 'گفتگو و تمام پیام‌های آن با موفقیت حذف شدند.');
                break;

            case 'toggle_block':
                if (!$currentOperator) {
                    Response::unauthorized();
                }
                $input = json_decode(file_get_contents('php://input'), true) ?: [];
                $convId = Security::sanitizeString($input['conversation_id'] ?? '');
                $isBlocked = (bool)($input['is_blocked'] ?? false);
                $reason = $input['reason'] ?? null;

                if ($convId) {
                    ConversationService::toggleBlock($pdo, $convId, $isBlocked, $reason);
                }
                Response::success([], $isBlocked ? 'کاربر مسدود شد.' : 'انسداد کاربر رفع شد.');
                break;

            case 'update_conversation_meta':
                if (!$currentOperator) {
                    Response::unauthorized();
                }
                $input = json_decode(file_get_contents('php://input'), true) ?: [];
                $convId = Security::sanitizeString($input['conversation_id'] ?? '');
                if ($convId) {
                    ConversationService::updateMeta($pdo, $convId, $input);
                }
                Response::success([], 'اطلاعات گفتگو بروز شد.');
                break;

            case 'poll_messages':
                // Fallback polling for browsers without SSE
                $convId = Security::sanitizeString($_GET['conversation_id'] ?? '');
                $lastId = (int)($_GET['last_id'] ?? 0);

                if (empty($convId)) {
                    Response::error('شناسه گفتگو الزامی است.');
                }

                $stmt = $pdo->prepare("SELECT * FROM omni_messages WHERE conversation_id = ? AND id > ? ORDER BY id ASC LIMIT 20");
                $stmt->execute([$convId, $lastId]);
                $rows = $stmt->fetchAll();

                $formatted = array_map([MessageService::class, 'formatMessage'], $rows);
                Response::success(['messages' => $formatted]);
                break;

            default:
                Response::notFound('عملیات چت نامعتبر است.');
        }
    }
}
