<?php
namespace OmniChat\API;

use PDO;
use OmniChat\Auth\AuthService;
use OmniChat\Core\Response;
use OmniChat\Core\Security;

class AuthController {
    public static function handle(PDO $pdo, string $action, ?array $currentOperator): void {
        switch ($action) {
            case 'login':
                $input = json_decode(file_get_contents('php://input'), true) ?: [];
                $email = Security::sanitizeEmail($input['email'] ?? '');
                $password = $input['password'] ?? '';

                if (empty($email) || empty($password)) {
                    Response::error('لطفاً ایمیل و رمز عبور را وارد کنید.');
                }

                try {
                    $result = AuthService::login($pdo, $email, $password);
                    Response::success($result, 'ورود با موفقیت انجام شد.');
                } catch (\Exception $e) {
                    Response::error($e->getMessage(), 401);
                }
                break;

            case 'logout':
                $token = self::getBearerToken();
                if ($token) {
                    AuthService::logout($pdo, $token);
                }
                Response::success([], 'خروج با موفقیت انجام شد.');
                break;

            case 'get_me':
                if (!$currentOperator) {
                    Response::unauthorized();
                }
                Response::success(['operator' => $currentOperator]);
                break;

            case 'update_my_status':
                if (!$currentOperator) {
                    Response::unauthorized();
                }
                $input = json_decode(file_get_contents('php://input'), true) ?: [];
                $status = in_array($input['status'] ?? '', ['online', 'busy', 'away', 'offline'], true) ? $input['status'] : 'online';
                
                $upd = $pdo->prepare("UPDATE omni_operators SET status = ? WHERE id = ?");
                $upd->execute([$status, $currentOperator['id']]);
                Response::success(['status' => $status], 'وضعیت بروزرسانی شد.');
                break;

            default:
                Response::notFound('عملیات احراز هویت نامعتبر است.');
        }
    }

    public static function getBearerToken(): ?string {
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        $auth = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (preg_match('/Bearer\s+(\S+)/i', $auth, $matches)) {
            return $matches[1];
        }
        return null;
    }
}
