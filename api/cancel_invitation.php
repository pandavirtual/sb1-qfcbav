<?php
require_once 'db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $eventId = $data['eventId'] ?? '';
    $invitedUid = $data['invitedUid'] ?? '';

    if (empty($eventId) || empty($invitedUid)) {
        echo json_encode(['error' => 'Event ID and invited UID are required']);
        exit;
    }

    $pdo->beginTransaction();

    try {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE firebase_uid = ?");
        $stmt->execute([$invitedUid]);
        $invitedId = $stmt->fetchColumn();

        if (!$invitedId) {
            throw new Exception('Invited user not found');
        }

        $stmt = $pdo->prepare("DELETE FROM event_invitations WHERE event_id = ? AND user_id = ?");
        $stmt->execute([$eventId, $invitedId]);

        $pdo->commit();
        echo json_encode(['message' => 'Invitation cancelled successfully']);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>