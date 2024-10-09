<?php
require_once 'db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $eventId = $data['eventId'] ?? '';
    $participantUid = $data['participantUid'] ?? '';

    if (empty($eventId) || empty($participantUid)) {
        echo json_encode(['error' => 'Event ID and participant UID are required']);
        exit;
    }

    $pdo->beginTransaction();

    try {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE firebase_uid = ?");
        $stmt->execute([$participantUid]);
        $participantId = $stmt->fetchColumn();

        if (!$participantId) {
            throw new Exception('Participant not found');
        }

        $stmt = $pdo->prepare("DELETE FROM event_participants WHERE event_id = ? AND user_id = ?");
        $stmt->execute([$eventId, $participantId]);

        $pdo->commit();
        echo json_encode(['message' => 'Participant removed successfully']);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>