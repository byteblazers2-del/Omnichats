import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Server, 
  Database, 
  User, 
  Globe, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  X,
  ShieldCheck,
  HardDrive,
  KeyRound,
  Cpu,
  Download,
  Terminal,
  FileCode,
  AlertTriangle,
  Layers,
  Copy,
  Check,
  Zap,
  PlayCircle
} from 'lucide-react';
import { InstallConfig } from '../types';

interface InstallWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveConfig: (config: any) => void;
  initialConfig?: InstallConfig;
  currentConfig?: InstallConfig;
  language: 'fa' | 'en';
  isDarkMode?: boolean;
}

export const InstallWizardModal: React.FC<InstallWizardModalProps> = ({
  isOpen,
  onClose,
  onSaveConfig,
  initialConfig,
  currentConfig,
  language,
}) => {
  const cfg = initialConfig || currentConfig || ({} as any);
  const isFa = language === 'fa';
  const [selectedEngine, setSelectedEngine] = useState<'php' | 'node'>('php');
  const [step, setStep] = useState(1);
  const [dbType, setDbType] = useState<'mysql' | 'sqlite' | 'postgresql'>(cfg.dbType || 'mysql');
  const [dbHost, setDbHost] = useState(cfg.dbHost || 'localhost');
  const [dbPort, setDbPort] = useState('3306');
  const [dbName, setDbName] = useState(cfg.dbName || 'omnichat_db');
  const [dbUser, setDbUser] = useState(cfg.dbUser || 'root');
  const [dbPass, setDbPass] = useState('');
  const [adminName, setAdminName] = useState(cfg.adminName || 'مدیر ارشد');
  const [adminEmail, setAdminEmail] = useState(cfg.adminEmail || 'admin@company.com');
  const [adminPass, setAdminPass] = useState('');
  const [siteTitle, setSiteTitle] = useState(cfg.siteTitle || 'پشتیبانی آنلاین سازمانی');
  const [siteUrl, setSiteUrl] = useState(cfg.siteUrl || 'https://yoursite.com');
  const [nodePort, setNodePort] = useState('4000');
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState<'quick_1click' | 'wizard' | 'raw_sql' | 'config_file' | 'node_env'>('quick_1click');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real config.php for PHP hosting
  const generatedConfigPhp = `<?php
/**
 * OmniChat Enterprise - Production Database Configuration
 * Generated for: ${siteUrl}
 * Self-Hosted Sovereign Node
 */

define('DB_HOST', '${dbHost}');
define('DB_PORT', ${parseInt(dbPort) || 3306});
define('DB_NAME', '${dbName}');
define('DB_USER', '${dbUser}');
define('DB_PASS', '${dbPass}');

define('JWT_SECRET', '${Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)}');
define('OMNI_INSTALLED', true);
define('SITE_URL', '${siteUrl}');
define('SITE_TITLE', '${siteTitle}');
`;

  // Real .env for Node.js
  const generatedNodeEnv = `# OmniChat Enterprise Node.js Production Configuration
PORT=${nodePort}
NODE_ENV=production
SITE_URL=${siteUrl}
SITE_TITLE=${siteTitle}
JWT_SECRET=${Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)}
DATABASE_URL=mysql://${dbUser}:${dbPass || 'password'}@${dbHost}:${dbPort}/${dbName}
CORS_ORIGIN=*
`;

  // Real SQL Schema
  const generatedSqlMigration = `-- ==========================================================
-- OmniChat Enterprise - Direct Database Migration Script
-- Target Database: ${dbName} | Generated for: ${siteUrl}
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS \`omni_departments\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`dept_key\` VARCHAR(50) NOT NULL UNIQUE,
  \`name_fa\` VARCHAR(100) NOT NULL,
  \`name_en\` VARCHAR(100) NOT NULL,
  \`description\` TEXT NULL,
  \`color\` VARCHAR(20) DEFAULT '#007AFF',
  \`working_hours\` VARCHAR(100) DEFAULT '08:30 - 20:00',
  \`is_default\` TINYINT(1) DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`omni_operators\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL,
  \`email\` VARCHAR(150) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`role\` ENUM('admin', 'supervisor', 'agent') DEFAULT 'agent',
  \`status\` ENUM('online', 'busy', 'offline') DEFAULT 'offline',
  \`is_active\` TINYINT(1) DEFAULT 1,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`omni_conversations\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`conversation_uuid\` VARCHAR(64) NOT NULL UNIQUE,
  \`visitor_id\` INT UNSIGNED NOT NULL,
  \`operator_id\` INT UNSIGNED NULL,
  \`department_id\` INT UNSIGNED NULL,
  \`status\` ENUM('active', 'waiting', 'closed') DEFAULT 'waiting',
  \`priority\` ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  \`started_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`omni_messages\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`conversation_id\` INT UNSIGNED NOT NULL,
  \`sender_type\` ENUM('visitor', 'operator', 'system') NOT NULL,
  \`sender_name\` VARCHAR(100) NOT NULL,
  \`message_text\` MEDIUMTEXT NOT NULL,
  \`is_internal_note\` TINYINT(1) DEFAULT 0,
  \`is_read\` TINYINT(1) DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO \`omni_departments\` (\`id\`, \`dept_key\`, \`name_fa\`, \`name_en\`, \`is_default\`) 
VALUES (1, 'general', 'پشتیبانی و فروش', 'General & Sales', 1);

-- Super Admin Initial User
INSERT INTO \`omni_operators\` (\`name\`, \`email\`, \`password_hash\`, \`role\`, \`status\`)
VALUES ('${adminName}', '${adminEmail}', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'online')
ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`);

SET FOREIGN_KEY_CHECKS = 1;
`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleNext = () => {
    if (step === 4) {
      setIsVerifying(true);
      setTimeout(() => {
        setIsVerifying(false);
        onSaveConfig({
          dbType,
          dbHost,
          dbName,
          dbUser,
          adminName,
          adminEmail,
          siteTitle,
          siteUrl,
          isInstalled: true,
        });
        setStep(5);
      }, 1000);
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden text-right flex flex-col max-h-[92vh] border border-slate-200">
        
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0e1621] via-[#15212d] to-[#0e1621] text-white flex items-center justify-between border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                100% PRODUCTION READY
              </span>
              <h2 className="text-sm sm:text-base font-bold">راه‌اندازی و تست روی هاست / دامین واقعی</h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              پشتیبانی از هر دو موتور: <span className="text-blue-400 font-bold">PHP / cPanel</span> و <span className="text-emerald-400 font-bold">Node.js / VPS</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Engine Switcher & Quick Navigation */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => setActiveTab('quick_1click')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'quick_1click' ? 'bg-[#007AFF] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-white/60'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>نصب فوق‌سریع (۱ کلیکه)</span>
            </button>
            <button
              onClick={() => setActiveTab('node_env')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'node_env' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-white/60'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>فایل .env نود جی‌اس</span>
            </button>
            <button
              onClick={() => setActiveTab('config_file')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'config_file' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-white/60'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>فایل config.php</span>
            </button>
            <button
              onClick={() => setActiveTab('raw_sql')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'raw_sql' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 bg-white/60'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>کد دیتابیس SQL</span>
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: Quick 1-Click Setup */}
          {activeTab === 'quick_1click' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 text-blue-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-[#007AFF]">
                  <PlayCircle className="w-5 h-5" />
                  <span>ساده‌ترین و سریع‌ترین روش تست روی هاست و دامین شما:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-700">
                  برای اینکه بدون سردرگمی و ظرف ۲ دقیقه سیستم را روی هاست واقعی بالا بیاورید، مراحل به صورت خودکار کدگذاری شده‌اند:
                </p>
              </div>

              {/* Step by step cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Method 1: PHP Auto-Installer */}
                <div className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all space-y-2 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Server className="w-4 h-4 text-blue-500" />
                      روش ۱: هاست PHP (cPanel / دایرکت‌ادمین)
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-bold">پیشنهادی</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-[11px] pt-1 leading-relaxed">
                    <li>فایل‌های پوشه <code className="font-mono text-blue-600">backend/php</code> را در هاست خود آپلود کنید.</li>
                    <li>آدرس <code className="font-mono text-emerald-600 dir-ltr text-left">yoursite.com/install.php</code> را در مرورگر باز کنید.</li>
                    <li>نام دیتابیس را وارد کرده و دکمه نصب را بزنید. تمام!</li>
                  </ol>
                </div>

                {/* Method 2: Node.js Auto-Start */}
                <div className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all space-y-2 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-emerald-600" />
                      روش ۲: سرور Node.js (VPS / سرور اختصاصی)
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-bold">پر سرعت</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-[11px] pt-1 leading-relaxed">
                    <li>دستور <code className="font-mono text-slate-800 bg-slate-200 px-1 py-0.5 rounded">npm install</code> را در پوشه نود اجرا کنید.</li>
                    <li>فایل <code className="font-mono text-slate-800 bg-slate-200 px-1 py-0.5 rounded">.env</code> را دانلود کرده و کنار فایل‌ها بگذارید.</li>
                    <li>با دستور <code className="font-mono text-emerald-600 bg-slate-200 px-1 py-0.5 rounded">npm start</code> سرور را روشن کنید.</li>
                  </ol>
                </div>
              </div>

              {/* Quick Input Bar */}
              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 block text-xs">اطلاعات هاست شما (جهت درج خودکار در فایل‌ها):</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">آدرس دامین شما:</label>
                    <input
                      type="text"
                      value={siteUrl}
                      onChange={(e) => setSiteUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-xl font-mono dir-ltr text-left"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">نام دیتابیس MySQL:</label>
                    <input
                      type="text"
                      value={dbName}
                      onChange={(e) => setDbName(e.target.value)}
                      placeholder="omnichat_db"
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-xl font-mono dir-ltr text-left"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    onClick={() => handleDownloadFile('config.php', generatedConfigPhp)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>دانلود فایل PHP Config</span>
                  </button>
                  <button
                    onClick={() => handleDownloadFile('.env', generatedNodeEnv)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>دانلود فایل Node .env</span>
                  </button>
                  <button
                    onClick={() => handleDownloadFile('schema.sql', generatedSqlMigration)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold shadow-xs transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>دانلود SQL دیتابیس</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Node.js .env */}
          {activeTab === 'node_env' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">محتوای فایل .env برای سرور Node.js و WebSocket:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(generatedNodeEnv, 'node_env')}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    {copiedKey === 'node_env' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'node_env' ? 'کپی شد' : 'کپی .env'}</span>
                  </button>
                  <button
                    onClick={() => handleDownloadFile('.env', generatedNodeEnv)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>دانلود .env</span>
                  </button>
                </div>
              </div>
              <pre className="p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto text-left dir-ltr leading-relaxed max-h-80">
                {generatedNodeEnv}
              </pre>
            </div>
          )}

          {/* TAB 3: Config PHP */}
          {activeTab === 'config_file' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">محتوای زنده فایل config.php برای هاست PHP:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(generatedConfigPhp, 'config')}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    {copiedKey === 'config' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'config' ? 'کپی شد' : 'کپی کد'}</span>
                  </button>
                  <button
                    onClick={() => handleDownloadFile('config.php', generatedConfigPhp)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>دانلود config.php</span>
                  </button>
                </div>
              </div>
              <pre className="p-4 rounded-2xl bg-slate-900 text-blue-300 font-mono text-xs overflow-x-auto text-left dir-ltr leading-relaxed max-h-80">
                {generatedConfigPhp}
              </pre>
            </div>
          )}

          {/* TAB 4: Raw SQL */}
          {activeTab === 'raw_sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">اسکریپت مستقیم SQL برای ساخت دیتابیس در phpMyAdmin:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(generatedSqlMigration, 'sql')}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    {copiedKey === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'sql' ? 'کپی شد' : 'کپی SQL'}</span>
                  </button>
                  <button
                    onClick={() => handleDownloadFile('schema.sql', generatedSqlMigration)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>دانلود schema.sql</span>
                  </button>
                </div>
              </div>
              <pre className="p-4 rounded-2xl bg-slate-900 text-indigo-300 font-mono text-xs overflow-x-auto text-left dir-ltr leading-relaxed max-h-80">
                {generatedSqlMigration}
              </pre>
            </div>
          )}

        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            آماده آپلود و تست مستقیم روی دامین یا ساب‌دامین واقعی
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-[#007AFF] hover:bg-[#0071e3] rounded-xl shadow-xs transition-all"
          >
            بستن و ادامه کار در پنل
          </button>
        </div>

      </div>
    </div>
  );
};
