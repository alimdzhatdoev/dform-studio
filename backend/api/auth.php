<?php
require_once __DIR__ . '/config.php';
session_start();

$method = $_SERVER['REQUEST_METHOD'];

// Hard-coded admin credentials (for diploma project — no real security needed)
define('ADMIN_LOGIN', 'admin');
define('ADMIN_PASSWORD', 'dform2025');

if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $login    = $body['login'] ?? '';
    $password = $body['password'] ?? '';

    if ($login === ADMIN_LOGIN && $password === ADMIN_PASSWORD) {
        $_SESSION['admin'] = true;
        send(['success' => true]);
    } else {
        send_error('Invalid credentials', 401);
    }
}

if ($method === 'GET') {
    send(['authenticated' => !empty($_SESSION['admin'])]);
}

if ($method === 'DELETE') {
    session_destroy();
    send(['success' => true]);
}

send_error('Method not allowed', 405);
