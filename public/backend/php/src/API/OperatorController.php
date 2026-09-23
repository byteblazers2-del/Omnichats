<?php
namespace OmniChat\API;

use PDO;
use OmniChat\Auth\AuthService;
use OmniChat\Core\Response;
use OmniChat\Core\Security;

class OperatorController {
    public static function handle(PDO $pdo, string $action, ?array $currentOperator): void {
        switch ($action) {
            case 'get_operators':
                $stmt = $pdo->query("SELECT * FROM omni_operators ORDER BY created_at ASC");
                $ops = $stmt->fetchAll();

                $result = array_map(function($o) {
                    return [
                        'id' => $o['id'],
                        'name' => $o['name'],
                        'email' => $o['email'],
                        'role' => $o['role'],
                        'departmentId' => $o['department_id'] ?: 'dept_tech',
                        'status' => $o['status'],
                        'avatar' => $o['avatar'],
                        'ratingAvg' => (float)($o['rating_avg'] ?? 5.0)
                    ];
                }, $ops);

                Response::success(['operators' => $result]);
                break;

            case 'save_operator':
                if (!$currentOperator || !AuthService::checkPermission($currentOperator, 'admin')) {
                    Response::forbidden('فقط مدیر ارشد مجاز به افزودن یا ویرایش اپراتورها است.');
                }

                $input = json_decode(file_get_contents('php://input'), true) ?: [];
                $id = Security::sanitizeString($input['id'] ?? '');
                $name = Security::sanitizeString($input['name'] ?? '', 120);
                $email = Security::sanitizeEmail($input['email'] ?? '');
                $role = in_array($input['role'] ?? '', ['admin', 'supervisor', 'agent'], true) ? $input['role'] : 'agent';
                $deptId = Security::sanitizeString($input['departmentId'] ?? 'dept_tech');
                $status = in_array($input['status'] ?? '', ['online', 'busy', 'away', 'offline'], true) ? $input['status'] : 'offline';
                $password = $input['password'] ?? '';

                if (empty($name) || empty($email)) {
                    Response::error('نام و ایمیل اپراتور الزامی است.');
                }

                if (empty($id) || strpos($id, 'op-') === 0 || strpos($id, 'temp-') === 0) {
                    // Create new
                    $newId = 'op_' . substr(md5(uniqid('', true)), 0, 10);
                    $passHash = password_hash(!empty($password) ? $password : '123456', PASSWORD_BCRYPT);

                    $ins = $pdo->prepare("
                        INSERT INTO omni_operators (id, name, email, password_hash, role, department_id, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    ");
                    $ins->execute([$newId, $name, $email, $passHash, $role, $deptId, $status]);
                    Response::success(['operator_id' => $newId], 'اپراتور جدید با موفقیت ثبت شد.');
                } else {
                    // Update existing
                    if (!empty($password)) {
                        $passHash = password_hash($password, PASSWORD_BCRYPT);
                        $upd = $pdo->prepare("
                            UPDATE omni_operators 
                            SET name = ?, email = ?, password_hash = ?, role = ?, department_id = ?, status = ?
                            WHERE id = ?
                        ");
                        $upd->execute([$name, $email, $passHash, $role, $deptId, $status, $id]);
                    } else {
                        $upd = $pdo->prepare("
                            UPDATE omni_operators 
                            SET name = ?, email = ?, role = ?, department_id = ?, status = ?
                            WHERE id = ?
                        ");
                        $upd->execute([$name, $email, $role, $deptId, $status, $id]);
                    }
                    Response::success(['operator_id' => $id], 'اطلاعات اپراتور با موفقیت بروز شد.');
                }
                break;

            case 'delete_operator':
                if (!$currentOperator || !AuthService::checkPermission($currentOperator, 'admin')) {
                    Response::forbidden('فقط مدیر ارشد مجاز به حذف اپراتورها است.');
                }

                $input = json_decode(file_get_contents('php://input'), true) ?: [];
                $id = Security::sanitizeString($input['id'] ?? '');

                if ($id === $currentOperator['id']) {
                    Response::error('شما نمی‌توانید حساب کاربری فعال خود را حذف کنید.');
                }

                $del = $pdo->prepare("DELETE FROM omni_operators WHERE id = ?");
                $del->execute([$id]);
                Response::success([], 'اپراتور با موفقیت حذف شد.');
                break;

            default:
                Response::notFound('عملیات اپراتورها نامعتبر است.');
        }
    }
}
