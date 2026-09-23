<?php
namespace OmniChat\Database;

use PDO;
use OmniChat\Core\Logger;

class Migration {
    public static function run(PDO $pdo, string $adminEmail = 'admin@company.com', string $adminPassword = 'admin', string $adminName = 'مدیر ارشد سامانه'): array {
        $statements = [
            // 1. Operators table
            "CREATE TABLE IF NOT EXISTS `omni_operators` (
                `id` VARCHAR(64) PRIMARY KEY,
                `name` VARCHAR(120) NOT NULL,
                `email` VARCHAR(150) NOT NULL UNIQUE,
                `password_hash` VARCHAR(255) NOT NULL,
                `role` ENUM('admin', 'supervisor', 'agent') NOT NULL DEFAULT 'agent',
                `department_id` VARCHAR(64) NULL,
                `status` ENUM('online', 'busy', 'away', 'offline') NOT NULL DEFAULT 'offline',
                `avatar` VARCHAR(500) NULL,
                `rating_avg` DECIMAL(3,2) NOT NULL DEFAULT 5.00,
                `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX `idx_role` (`role`),
                INDEX `idx_status` (`status`),
                INDEX `idx_department` (`department_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

            // 2. Departments table
            "CREATE TABLE IF NOT EXISTS `omni_departments` (
                `id` VARCHAR(64) PRIMARY KEY,
                `name_fa` VARCHAR(120) NOT NULL,
                `name_en` VARCHAR(120) NOT NULL,
                `description` VARCHAR(255) NULL,
                `icon` VARCHAR(64) DEFAULT 'Headphones',
                `color` VARCHAR(32) DEFAULT '#007AFF',
                `is_active` TINYINT(1) NOT NULL DEFAULT 1,
                `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                INDEX `idx_active` (`is_active`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

            // 3. Visitors table
            "CREATE TABLE IF NOT EXISTS `omni_visitors` (
                `id` VARCHAR(64) PRIMARY KEY,
                `name` VARCHAR(120) NOT NULL DEFAULT 'کاربر مهمان',
                `email` VARCHAR(150) NULL,
                `phone` VARCHAR(64) NULL,
                `ip_address` VARCHAR(64) NULL,
                `location` VARCHAR(120) NULL,
                `browser` VARCHAR(150) NULL,
                `device` VARCHAR(64) NULL,
                `current_page` VARCHAR(500) NULL,
                `status` ENUM('browsing', 'chatting', 'idle') NOT NULL DEFAULT 'browsing',
                `last_seen` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                INDEX `idx_last_seen` (`last_seen`),
                INDEX `idx_status` (`status`),
                INDEX `idx_ip` (`ip_address`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

            // 4. Conversations table
            "CREATE TABLE IF NOT EXISTS `omni_conversations` (
                `id` VARCHAR(64) PRIMARY KEY,
                `visitor_id` VARCHAR(64) NOT NULL,
                `visitor_name` VARCHAR(120) NOT NULL,
                `visitor_email` VARCHAR(150) NULL,
                `visitor_phone` VARCHAR(64) NULL,
                `visitor_ip` VARCHAR(64) NULL,
                `visitor_location` VARCHAR(120) NULL,
                `visitor_browser` VARCHAR(150) NULL,
                `visitor_device` VARCHAR(64) NULL,
                `current_page` VARCHAR(500) NULL,
                `department_id` VARCHAR(64) NULL,
                `operator_id` VARCHAR(64) NULL,
                `status` ENUM('active', 'pending', 'closed') NOT NULL DEFAULT 'active',
                `unread_count` INT NOT NULL DEFAULT 0,
                `is_blocked` TINYINT(1) NOT NULL DEFAULT 0,
                `blocked_reason` VARCHAR(255) NULL,
                `tags` TEXT NULL,
                `internal_notes` TEXT NULL,
                `last_message_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX `idx_visitor` (`visitor_id`),
                INDEX `idx_operator` (`operator_id`),
                INDEX `idx_department` (`department_id`),
                INDEX `idx_status_updated` (`status`, `updated_at`),
                INDEX `idx_last_msg` (`last_message_at`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

            // 5. Messages table with client_message_id for idempotency & pagination indexes
            "CREATE TABLE IF NOT EXISTS `omni_messages` (
                `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
                `client_message_id` VARCHAR(100) NULL,
                `conversation_id` VARCHAR(64) NOT NULL,
                `sender` ENUM('visitor', 'operator', 'system') NOT NULL,
                `sender_name` VARCHAR(120) NOT NULL,
                `text` TEXT NOT NULL,
                `file_attachment` TEXT NULL,
                `is_read` TINYINT(1) NOT NULL DEFAULT 0,
                `is_edited` TINYINT(1) NOT NULL DEFAULT 0,
                `edited_at` DATETIME NULL,
                `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                INDEX `idx_conv_id` (`conversation_id`, `id`),
                INDEX `idx_conv_created` (`conversation_id`, `created_at`),
                INDEX `idx_client_msg_id` (`client_message_id`),
                INDEX `idx_is_read` (`is_read`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

            // 6. Typing indicators table (in-memory feel with timestamps)
            "CREATE TABLE IF NOT EXISTS `omni_typing` (
                `conversation_id` VARCHAR(64) NOT NULL,
                `sender` ENUM('visitor', 'operator') NOT NULL,
                `sender_name` VARCHAR(120) NOT NULL,
                `updated_at` BIGINT NOT NULL,
                PRIMARY KEY (`conversation_id`, `sender`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

            // 7. Offline leads table
            "CREATE TABLE IF NOT EXISTS `omni_offline_leads` (
                `id` VARCHAR(64) PRIMARY KEY,
                `name` VARCHAR(120) NOT NULL,
                `email` VARCHAR(150) NOT NULL,
                `phone` VARCHAR(64) NULL,
                `department_id` VARCHAR(64) NULL,
                `message` TEXT NOT NULL,
                `status` ENUM('new', 'reviewed', 'resolved') NOT NULL DEFAULT 'new',
                `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                INDEX `idx_status` (`status`),
                INDEX `idx_created` (`created_at`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

            // 8. Canned responses table
            "CREATE TABLE IF NOT EXISTS `omni_canned_responses` (
                `id` VARCHAR(64) PRIMARY KEY,
                `shortcut` VARCHAR(64) NOT NULL,
                `title` VARCHAR(150) NOT NULL,
                `content` TEXT NOT NULL,
                `department_id` VARCHAR(64) NULL,
                `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

            // 9. Operator sessions table (Bcrypt/Token based session store)
            "CREATE TABLE IF NOT EXISTS `omni_sessions` (
                `id` VARCHAR(128) PRIMARY KEY,
                `operator_id` VARCHAR(64) NOT NULL,
                `ip_address` VARCHAR(64) NULL,
                `user_agent` VARCHAR(255) NULL,
                `expires_at` DATETIME NOT NULL,
                `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                INDEX `idx_op_id` (`operator_id`),
                INDEX `idx_expires` (`expires_at`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

            // 10. Rate limiting table
            "CREATE TABLE IF NOT EXISTS `omni_rate_limits` (
                `ip_hash` VARCHAR(64) NOT NULL,
                `action` VARCHAR(64) NOT NULL,
                `attempts` INT NOT NULL DEFAULT 1,
                `window_start` BIGINT NOT NULL,
                PRIMARY KEY (`ip_hash`, `action`),
                INDEX `idx_window` (`window_start`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"
        ];

        foreach ($statements as $sql) {
            $pdo->exec($sql);
        }

        // Seed initial department if none exists
        $stmtDept = $pdo->query("SELECT COUNT(*) FROM `omni_departments`");
        if ($stmtDept->fetchColumn() == 0) {
            $pdo->exec("INSERT INTO `omni_departments` (`id`, `name_fa`, `name_en`, `description`, `icon`, `color`) VALUES 
                ('dept_tech', 'پشتیبانی فنی و سرور', 'Technical Support', 'پاسخگویی به سوالات فنی و هاستینگ', 'Server', '#007AFF'),
                ('dept_sales', 'واحد فروش و مالی', 'Sales & Billing', 'استعلام قیمت، تمدید و فاکتورها', 'BadgePercent', '#34C759'),
                ('dept_crm', 'روابط عمومی و مشتریان', 'Customer Care', 'رسیدگی به پیشنهادات و انتقادات', 'HeartHandshake', '#AF52DE')
            ");
        }

        // Seed or update Admin Operator
        $adminId = 'op_admin_root';
        $passHash = password_hash($adminPassword, PASSWORD_BCRYPT, ['cost' => 12]);
        
        $chk = $pdo->prepare("SELECT id FROM `omni_operators` WHERE email = ?");
        $chk->execute([$adminEmail]);
        if ($chk->fetch()) {
            $upd = $pdo->prepare("UPDATE `omni_operators` SET password_hash = ?, role = 'admin', name = ? WHERE email = ?");
            $upd->execute([$passHash, $adminName, $adminEmail]);
        } else {
            $ins = $pdo->prepare("INSERT INTO `omni_operators` (`id`, `name`, `email`, `password_hash`, `role`, `department_id`, `status`) VALUES (?, ?, ?, ?, 'admin', 'dept_tech', 'online')");
            $ins->execute([$adminId, $adminName, $adminEmail, $passHash]);
        }

        Logger::info("Database schema initialized and admin user ensured.", ['admin' => $adminEmail]);

        return [
            'status' => 'success',
            'tables_created' => 10,
            'admin_email' => $adminEmail
        ];
    }
}
