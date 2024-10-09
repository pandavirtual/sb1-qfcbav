<?php
require_once 'db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $eventId = $data['eventId'] ?? '';
    $message = $data['message'] ?? '';

    if (empty($eventId) || empty($message)) {
        echo json_encode(['error' => 'Event ID and message are required']);
        exit;
    }

    $pdo->beginTransaction();

    try {
        $stmt = $pdo->prepare("
            SELECT user_id
            FROM event_participants
            WHERE event_id = ?
        ");
        $stmt->execute([$eventId]);
        $participantIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $stmt = $pdo->prepare("
            INSERT INTO notifications (user_id, type, content)
            VALUES (?, 'event', ?)
        ");

        foreach ($participantIds as $participantId) {
            $stmt->execute([$participantId, $message]);
        }

        $pdo->commit();
        echo json_encode(['message' => 'Notification sent successfully']);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>