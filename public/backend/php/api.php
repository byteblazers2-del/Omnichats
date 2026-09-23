<?php
/**
 * OmniChat REST API Endpoint
 * Single Source of Truth
 */

require_once __DIR__ . '/bootstrap.php';

use OmniChat\Database\Database;
use OmniChat\API\Router;
use OmniChat\Core\Response;

try {
    $pdo = Database::getInstance();
    Router::dispatch($pdo);
} catch (\Throwable $e) {
    Response::error($e->getMessage(), 500);
}
