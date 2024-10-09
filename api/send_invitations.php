<?php
require_once 'db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $eventId = $data['eventId'] ?? '';
    $friendUids = $data['friendUids'] ?? [];

    if (empty($eventId) || empty($friendUids)) {
        echo json_encode(['error' => 'Event ID and friend UIDs are required']);
        exit;
    }

    $pdo->beginTransaction();

    try {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE firebase_uid IN (" . implode(',', array_fill(0, count($friendUids), '?')) . ")");
        $stmt->execute($friendUids);
        $friendIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $stmt = $pdo->prepare("INSERT INTO event_invitations (event_id, user_id) VALUES (?, ?)");
        foreach ($friendIds as $friendId) {
            $stmt->execute([$eventId, $friendId]);
        }

        $pdo->commit();
        echo json_encode(['message' => 'Invitations sent successfully']);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>