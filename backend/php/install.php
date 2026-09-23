<?php
/**
 * OmniChat Enterprise - Standalone Web Installer
 * Runs on cPanel, DirectAdmin, LAMP/LEMP without external dependencies.
 */

$isInstalled = file_exists(__DIR__ . '/config.php');
$error = '';
$success = '';

// Check Server Requirements
$reqs = [
    'php_version' => version_compare(PHP_VERSION, '7.4.0', '>='),
    'pdo_mysql'   => extension_loaded('pdo_mysql'),
    'json'        => extension_loaded('json'),
    'mbstring'    => extension_loaded('mbstring'),
    'writable'    => is_writable(__DIR__)
];

$allReqsPassed = !in_array(false, $reqs, true);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['install_btn'])) {
    if (!$allReqsPassed) {
        $error = 'پیش‌نیازهای سرور کامل نیست. لطفاً خطاهای پیش‌نیاز را بررسی کنید.';
    } else {
        $dbHost = trim($_POST['db_host'] ?? 'localhost');
        $dbPort = trim($_POST['db_port'] ?? '3306');
        $dbName = trim($_POST['db_name'] ?? '');
        $dbUser = trim($_POST['db_user'] ?? '');
        $dbPass = $_POST['db_pass'] ?? '';

        $adminName = trim($_POST['admin_name'] ?? 'مدیر ارشد');
        $adminEmail = trim($_POST['admin_email'] ?? '');
        $adminPass = $_POST['admin_pass'] ?? '';

        if (empty($dbName) || empty($dbUser) || empty($adminEmail) || empty($adminPass)) {
            $error = 'لطفاً تمامی فیلدهای الزامی دیتابیس و حساب کاربری مدیر را تکمیل کنید.';
        } else {
            try {
                // Test Database Connection
                $dsn = "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4";
                $pdo = new PDO($dsn, $dbUser, $dbPass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]);

                // Run schema.sql
                $schemaSql = file_get_contents(__DIR__ . '/schema.sql');
                if (!$schemaSql) {
                    throw new Exception('فایل schema.sql در سرور یافت نشد.');
                }

                $pdo->exec($schemaSql);

                // Insert Default Department
                $stmtDept = $pdo->prepare("INSERT IGNORE INTO omni_departments (dept_key, name_fa, name_en, working_hours, is_default) VALUES ('general', 'پشتیبانی عمومی و فروش', 'General & Sales', '08:30 - 21:00', 1)");
                $stmtDept->execute();

                // Insert Super Admin Operator
                $hash = password_hash($adminPass, PASSWORD_BCRYPT);
                $stmtAdmin = $pdo->prepare("INSERT INTO omni_operators (name, email, password_hash, role, status) VALUES (?, ?, ?, 'admin', 'online') ON DUPLICATE KEY UPDATE name=VALUES(name), password_hash=VALUES(password_hash)");
                $stmtAdmin->execute([$adminName, $adminEmail, $hash]);

                // Generate Random Secret Key
                $jwtSecret = bin2hex(random_bytes(32));

                // Write config.php
                $configContent = "<?php\n"
                    . "// OmniChat Enterprise Configuration\n"
                    . "// Generated automatically by install.php on " . date('Y-m-d H:i:s') . "\n\n"
                    . "define('DB_HOST', '" . addslashes($dbHost) . "');\n"
                    . "define('DB_PORT', " . intval($dbPort) . ");\n"
                    . "define('DB_NAME', '" . addslashes($dbName) . "');\n"
                    . "define('DB_USER', '" . addslashes($dbUser) . "');\n"
                    . "define('DB_PASS', '" . addslashes($dbPass) . "');\n\n"
                    . "define('JWT_SECRET', '" . $jwtSecret . "');\n"
                    . "define('OMNI_INSTALLED', true);\n";

                file_put_contents(__DIR__ . '/config.php', $configContent);
                $isInstalled = true;
                $success = 'نصب با موفقیت انجام شد! دیتابیس، جداول و حساب مدیر ایجاد شدند.';
            } catch (Exception $e) {
                $error = 'خطا در فرآیند نصب: ' . $e->getMessage();
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>نصب‌کننده خودکار OmniChat Enterprise</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Vazirmatn', sans-serif; }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center p-4">

  <div class="max-w-xl w-full bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
    
    <!-- Logo & Title -->
    <div class="text-center mb-8">
      <div class="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30 mb-3">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
      </div>
      <h1 class="text-2xl font-black text-white">نصب خودکار OmniChat Enterprise</h1>
      <p class="text-sm text-slate-400 mt-1">سامانه گفتگوی آنلاین سازمانی (سلف‌هاستد و بدون وابستگی)</p>
    </div>

    <?php if ($success): ?>
      <div class="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 p-5 rounded-2xl mb-6">
        <h3 class="font-bold text-base mb-1">🎉 <?php echo $success; ?></h3>
        <p class="text-xs text-slate-300 leading-relaxed">
          اکنون سیستم کاملاً راه‌اندازی شده است. برای قرار دادن ویجت روی سایت مشتریان، کد زیر را در انتهای تگ <code class="bg-black/30 px-1 py-0.5 rounded">&lt;body&gt;</code> سایت قرار دهید:
        </p>
        <div class="mt-3 bg-slate-950 p-3 rounded-xl font-mono text-[11px] text-emerald-400 select-all overflow-x-auto border border-slate-800" dir="ltr">
          &lt;script src="<?php echo (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]" . dirname($_SERVER['REQUEST_URI']); ?>/widget.js" async&gt;&lt;/script&gt;
        </div>
      </div>
    <?php endif; ?>

    <?php if ($error): ?>
      <div class="bg-rose-500/15 border border-rose-500/40 text-rose-300 p-4 rounded-2xl mb-6 text-xs">
        <?php echo $error; ?>
      </div>
    <?php endif; ?>

    <!-- Server Health Requirements Check -->
    <div class="mb-6 bg-slate-900/80 p-4 rounded-2xl border border-slate-700/60">
      <h4 class="text-xs font-bold text-slate-300 mb-3">بررسی پیش‌نیازهای هاست سرور:</h4>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full <?php echo $reqs['php_version'] ? 'bg-emerald-500' : 'bg-rose-500'; ?>"></span>
          <span>نسخه PHP (<?php echo PHP_VERSION; ?>)</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full <?php echo $reqs['pdo_mysql'] ? 'bg-emerald-500' : 'bg-rose-500'; ?>"></span>
          <span>اکستنشن PDO MySQL</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full <?php echo $reqs['json'] ? 'bg-emerald-500' : 'bg-rose-500'; ?>"></span>
          <span>اکستنشن JSON</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full <?php echo $reqs['writable'] ? 'bg-emerald-500' : 'bg-rose-500'; ?>"></span>
          <span>دسترسی نوشتن پوشه</span>
        </div>
      </div>
    </div>

    <!-- Installation Form -->
    <form method="POST" class="space-y-4">
      <div class="border-t border-slate-700/80 pt-4">
        <h3 class="text-sm font-bold text-blue-400 mb-3">۱. اطلاعات دیتابیس MySQL (هاست/سرور):</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label class="block text-slate-400 mb-1">هاست دیتابیس</label>
            <input type="text" name="db_host" value="localhost" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500" required>
          </div>
          <div>
            <label class="block text-slate-400 mb-1">پورت (معمولاً 3306)</label>
            <input type="text" name="db_port" value="3306" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500">
          </div>
          <div>
            <label class="block text-slate-400 mb-1">نام دیتابیس</label>
            <input type="text" name="db_name" placeholder="مثلاً: omnichat_db" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500" required>
          </div>
          <div>
            <label class="block text-slate-400 mb-1">نام کاربری دیتابیس (DB User)</label>
            <input type="text" name="db_user" placeholder="مثلاً: root یا db_user" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500" required>
          </div>
          <div class="sm:col-span-2">
            <label class="block text-slate-400 mb-1">رمز عبور دیتابیس</label>
            <input type="password" name="db_pass" placeholder="DB Password" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500">
          </div>
        </div>
      </div>

      <div class="border-t border-slate-700/80 pt-4">
        <h3 class="text-sm font-bold text-indigo-400 mb-3">۲. حساب کاربری مدیر کل (Super Admin):</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label class="block text-slate-400 mb-1">نام مدیر</label>
            <input type="text" name="admin_name" value="مدیر ارشد" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500" required>
          </div>
          <div>
            <label class="block text-slate-400 mb-1">ایمیل مدیر</label>
            <input type="email" name="admin_email" placeholder="admin@company.com" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500" required>
          </div>
          <div class="sm:col-span-2">
            <label class="block text-slate-400 mb-1">رمز عبور ورود به پنل چت</label>
            <input type="password" name="admin_pass" placeholder="••••••••" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500" required>
          </div>
        </div>
      </div>

      <button type="submit" name="install_btn" class="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all text-sm">
        نصب و ایجاد دیتابیس مستقل (یک کلیک)
      </button>
    </form>
  </div>

</body>
</html>
