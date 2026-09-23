<?php
namespace OmniChat\Core;

class Logger {
    private static string $logDir = __DIR__ . '/../../logs';

    public static function log(string $level, string $message, array $context = []): void {
        if (!is_dir(self::$logDir)) {
            @mkdir(self::$logDir, 0755, true);
            // Protect logs directory with .htaccess
            @file_put_contents(self::$logDir . '/.htaccess', "Deny from all\n");
        }

        $logFile = self::$logDir . '/omnichat-' . date('Y-m-d') . '.log';
        $timestamp = date('Y-m-d H:i:s');
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN';
        $contextStr = !empty($context) ? ' ' . json_encode($context, JSON_UNESCAPED_UNICODE) : '';
        $entry = sprintf("[%s] [%s] [IP: %s] %s%s\n", $timestamp, strtoupper($level), $ip, $message, $contextStr);
        @file_put_contents($logFile, $entry, FILE_APPEND | LOCK_EX);
    }

    public static function info(string $message, array $context = []): void {
        self::log('INFO', $message, $context);
    }

    public static function warning(string $message, array $context = []): void {
        self::log('WARNING', $message, $context);
    }

    public static function error(string $message, array $context = []): void {
        self::log('ERROR', $message, $context);
    }
}
