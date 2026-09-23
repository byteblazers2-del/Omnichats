<?php
namespace OmniChat\API;

use PDO;
use OmniChat\Auth\AuthService;
use OmniChat\Core\Response;
use OmniChat\Core\Security;
use OmniChat\Core\Logger;

class Router {
    public static function dispatch(PDO $pdo): void {
        Security::initCors();

        $action = trim($_GET['action'] ?? $_POST['action'] ?? '');
        if (empty($action)) {
            Response::json([
                'status' => 'online',
                'service' => 'OmniChat Enterprise Self-Hosted REST API',
                'version' => '3.5.0',
                'timestamp' => date('Y-m-d H:i:s')
            ]);
            return;
        }

        // Apply Rate Limiting
        if (!Security::validateRateLimit($pdo, $action, 150, 60)) {
            Response::error('تعداد درخواست‌های ارسالی بیش از حد مجاز است. لطفاً کمی صبر کنید.', 429, 'RATE_LIMIT');
        }

        // Resolve Current Operator if Bearer Token present
        $token = AuthController::getBearerToken();
        $currentOperator = $token ? AuthService::validateToken($pdo, $token) : null;

        try {
            switch ($action) {
                // Auth Actions
                case 'login':
                case 'logout':
                case 'get_me':
                case 'update_my_status':
                    AuthController::handle($pdo, $action, $currentOperator);
                    break;

                // Chat & Message Actions
                case 'get_conversations':
                case 'get_messages':
                case 'send_message':
                case 'edit_message':
                case 'delete_message':
                case 'mark_read':
                case 'set_typing':
                case 'delete_conversation':
                case 'toggle_block':
                case 'update_conversation_meta':
                case 'poll_messages':
                    ChatController::handle($pdo, $action, $currentOperator);
                    break;

                // Visitors
                case 'get_visitors':
                case 'visitor_ping':
                    VisitorController::handle($pdo, $action, $currentOperator);
                    break;

                // Operators
                case 'get_operators':
                case 'save_operator':
                case 'delete_operator':
                    OperatorController::handle($pdo, $action, $currentOperator);
                    break;

                // Departments
                case 'get_departments':
                case 'save_department':
                case 'delete_department':
                    DepartmentController::handle($pdo, $action, $currentOperator);
                    break;

                // File Uploads
                case 'upload_file':
                    UploadController::handle($pdo, $action, $currentOperator);
                    break;

                // Leads
                case 'get_leads':
                case 'submit_offline_lead':
                case 'delete_lead':
                    LeadController::handle($pdo, $action, $currentOperator);
                    break;

                default:
                    Response::notFound("Endpoint [{$action}] not found");
            }
        } catch (\Throwable $e) {
            Logger::error("API exception on action: {$action}", [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            Response::error($e->getMessage(), 400);
        }
    }
}
