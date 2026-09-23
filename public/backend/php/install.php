<?php
/**
 * OmniChat Enterprise Automated Web Installer & Database Migrator
 * Hardened with installation lock file and secure Bcrypt password hashing.
 */

require_once __DIR__ . '/bootstrap.php';

use OmniChat\Core\Config;
use OmniChat\Database\Database;
use OmniChat\Database\Migration;

$lockFile = __DIR__ . '/../../installed.lock';
$isLocked = file_exists($lockFile);

$message = '';
$messageType = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !$isLocked) {
    $dbHost = trim($_POST['db_host'] ?? '127.0.0.1');
    $dbPort = (int)($_POST['db_port'] ?? 3306);
    $dbName = trim($_POST['db_name'] ?? 'omnichat_db');
    $dbUser = trim($_POST['db_user'] ?? 'root');
    $dbPass = $_POST['db_pass'] ?? '';

    $adminName = trim($_POST['admin_name'] ?? 'مدیر ارشد سامانه');
    $adminEmail = trim($_POST['admin_email'] ?? 'admin@company.com');
    $adminPass = $_POST['admin_password'] ?? '';

    if (empty($adminPass) || strlen($adminPass) < 6) {
        $message = 'رمز عبور مدیر ارشد باید حداقل ۶ کاراکتر باشد.';
        $messageType = 'error';
    } else {
        try {
            // 1. Test database connection
            $dsn = "mysql:host={$dbHost};port={$dbPort};charset=utf8mb4";
            $pdo = new PDO($dsn, $dbUser, $dbPass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
            ]);

            // 2. Create database if not exists
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $pdo->exec("USE `{$dbName}`");

            // 3. Save config file
            $newConfig = [
                'db' => [
                    'host' => $dbHost,
                    'port' => $dbPort,
                    'name' => $dbName,
                    'user' => $dbUser,
                    'pass' => $dbPass,
                    'charset' => 'utf8mb4'
                ],
                'app' => [
                    'secret_key' => bin2hex(random_bytes(32)),
                    'environment' => 'production',
                    'cors_allowed_origins' => ['*'],
                    'rate_limit_per_minute' => 120,
                    'max_upload_size_mb' => 10,
                    'allowed_upload_extensions' => ['png', 'jpg', 'jpeg', 'gif', 'webp', 'pdf', 'zip', 'txt', 'docx', 'xlsx']
                ]
            ];
            Config::save($newConfig);

            // 4. Run Migration
            $res = Migration::run($pdo, $adminEmail, $adminPass, $adminName);

            // 5. Create Lock file to prevent reinstall
            @file_put_contents($lockFile, "INSTALLED_AT=" . date('Y-m-d H:i:s') . "\nADMIN_EMAIL=" . $adminEmail . "\n");

            $message = "نصب سامانه چت با موفقیت انجام شد! جداول ساخته شدند و کاربر مدیر فعال گردید.";
            $messageType = 'success';
            $isLocked = true;
        } catch (\Throwable $e) {
            $message = 'خطا در فرآیند نصب: ' . $e->getMessage();
            $messageType = 'error';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ویزارد نصب هوشمند OmniChat Enterprise</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;600;700;800&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Vazirmatn', Tahoma, sans-serif; }
        body { background: #0e1621; color: #fff; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .card { background: #17212b; border: 1px solid #242f3d; border-radius: 24px; width: 100%; max-width: 580px; padding: 32px; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
        .header { text-align: center; margin-bottom: 24px; }
        .header .logo { width: 56px; height: 56px; border-radius: 18px; background: #007AFF; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 12px; }
        .header h1 { font-size: 20px; font-weight: 800; }
        .header p { font-size: 13px; color: #94a3b8; margin-top: 4px; }
        .alert { padding: 14px 18px; border-radius: 14px; margin-bottom: 20px; font-size: 13px; line-height: 1.6; }
        .alert.success { background: rgba(52, 199, 89, 0.15); border: 1px solid rgba(52, 199, 89, 0.3); color: #4ade80; }
        .alert.error { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; }
        .alert.locked { background: rgba(234, 179, 8, 0.15); border: 1px solid rgba(234, 179, 8, 0.3); color: #fde047; }
        .form-group { margin-bottom: 16px; }
        label { display: block; font-size: 12px; font-weight: 600; color: #cbd5e1; margin-bottom: 6px; }
        input { width: 100%; background: #0e1621; border: 1px solid #242f3d; border-radius: 12px; padding: 10px 14px; color: #fff; font-size: 13px; outline: none; transition: 0.2s; }
        input:focus { border-color: #007AFF; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .btn { width: 100%; padding: 14px; background: #007AFF; color: #fff; font-size: 14px; font-weight: 700; border: none; border-radius: 14px; cursor: pointer; transition: 0.2s; margin-top: 8px; }
        .btn:hover { background: #0062cc; }
        .btn-link { display: block; text-align: center; margin-top: 14px; color: #007AFF; text-decoration: none; font-size: 13px; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <div class="logo">💬</div>
            <h1>نصب و پیکربندی خودکار OmniChat</h1>
            <p>راه‌اندازی پایگاه‌داده و ایجاد کاربر مدیر ارشد با رمزنگاری امن</p>
        </div>

        <?php if ($message): ?>
            <div class="alert <?= $messageType ?>"><?= htmlspecialchars($message) ?></div>
        <?php endif; ?>

        <?php if ($isLocked): ?>
            <div class="alert locked">
                🔒 سامانه قبلاً با موفقیت نصب شده است. فایل قفل <code>installed.lock</code> فعال است.<br>
                جهت نصب مجدد، فایل <code>installed.lock</code> را از هاست حذف نمایید.
            </div>
            <a href="index.html" class="btn" style="text-decoration:none; text-align:center; display:block;">ورود به پنل مدیریت</a>
        <?php else: ?>
            <form method="POST">
                <div class="grid">
                    <div class="form-group">
                        <label>آدرس هاست MySQL</label>
                        <input type="text" name="db_host" value="127.0.0.1" required>
                    </div>
                    <div class="form-group">
                        <label>پورت دیتابیس</label>
                        <input type="number" name="db_port" value="3306" required>
                    </div>
                </div>

                <div class="form-group">
                    <label>نام پایگاه داده (Database Name)</label>
                    <input type="text" name="db_name" value="omnichat_db" required>
                </div>

                <div class="grid">
                    <div class="form-group">
                        <label>نام کاربری دیتابیس (DB User)</label>
                        <input type="text" name="db_user" value="root" required>
                    </div>
                    <div class="form-group">
                        <label>رمز عبور دیتابیس (DB Password)</label>
                        <input type="password" name="db_pass" placeholder="••••••••">
                    </div>
                </div>

                <hr style="border: 0; border-top: 1px solid #242f3d; margin: 20px 0;">

                <div class="form-group">
                    <label>نام مدیر ارشد</label>
                    <input type="text" name="admin_name" value="مدیر ارشد سامانه" required>
                </div>

                <div class="grid">
                    <div class="form-group">
                        <label>ایمیل مدیر ارشد (جهت لاگین)</label>
                        <input type="email" name="admin_email" value="admin@company.com" required>
                    </div>
                    <div class="form-group">
                        <label>رمز عبور دلخواه مدیر</label>
                        <input type="password" name="admin_password" placeholder="حداقل ۶ کاراکتر" required>
                    </div>
                </div>

                <button type="submit" class="btn">شروع ساخت جداول و راه‌اندازی سامانه 🚀</button>
            </form>
        <?php endif; ?>

        <a href="index.html" class="btn-link">رفتن به پیشخوان چت</a>
    </div>
</body>
</html>
