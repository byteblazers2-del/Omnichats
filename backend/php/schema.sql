-- ====================================================================
-- OmniChat Enterprise - Production Real-World Clean Schema
-- No Demo/Mock Garbage - Production Tables & Initial System State
-- Compatible with MySQL 5.7+, MySQL 8.0+, MariaDB 10.2+
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS `omni_departments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `dept_key` VARCHAR(50) NOT NULL UNIQUE,
  `name_fa` VARCHAR(100) NOT NULL,
  `name_en` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `color` VARCHAR(20) DEFAULT '#007AFF',
  `working_hours` VARCHAR(100) DEFAULT '08:30 - 20:00',
  `is_default` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Operators & Staff Table
CREATE TABLE IF NOT EXISTS `omni_operators` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'supervisor', 'agent') DEFAULT 'agent',
  `avatar_url` VARCHAR(255) NULL,
  `status` ENUM('online', 'busy', 'offline') DEFAULT 'offline',
  `is_active` TINYINT(1) DEFAULT 1,
  `invite_token` VARCHAR(64) NULL,
  `token_expires_at` TIMESTAMP NULL,
  `last_active` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_operator_email` (`email`),
  INDEX `idx_invite_token` (`invite_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Operator Department Assignments
CREATE TABLE IF NOT EXISTS `omni_operator_departments` (
  `operator_id` INT UNSIGNED NOT NULL,
  `department_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`operator_id`, `department_id`),
  CONSTRAINT `fk_op_dept_operator` FOREIGN KEY (`operator_id`) REFERENCES `omni_operators` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_op_dept_department` FOREIGN KEY (`department_id`) REFERENCES `omni_departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Visitors Table (Clean - Populated dynamically by real site visitors)
CREATE TABLE IF NOT EXISTS `omni_visitors` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `visitor_token` VARCHAR(64) NOT NULL UNIQUE,
  `name` VARCHAR(100) DEFAULT 'کاربر مهمان',
  `email` VARCHAR(150) NULL,
  `phone` VARCHAR(50) NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `location` VARCHAR(100) DEFAULT 'ایران',
  `device` VARCHAR(100) DEFAULT 'Desktop',
  `current_page` VARCHAR(255) NULL,
  `first_seen` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_seen` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_visitor_token` (`visitor_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Conversations Table
CREATE TABLE IF NOT EXISTS `omni_conversations` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `conversation_uuid` VARCHAR(64) NOT NULL UNIQUE,
  `visitor_id` INT UNSIGNED NOT NULL,
  `operator_id` INT UNSIGNED NULL,
  `department_id` INT UNSIGNED NULL,
  `status` ENUM('active', 'waiting', 'closed') DEFAULT 'waiting',
  `priority` ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  `subject` VARCHAR(255) NULL,
  `rating` TINYINT UNSIGNED NULL,
  `feedback_comment` TEXT NULL,
  `started_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `closed_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_conv_status` (`status`),
  INDEX `idx_conv_visitor` (`visitor_id`),
  INDEX `idx_conv_operator` (`operator_id`),
  CONSTRAINT `fk_conv_visitor` FOREIGN KEY (`visitor_id`) REFERENCES `omni_visitors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_conv_operator` FOREIGN KEY (`operator_id`) REFERENCES `omni_operators` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_conv_dept` FOREIGN KEY (`department_id`) REFERENCES `omni_departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Messages Table
CREATE TABLE IF NOT EXISTS `omni_messages` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `conversation_id` INT UNSIGNED NOT NULL,
  `sender_type` ENUM('visitor', 'operator', 'system') NOT NULL,
  `sender_id` INT UNSIGNED NULL,
  `sender_name` VARCHAR(100) NOT NULL,
  `message_text` MEDIUMTEXT NOT NULL,
  `is_internal_note` TINYINT(1) DEFAULT 0,
  `is_read` TINYINT(1) DEFAULT 0,
  `attachment_url` VARCHAR(255) NULL,
  `attachment_type` VARCHAR(50) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_msg_conv` (`conversation_id`),
  INDEX `idx_msg_created` (`created_at`),
  CONSTRAINT `fk_msg_conv` FOREIGN KEY (`conversation_id`) REFERENCES `omni_conversations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Offline Leads Table
CREATE TABLE IF NOT EXISTS `omni_leads` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(50) NULL,
  `department_id` INT UNSIGNED NULL,
  `message` TEXT NOT NULL,
  `ip_address` VARCHAR(45) NULL,
  `page_url` VARCHAR(255) NULL,
  `status` ENUM('new', 'reviewed', 'resolved') DEFAULT 'new',
  `assigned_operator_id` INT UNSIGNED NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_leads_status` (`status`),
  CONSTRAINT `fk_lead_dept` FOREIGN KEY (`department_id`) REFERENCES `omni_departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Enterprise Audit Logs & Security
CREATE TABLE IF NOT EXISTS `omni_audit_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `operator_id` INT UNSIGNED NULL,
  `operator_email` VARCHAR(150) NULL,
  `action` VARCHAR(100) NOT NULL,
  `details` TEXT NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_audit_op` (`operator_id`),
  INDEX `idx_audit_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Enterprise Configuration & Settings
CREATE TABLE IF NOT EXISTS `omni_settings` (
  `setting_key` VARCHAR(60) PRIMARY KEY,
  `setting_value` LONGTEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clean initial seed (1 Default Department only)
INSERT IGNORE INTO `omni_departments` (`id`, `dept_key`, `name_fa`, `name_en`, `description`, `color`, `working_hours`, `is_default`) 
VALUES (1, 'general', 'پشتیبانی و فروش', 'General & Sales', 'دپارتمان پیش‌فرض پشتیبانی', '#007AFF', '08:30 - 20:00', 1);

SET FOREIGN_KEY_CHECKS = 1;
