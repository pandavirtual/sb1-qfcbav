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
        SELECT e.*, s.title AS scenario_title, u.username AS creator_name
        FROM events e
        JOIN scenarios s ON e.scenario_id = s.id
        JOIN users u ON e.user_id = u.id
        WHERE e.id = ?
    ");
    $stmt->execute([$eventId]);
    $event = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($event) {
        echo json_encode(['event' => $event]);
    } else {
        echo json_encode(['error' => 'Event not found']);
    }
}
?>