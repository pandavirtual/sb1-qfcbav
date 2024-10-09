<?php
require_once 'db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $uid = $_GET['uid'] ?? '';

    if (empty($uid)) {
        echo json_encode(['error' => 'UID is required']);
        exit;
    }

    $stmt = $pdo->prepare("
        SELECT e.*, 
               CASE 
                   WHEN ep.status IS NOT NULL THEN ep.status
                   WHEN ei.status IS NOT NULL THEN 'invited'
                   ELSE 'creator'
               END AS status
        FROM events e
        LEFT JOIN event_participants ep ON e.id = ep.event_id AND ep.user_id = (SELECT id FROM users WHERE firebase_uid = ?)
        LEFT JOIN event_invitations ei ON e.id = ei.event_id AND ei.user_id = (SELECT id FROM users WHERE firebase_uid = ?)
        WHERE e.user_id = (SELECT id FROM users WHERE firebase_uid = ?)
           OR ep.user_id IS NOT NULL
           OR ei.user_id IS NOT NULL
        ORDER BY e.datetime
    ");
    $stmt->execute([$uid, $uid, $uid]);
    $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['events' => $events]);
}
?>