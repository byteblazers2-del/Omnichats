<?php
namespace OmniChat\API;

use PDO;
use OmniChat\Core\Response;
use OmniChat\Core\Security;

class LeadController {
    public static function handle(PDO $pdo, string $action, ?array $currentOperator): void {
        switch ($action) {
            case 'get_leads':
                if (!$currentOperator) {
                    Response::unauthorized();
                }

                $stmt = $pdo->query("SELECT * FROM omni_offline_leads ORDER BY created_at DESC LIMIT 100");
                $leads = $stmt->fetchAll();

                $result = array_map(function($l) {
                    return [
                        'id' => $l['id'],
                        'name' => $l['name'],
                        'email' => $l['email'],
                        'phone' => $l['phone'],
                        'departmentId' => $l['department_id'] ?: 'dept_tech',
                        'message' => $l['message'],
                        'status' => $l['status'],
                        'createdAt' => date('Y/m/d H:i', strtotime($l['created_at']))
                    ];
                }, $leads);

                Response::success(['leads' => $result]);
                break;

            case 'submit_offline_lead':
                $input = json_decode(file_get_contents('php://input'), true) ?: [];
                $name = Security::sanitizeString($input['name'] ?? '', 120);
                $email = Security::sanitizeEmail($input['email'] ?? '');
                $phone = Security::sanitizeString($input['phone'] ?? '', 64);
                $deptId = Security::sanitizeString($input['deptId'] ?? $input['department_id'] ?? 'dept_tech');
                $message = Security::sanitizeString($input['message'] ?? '', 5000);

                if (empty($name) || empty($email) || empty($message)) {
                    Response::error('نام، ایمیل و پیام الزامی هستند.');
                }

                $leadId = 'lead_' . substr(md5(uniqid('', true)), 0, 10);
                $ins = $pdo->prepare("
                    INSERT INTO omni_offline_leads (id, name, email, phone, department_id, message, status)
                    VALUES (?, ?, ?, ?, ?, ?, 'new')
                ");
                $ins->execute([$leadId, $name, $email, $phone, $deptId, $message]);

                Response::success(['lead_id' => $leadId], 'پیام شما با موفقیت ثبت شد و به زودی با شما تماس گرفته می‌شود.');
                break;

            case 'delete_lead':
                if (!$currentOperator) {
                    Response::unauthorized();
                }

                $input = json_decode(file_get_contents('php://input'), true) ?: [];
                $id = Security::sanitizeString($input['id'] ?? '');

                $del = $pdo->prepare("DELETE FROM omni_offline_leads WHERE id = ?");
                $del->execute([$id]);
                Response::success([], 'پیام آفلاین حذف شد.');
                break;

            default:
                Response::notFound('عملیات پیام‌های آفلاین نامعتبر است.');
        }
    }
}
