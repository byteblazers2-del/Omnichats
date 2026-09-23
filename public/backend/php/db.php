<?php
/**
 * Database Helper Compatibility Wrapper
 */

require_once __DIR__ . '/bootstrap.php';

use OmniChat\Database\Database;

class OmniChat_DB_Compat {
    public static function getInstance(): PDO {
        return Database::getInstance();
    }
}
