<?php
namespace OmniChat\API;

use PDO;
use OmniChat\Core\Response;
use OmniChat\Core\Security;

class VisitorController {
    public static function handle(PDO $pdo, string $action, ?array $currentOperator): void {
        switch ($action) {
            case 'get_visitors':
                if (!$currentOperator) {
                    Response::unauthorized();
                }

                $activeThreshold = date('Y-m-d H:i:s', time() - 300); // 5 minutes
                $stmt = $pdo->prepare("
                    SELECT * FROM omni_visitors 
                    WHERE last_seen >= ? 
                    ORDER BY last_seen DESC LIMIT 50
                ");
                $stmt->execute([$activeThreshold]);
                $visitors = $stmt->fetchAll();

                $result = array_map(function($v) {
                    return [
                        'id' => $v['id'],
                        'name' => $v['name'],
                        'email' => $v['email'],
                        'phone' => $v['phone'],
                        'ip' => $v['ip_address'],
                        'city' => $v['location'] ?: 'ایران',
                        'browser' => $v['browser'] ?: 'Chrome',
                        'device' => $v['device'] ?: 'Desktop',
                        'currentPage' => $v['current_page'] ?: '/',
                        'status' => $v['status'],
                        'lastSeen' => date('H:i', strtotime($v['last_seen']))
                    ];
                }, $visitors);

                Response::success(['visitors' => $result]);
                break;

            case 'visitor_ping':
                $input = json_decode(file_get_contents('php://input'), true) ?: [];
                $visId = Security::sanitizeString($input['visitor_id'] ?? '');
                $name = Security::sanitizeString($input['name'] ?? 'کاربر مهمان', 100);
                $page = Security::sanitizeString($input['current_page'] ?? '/', 500);
                $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
                $ua = substr($_SERVER['HTTP_USER_AGENT'] ?? 'Web Browser', 0, 150);
                $now = date('Y-m-d H:i:s');

                if (!empty($visId)) {
                    $stmt = $pdo->prepare("
                        INSERT INTO omni_visitors (id, name, ip_address, browser, current_page, status, last_seen, created_at)
                        VALUES (?, ?, ?, ?, ?, 'browsing', ?, ?)
                        ON DUPLICATE KEY UPDATE 
                            current_page = VALUES(current_page),
                            last_seen = VALUES(last_seen),
                            status = 'browsing'
                    ");
                    $stmt->execute([$visId, $name, $ip, $ua, $page, $now, $now]);
                }

                Response::success([], 'پینگ بازدیدکننده ثبت شد.');
                break;

            default:
                Response::notFound('عملیات بازدیدکنندگان نامعتبر است.');
        }
    }
}
