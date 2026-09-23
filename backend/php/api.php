<?php
/**
 * OmniChat Enterprise - Hardened Production REST & Real-time SSE API
 * Includes: Rate Limiting, Audit Logging, Operator Management, Profile Updates, Invitation Links
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

$action = $_GET['action'] ?? '';
$pdo = DB::getConnection();

function sendJson($data, int $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function getJsonInput(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

function logAudit(PDO $pdo, ?int $operatorId, ?string $email, string $action, string $details = '') {
    try {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $stmt = $pdo->prepare("INSERT INTO omni_audit_logs (operator_id, operator_email, action, details, ip_address) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$operatorId, $email, $action, $details, $ip]);
    } catch (Exception $e) {
        // Silently fail to not block primary flow
    }
}

// Simple Rate Limiting in memory/session/transient
function checkRateLimit(string $key, int $maxRequests = 30, int $windowSeconds = 60): bool {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    $tmpDir = sys_get_temp_dir();
    $cacheFile = $tmpDir . '/omni_rl_' . md5($ip . '_' . $key);
    $now = time();

    $data = ['count' => 0, 'start' => $now];
    if (file_exists($cacheFile)) {
        $content = @file_get_contents($cacheFile);
        $decoded = json_decode($content, true);
        if ($decoded && ($now - $decoded['start']) < $windowSeconds) {
            $data = $decoded;
        }
    }

    if ($data['count'] >= $maxRequests) {
        return false;
    }

    $data['count']++;
    @file_put_contents($cacheFile, json_encode($data));
    return true;
}

switch ($action) {
    // -------------------------------------------------------------
    // 1. Health check & Server Status
    // -------------------------------------------------------------
    case 'status':
        sendJson([
            'status' => 'online',
            'system' => 'OmniChat Enterprise Production API',
            'version' => '3.0.0',
            'server_time' => date('Y-m-d H:i:s'),
            'security' => 'Hardened'
        ]);
        break;

    // -------------------------------------------------------------
    // 2. Operator Login
    // -------------------------------------------------------------
    case 'login':
        if (!checkRateLimit('login', 8, 60)) {
            sendJson(['status' => 'error', 'message' => 'تعداد تلاش‌های ناموفق بیش از حد مجاز است. لطفاً ۱ دقیقه صبر کنید.'], 429);
        }

        $data = getJsonInput();
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if (empty($email) || empty($password)) {
            sendJson(['status' => 'error', 'message' => 'ایمیل و رمزعبور الزامی است.'], 400);
        }

        $stmt = $pdo->prepare("SELECT * FROM omni_operators WHERE email = ? AND is_active = 1 LIMIT 1");
        $stmt->execute([$email]);
        $operator = $stmt->fetch();

        if (!$operator || !password_verify($password, $operator['password_hash'])) {
            logAudit($pdo, null, $email, 'LOGIN_FAILED', 'Invalid credentials');
            sendJson(['status' => 'error', 'message' => 'ایمیل یا رمز عبور اشتباه است.'], 401);
        }

        $pdo->prepare("UPDATE omni_operators SET status = 'online', last_active = NOW() WHERE id = ?")
            ->execute([$operator['id']]);

        logAudit($pdo, $operator['id'], $operator['email'], 'LOGIN_SUCCESS', 'Operator logged in');

        $token = Auth::generateToken([
            'id' => $operator['id'],
            'name' => $operator['name'],
            'email' => $operator['email'],
            'role' => $operator['role']
        ]);

        unset($operator['password_hash']);
        sendJson([
            'status' => 'success',
            'token' => $token,
            'operator' => $operator
        ]);
        break;

    // -------------------------------------------------------------
    // 3. Update Admin/Operator Profile (Email, Password, Name)
    // -------------------------------------------------------------
    case 'update_profile':
        $auth = Auth::verifyToken(Auth::getBearerToken());
        if (!$auth) {
            sendJson(['status' => 'error', 'message' => 'دسترسی غیرمجاز.'], 401);
        }

        $data = getJsonInput();
        $name = trim($data['name'] ?? '');
        $email = trim($data['email'] ?? '');
        $newPassword = $data['new_password'] ?? '';
        $currentPassword = $data['current_password'] ?? '';

        if (empty($name) || empty($email)) {
            sendJson(['status' => 'error', 'message' => 'نام و ایمیل الزامی است.'], 400);
        }

        // Fetch current user
        $stmt = $pdo->prepare("SELECT * FROM omni_operators WHERE id = ? LIMIT 1");
        $stmt->execute([$auth['id']]);
        $user = $stmt->fetch();

        if (!$user) {
            sendJson(['status' => 'error', 'message' => 'کاربر یافت نشد.'], 404);
        }

        if (!empty($newPassword)) {
            if (empty($currentPassword) || !password_verify($currentPassword, $user['password_hash'])) {
                sendJson(['status' => 'error', 'message' => 'رمز عبور فعلی اشتباه است.'], 400);
            }
            $hash = password_hash($newPassword, PASSWORD_BCRYPT);
            $upd = $pdo->prepare("UPDATE omni_operators SET name = ?, email = ?, password_hash = ? WHERE id = ?");
            $upd->execute([$name, $email, $hash, $auth['id']]);
        } else {
            $upd = $pdo->prepare("UPDATE omni_operators SET name = ?, email = ? WHERE id = ?");
            $upd->execute([$name, $email, $auth['id']]);
        }

        logAudit($pdo, $auth['id'], $email, 'PROFILE_UPDATED', 'Admin profile info or password changed');

        sendJson([
            'status' => 'success',
            'message' => 'اطلاعات پروفایل و رمز عبور با موفقیت به‌روزرسانی شد.'
        ]);
        break;

    // -------------------------------------------------------------
    // 4. Create New Staff / Issue Invite Link (Admin Only)
    // -------------------------------------------------------------
    case 'create_operator':
        $auth = Auth::verifyToken(Auth::getBearerToken());
        if (!$auth || $auth['role'] !== 'admin') {
            sendJson(['status' => 'error', 'message' => 'فقط مدیر کل دسترسی ایجاد کارمند دارد.'], 403);
        }

        $data = getJsonInput();
        $name = trim($data['name'] ?? '');
        $email = trim($data['email'] ?? '');
        $role = in_array($data['role'] ?? '', ['admin', 'supervisor', 'agent']) ? $data['role'] : 'agent';
        $password = $data['password'] ?? '';
        $departments = $data['departments'] ?? []; // array of dept IDs

        if (empty($name) || empty($email)) {
            sendJson(['status' => 'error', 'message' => 'نام و ایمیل کارمند الزامی است.'], 400);
        }

        // Check if email already exists
        $check = $pdo->prepare("SELECT id FROM omni_operators WHERE email = ? LIMIT 1");
        $check->execute([$email]);
        if ($check->fetch()) {
            sendJson(['status' => 'error', 'message' => 'این ایمیل قبلاً در سیستم ثبت شده است.'], 400);
        }

        $inviteToken = bin2hex(random_bytes(24));
        $passHash = !empty($password) ? password_hash($password, PASSWORD_BCRYPT) : password_hash($inviteToken, PASSWORD_BCRYPT);

        $stmt = $pdo->prepare("INSERT INTO omni_operators (name, email, password_hash, role, invite_token, status, is_active) VALUES (?, ?, ?, ?, ?, 'offline', 1)");
        $stmt->execute([$name, $email, $passHash, $role, $inviteToken]);
        $operatorId = $pdo->lastInsertId();

        // Assign departments
        if (!empty($departments) && is_array($departments)) {
            $stmtDept = $pdo->prepare("INSERT IGNORE INTO omni_operator_departments (operator_id, department_id) VALUES (?, ?)");
            foreach ($departments as $deptId) {
                $stmtDept->execute([$operatorId, intval($deptId)]);
            }
        }

        logAudit($pdo, $auth['id'], $auth['email'], 'OPERATOR_CREATED', "New operator created: $email ($role)");

        sendJson([
            'status' => 'success',
            'operator_id' => $operatorId,
            'invite_token' => $inviteToken,
            'message' => 'کارشناس با موفقیت ایجاد شد.'
        ]);
        break;

    // -------------------------------------------------------------
    // 5. Visitor Initialization & Handshake
    // -------------------------------------------------------------
    case 'visitor_init':
        $data = getJsonInput();
        $visitorToken = trim($data['visitor_token'] ?? '');
        $name = htmlspecialchars(trim($data['name'] ?? 'کاربر وب‌سایت'));
        $email = filter_var(trim($data['email'] ?? ''), FILTER_VALIDATE_EMAIL) ? trim($data['email']) : null;
        $phone = preg_replace('/[^0-9+]/', '', trim($data['phone'] ?? ''));
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $userAgent = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255);
        $page = htmlspecialchars(trim($data['current_page'] ?? ''));

        if (empty($visitorToken)) {
            $visitorToken = bin2hex(random_bytes(16));
        }

        $stmt = $pdo->prepare("SELECT * FROM omni_visitors WHERE visitor_token = ? LIMIT 1");
        $stmt->execute([$visitorToken]);
        $visitor = $stmt->fetch();

        if (!$visitor) {
            $insert = $pdo->prepare("INSERT INTO omni_visitors (visitor_token, name, email, phone, ip_address, user_agent, current_page) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $insert->execute([$visitorToken, $name, $email, $phone, $ip, $userAgent, $page]);
            $visitorId = $pdo->lastInsertId();
        } else {
            $visitorId = $visitor['id'];
            $update = $pdo->prepare("UPDATE omni_visitors SET last_seen = NOW(), current_page = ? WHERE id = ?");
            $update->execute([$page, $visitorId]);
        }

        // Active conversation
        $stmt = $pdo->prepare("SELECT * FROM omni_conversations WHERE visitor_id = ? AND status != 'closed' ORDER BY id DESC LIMIT 1");
        $stmt->execute([$visitorId]);
        $conversation = $stmt->fetch();

        if (!$conversation) {
            $uuid = 'conv_' . bin2hex(random_bytes(12));
            $deptId = !empty($data['department_id']) ? intval($data['department_id']) : 1;
            $insConv = $pdo->prepare("INSERT INTO omni_conversations (conversation_uuid, visitor_id, department_id, status) VALUES (?, ?, ?, 'waiting')");
            $insConv->execute([$uuid, $visitorId, $deptId]);
            $convId = $pdo->lastInsertId();
            $conversation = ['id' => $convId, 'conversation_uuid' => $uuid, 'status' => 'waiting'];
        }

        $depts = $pdo->query("SELECT id, name_fa, name_en, color, working_hours FROM omni_departments ORDER BY id ASC")->fetchAll();

        sendJson([
            'status' => 'success',
            'visitor_token' => $visitorToken,
            'visitor_id' => $visitorId,
            'conversation' => $conversation,
            'departments' => $depts
        ]);
        break;

    // -------------------------------------------------------------
    // 6. Send Message
    // -------------------------------------------------------------
    case 'send_message':
        if (!checkRateLimit('send_msg', 40, 60)) {
            sendJson(['status' => 'error', 'message' => 'ارسال پیام با سرعت بالا محدود شده است.'], 429);
        }

        $data = getJsonInput();
        $convId = intval($data['conversation_id'] ?? 0);
        $senderType = in_array($data['sender_type'] ?? '', ['visitor', 'operator', 'system']) ? $data['sender_type'] : 'visitor';
        $text = htmlspecialchars(trim($data['message_text'] ?? ''));
        $senderName = htmlspecialchars(trim($data['sender_name'] ?? 'کاربر'));

        if ($convId <= 0 || empty($text)) {
            sendJson(['status' => 'error', 'message' => 'متن پیام یا شناسه مکالمه نامعتبر است.'], 400);
        }

        $stmt = $pdo->prepare("INSERT INTO omni_messages (conversation_id, sender_type, sender_name, message_text, is_read) VALUES (?, ?, ?, ?, 0)");
        $stmt->execute([$convId, $senderType, $senderName, $text]);
        $msgId = $pdo->lastInsertId();

        $pdo->prepare("UPDATE omni_conversations SET updated_at = NOW(), status = 'active' WHERE id = ?")->execute([$convId]);

        sendJson([
            'status' => 'success',
            'message_id' => $msgId,
            'created_at' => date('Y-m-d H:i:s')
        ]);
        break;

    // -------------------------------------------------------------
    // 7. Get Messages
    // -------------------------------------------------------------
    case 'get_messages':
        $convId = intval($_GET['conversation_id'] ?? 0);
        $lastId = intval($_GET['after_id'] ?? 0);

        if ($convId <= 0) {
            sendJson(['status' => 'error', 'message' => 'شناسه گفتگو ارسال نشده است.'], 400);
        }

        $stmt = $pdo->prepare("SELECT id, conversation_id, sender_type, sender_name, message_text, is_internal_note, is_read, attachment_url, created_at FROM omni_messages WHERE conversation_id = ? AND id > ? ORDER BY id ASC");
        $stmt->execute([$convId, $lastId]);
        $messages = $stmt->fetchAll();

        sendJson([
            'status' => 'success',
            'messages' => $messages
        ]);
        break;

    // -------------------------------------------------------------
    // 8. Real-Time Server-Sent Events (SSE Stream)
    // -------------------------------------------------------------
    case 'sse_stream':
        $convId = intval($_GET['conversation_id'] ?? 0);
        
        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('Connection: keep-alive');
        header('X-Accel-Buffering: no');

        $lastId = intval($_GET['last_id'] ?? 0);
        $startTime = time();

        while (true) {
            if (connection_aborted() || (time() - $startTime) > 25) {
                break;
            }

            if ($convId > 0) {
                $stmt = $pdo->prepare("SELECT * FROM omni_messages WHERE conversation_id = ? AND id > ? ORDER BY id ASC");
                $stmt->execute([$convId, $lastId]);
                $newMsgs = $stmt->fetchAll();

                if (!empty($newMsgs)) {
                    foreach ($newMsgs as $msg) {
                        $lastId = $msg['id'];
                        echo "event: new_message\n";
                        echo "data: " . json_encode($msg, JSON_UNESCAPED_UNICODE) . "\n\n";
                    }
                    ob_flush();
                    flush();
                }
            }

            echo ": heartbeat\n\n";
            ob_flush();
            flush();
            sleep(2);
        }
        exit;

    default:
        sendJson(['status' => 'error', 'message' => 'اکشن نامعتبر است.'], 404);
        break;
}
