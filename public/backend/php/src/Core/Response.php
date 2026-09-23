<?php
namespace OmniChat\Core;

class Response {
    public static function json(array $data, int $statusCode = 200): void {
        if (!headers_sent()) {
            http_response_code($statusCode);
            header('Content-Type: application/json; charset=utf-8');
            header('X-Content-Type-Options: nosniff');
            header('X-Frame-Options: SAMEORIGIN');
            header('X-XSS-Protection: 1; mode=block');
        }
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function success(array $payload = [], string $message = 'OK'): void {
        self::json(array_merge(['status' => 'success', 'message' => $message], $payload), 200);
    }

    public static function error(string $message = 'An error occurred', int $statusCode = 400, ?string $code = null): void {
        $payload = [
            'status' => 'error',
            'message' => $message
        ];
        if ($code !== null) {
            $payload['code'] = $code;
        }
        self::json($payload, $statusCode);
    }

    public static function unauthorized(string $message = 'Unauthorized'): void {
        self::error($message, 401, 'UNAUTHORIZED');
    }

    public static function forbidden(string $message = 'Access forbidden'): void {
        self::error($message, 403, 'FORBIDDEN');
    }

    public static function notFound(string $message = 'Resource not found'): void {
        self::error($message, 404, 'NOT_FOUND');
    }
}
