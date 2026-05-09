<?php
define('DATA_DIR', __DIR__ . '/../data/');
define('ORDERS_FILE', DATA_DIR . 'orders.json');
define('ANALYTICS_FILE', DATA_DIR . 'analytics.json');

// CORS for local dev (React on :3000, PHP on :8000)
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function read_json(string $file): array {
    if (!file_exists($file)) return [];
    $content = file_get_contents($file);
    return json_decode($content, true) ?? [];
}

function write_json(string $file, mixed $data): bool {
    return file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) !== false;
}

function send(mixed $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function send_error(string $message, int $code = 400): void {
    send(['error' => $message], $code);
}
