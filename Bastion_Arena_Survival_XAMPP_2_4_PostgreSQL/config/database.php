<?php
declare(strict_types=1);

// PostgreSQL settings. For Supabase, set SSLMODE to 'require'.
const BASTION_DB_HOST = '127.0.0.1';
const BASTION_DB_PORT = '5432';
const BASTION_DB_NAME = 'bastion_arena';
const BASTION_DB_USER = 'postgres';
const BASTION_DB_PASS = '';
const BASTION_DB_SSLMODE = 'prefer';

function bastion_db(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;
    $dsn = 'pgsql:host=' . BASTION_DB_HOST . ';port=' . BASTION_DB_PORT . ';dbname=' . BASTION_DB_NAME . ';sslmode=' . BASTION_DB_SSLMODE;
    $pdo = new PDO($dsn, BASTION_DB_USER, BASTION_DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    return $pdo;
}
