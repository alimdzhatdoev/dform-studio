<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET /api/orders.php  — list orders (admin)
if ($method === 'GET') {
    $orders = read_json(ORDERS_FILE);
    // Sort newest first
    usort($orders, fn($a, $b) => strcmp($b['created_at'], $a['created_at']));
    send($orders);
}

// POST /api/orders.php  — create new order
if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    if (!$body) send_error('Invalid JSON body');

    $required = ['name', 'email', 'service', 'description'];
    foreach ($required as $field) {
        if (empty($body[$field])) send_error("Field '$field' is required");
    }

    $orders = read_json(ORDERS_FILE);

    $order = [
        'id'          => uniqid('ord_', true),
        'name'        => htmlspecialchars(trim($body['name'])),
        'email'       => filter_var(trim($body['email']), FILTER_VALIDATE_EMAIL)
                            ?: send_error('Invalid email'),
        'phone'       => htmlspecialchars(trim($body['phone'] ?? '')),
        'service'     => htmlspecialchars(trim($body['service'])),
        'description' => htmlspecialchars(trim($body['description'])),
        'budget'      => htmlspecialchars(trim($body['budget'] ?? '')),
        'status'      => 'new',
        'created_at'  => date('c'),
    ];

    $orders[] = $order;
    write_json(ORDERS_FILE, $orders);

    // Update analytics
    $analytics = read_json(ANALYTICS_FILE);
    $day = date('Y-m-d');
    $analytics['total_orders'] = ($analytics['total_orders'] ?? 0) + 1;
    $analytics['orders_by_day'][$day] = ($analytics['orders_by_day'][$day] ?? 0) + 1;
    write_json(ANALYTICS_FILE, $analytics);

    send(['success' => true, 'order' => $order], 201);
}

// PUT /api/orders.php?id=...  — update status
if ($method === 'PUT') {
    $id = $_GET['id'] ?? '';
    if (!$id) send_error('Order ID required');

    $body = json_decode(file_get_contents('php://input'), true);
    $allowed_statuses = ['new', 'in_progress', 'completed', 'cancelled'];

    if (!in_array($body['status'] ?? '', $allowed_statuses)) {
        send_error('Invalid status');
    }

    $orders = read_json(ORDERS_FILE);
    $found = false;
    foreach ($orders as &$order) {
        if ($order['id'] === $id) {
            $order['status'] = $body['status'];
            $order['updated_at'] = date('c');
            $found = true;
            break;
        }
    }
    unset($order);

    if (!$found) send_error('Order not found', 404);

    write_json(ORDERS_FILE, $orders);
    send(['success' => true]);
}

send_error('Method not allowed', 405);
