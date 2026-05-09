<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') send_error('Method not allowed', 405);

$orders    = read_json(ORDERS_FILE);
$analytics = read_json(ANALYTICS_FILE);

// Count by status
$by_status = ['new' => 0, 'in_progress' => 0, 'completed' => 0, 'cancelled' => 0];
foreach ($orders as $o) {
    $s = $o['status'] ?? 'new';
    if (isset($by_status[$s])) $by_status[$s]++;
}

// Count by service
$by_service = [];
foreach ($orders as $o) {
    $svc = $o['service'] ?? 'other';
    $by_service[$svc] = ($by_service[$svc] ?? 0) + 1;
}

// Orders by day — last 30 days
$days = [];
for ($i = 29; $i >= 0; $i--) {
    $d = date('Y-m-d', strtotime("-$i days"));
    $days[$d] = $analytics['orders_by_day'][$d] ?? 0;
}

send([
    'total_orders'   => count($orders),
    'by_status'      => $by_status,
    'by_service'     => $by_service,
    'orders_by_day'  => $days,
]);
