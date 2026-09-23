<?php
/**
 * OmniChat PSR-4 Autoloader & Bootstrap
 * Standalone, zero external dependency.
 */

spl_autoload_register(function ($class) {
    $prefix = 'OmniChat\\';
    $baseDir = __DIR__ . '/src/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relativeClass = substr($class, $len);
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';

    if (file_exists($file)) {
        require_once $file;
    }
});
