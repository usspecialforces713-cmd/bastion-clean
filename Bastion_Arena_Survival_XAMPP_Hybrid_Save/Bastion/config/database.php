<?php
declare(strict_types=1);

// XAMPP defaults: user=root, empty password. Set a password in production.
const BASTION_DB_HOST = '127.0.0.1';
const BASTION_DB_NAME = 'bastion_arena';
const BASTION_DB_USER = 'root';
const BASTION_DB_PASS = '';

function bastion_db(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;
    $dsn = 'mysql:host=' . BASTION_DB_HOST . ';dbname=' . BASTION_DB_NAME . ';charset=utf8mb4';
    $pdo = new PDO($dsn, BASTION_DB_USER, BASTION_DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    return $pdo;
}
