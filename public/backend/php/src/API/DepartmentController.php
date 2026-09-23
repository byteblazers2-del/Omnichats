<?php
namespace OmniChat\API;

use PDO;
use OmniChat\Auth\AuthService;
use OmniChat\Core\Response;
use OmniChat\Core\Security;

class DepartmentController {
    public static function handle(PDO $pdo, string $action, ?array $currentOperator): void {
        switch ($action) {
            case 'get_departments':
                $stmt = $pdo->query("SELECT * FROM omni_departments WHERE is_active = 1 ORDER BY created_at ASC");
                $depts = $stmt->fetchAll();

                $result = array_map(function($d) {
                    return [
                        'id' => $d['id'],
                        'nameFa' => $d['name_fa'],
                        'nameEn' => $d['name_en'],
                        'description' => $d['description'],
                        'icon' => $d['icon'] ?: 'Headphones',
                        'color' => $d['color'] ?: '#007AFF',
                        'isActive' => (bool)$d['is_active']
                    ];
                }, $depts);

                Response::success(['departments' => $result]);
                break;

            case 'save_department':
                if (!$currentOperator || !AuthService::checkPermission($currentOperator, 'admin')) {
                    Response::forbidden('فقط مدیر ارشد مجاز به افزودن یا ویرایش دپارتمان‌ها است.');
                }

                $input = json_decode(file_get_contents('php://input'), true) ?: [];
                $id = Security::sanitizeString($input['id'] ?? '');
                $nameFa = Security::sanitizeString($input['nameFa'] ?? '', 120);
                $nameEn = Security::sanitizeString($input['nameEn'] ?? '', 120);
                $desc = Security::sanitizeString($input['description'] ?? '', 255);
                $icon = Security::sanitizeString($input['icon'] ?? 'Headphones', 64);
                $color = Security::sanitizeString($input['color'] ?? '#007AFF', 32);

                if (empty($nameFa)) {
                    Response::error('نام دپارتمان الزامی است.');
                }

                if (empty($id) || strpos($id, 'dept-') === 0 || strpos($id, 'temp-') === 0) {
                    $newId = 'dept_' . substr(md5(uniqid('', true)), 0, 8);
                    $ins = $pdo->prepare("
                        INSERT INTO omni_departments (id, name_fa, name_en, description, icon, color, is_active)
                        VALUES (?, ?, ?, ?, ?, ?, 1)
                    ");
                    $ins->execute([$newId, $nameFa, $nameEn ?: $nameFa, $desc, $icon, $color]);
                    Response::success(['department_id' => $newId], 'دپارتمان جدید ایجاد شد.');
                } else {
                    $upd = $pdo->prepare("
                        UPDATE omni_departments 
                        SET name_fa = ?, name_en = ?, description = ?, icon = ?, color = ?
                        WHERE id = ?
                    ");
                    $upd->execute([$nameFa, $nameEn ?: $nameFa, $desc, $icon, $color, $id]);
                    Response::success(['department_id' => $id], 'دپارتمان بروز شد.');
                }
                break;

            case 'delete_department':
                if (!$currentOperator || !AuthService::checkPermission($currentOperator, 'admin')) {
                    Response::forbidden('فقط مدیر ارشد مجاز به حذف دپارتمان‌ها است.');
                }

                $input = json_decode(file_get_contents('php://input'), true) ?: [];
                $id = Security::sanitizeString($input['id'] ?? '');

                $del = $pdo->prepare("DELETE FROM omni_departments WHERE id = ?");
                $del->execute([$id]);
                Response::success([], 'دپارتمان حذف شد.');
                break;

            default:
                Response::notFound('عملیات دپارتمان‌ها نامعتبر است.');
        }
    }
}
