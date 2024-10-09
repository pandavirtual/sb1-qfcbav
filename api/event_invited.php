<?php
require_once 'db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $eventId = $_GET['id'] ?? '';

    if (empty($eventId)) {
        echo json_encode(['error' => 'Event ID is required']);
        exit;
    }

    $stmt = $pdo->prepare("
        SELECT u.firebase_uid, u.username, u.photo_url
        FROM event_invitations ei
        JOIN users u ON ei.user_id = u.id
        WHERE ei.event_id = ?
    ");
    $stmt->execute([$eventId]);
    $invited = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['invited' => $invited]);
}
?>