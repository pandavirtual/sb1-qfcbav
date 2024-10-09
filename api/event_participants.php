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
        SELECT u.username, u.photo_url
        FROM event_participants ep
        JOIN users u ON ep.user_id = u.id
        WHERE ep.event_id = ?
    ");
    $stmt->execute([$eventId]);
    $participants = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['participants' => $participants]);
}
?>