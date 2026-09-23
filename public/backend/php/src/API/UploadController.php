<?php
namespace OmniChat\API;

use PDO;
use OmniChat\Core\Config;
use OmniChat\Core\Response;
use OmniChat\Core\Logger;

class UploadController {
    public static function handle(PDO $pdo, string $action, ?array $currentOperator): void {
        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            Response::error('فایلی برای آپلود انتخاب نشده یا خطایی در ارسال رخ داده است.');
        }

        $file = $_FILES['file'];
        $origName = basename($file['name']);
        $sizeBytes = $file['size'];
        $tmpPath = $file['tmp_name'];

        $maxSize = Config::get('app.max_upload_size_mb', 10) * 1024 * 1024;
        if ($sizeBytes > $maxSize) {
            Response::error("حجم فایل نباید بیشتر از " . Config::get('app.max_upload_size_mb', 10) . " مگابایت باشد.");
        }

        $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
        $allowedExts = Config::get('app.allowed_upload_extensions', ['png', 'jpg', 'jpeg', 'gif', 'webp', 'pdf', 'zip', 'txt', 'docx', 'xlsx']);

        if (!in_array($ext, $allowedExts, true)) {
            Response::error('فرمت فایل مجاز نیست.');
        }

        // Strict MIME check using finfo
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $tmpPath);
        finfo_close($finfo);

        $disallowedMimes = ['text/x-php', 'application/x-php', 'application/x-httpd-php', 'application/x-executable', 'application/x-sh'];
        if (in_array($mime, $disallowedMimes, true) || strpos($ext, 'php') !== false) {
            Logger::warning("Malicious upload blocked", ['origName' => $origName, 'mime' => $mime]);
            Response::error('آپلود این نوع فایل به دلایل امنیتی مسدود شده است.');
        }

        $uploadDir = __DIR__ . '/../../uploads';
        if (!is_dir($uploadDir)) {
            @mkdir($uploadDir, 0755, true);
            // Protect uploads directory: disable PHP execution
            @file_put_contents($uploadDir . '/.htaccess', "<FilesMatch \"\\.(php|phtml|php3|php4|php5|php7|phps)$\">\nOrder Deny,Allow\nDeny from all\n</FilesMatch>\nOptions -ExecCGI\n");
        }

        $randomName = 'omni_' . bin2hex(random_bytes(16)) . '.' . $ext;
        $destPath = $uploadDir . '/' . $randomName;

        if (!move_uploaded_file($tmpPath, $destPath)) {
            Response::error('خطا در ذخیره‌سازی فایل روی سرور.');
        }

        // Format Human Size
        $humanSize = self::formatBytes($sizeBytes);
        $fileType = in_array($ext, ['png', 'jpg', 'jpeg', 'gif', 'webp']) ? 'image' : 'file';

        $fileUrl = './uploads/' . $randomName;

        Response::success([
            'file' => [
                'name' => htmlspecialchars($origName, ENT_QUOTES, 'UTF-8'),
                'size' => $humanSize,
                'type' => $fileType,
                'url' => $fileUrl
            ]
        ], 'فایل با موفقیت آپلود شد.');
    }

    private static function formatBytes(int $bytes): string {
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 1) . ' MB';
        }
        return number_format($bytes / 1024, 0) . ' KB';
    }
}
