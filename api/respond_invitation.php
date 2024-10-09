<?php
require_once 'db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $uid = $data['uid'] ?? '';
    $eventId = $data['eventId'] ?? '';
    $response = $data['response'] ?? '';

    if (empty($uid) || empty($eventId) || empty($response)) {
        echo json_encode(['error' => 'UID, event ID, and response are required']);
        exit;
    }

    if ($response !== 'accept' && $response !== 'decline') {
        echo json_encode(['error' => 'Invalid response']);
        exit;
    }

    $pdo->beginTransaction();

    try {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE firebase_uid = ?");
        $stmt->execute([$uid]);
        $userId = $stmt->fetchColumn();

        if (!$userId) {
            throw new Exception('User not found');
        }

        if ($response === 'accept') {
            $stmt = $pdo->prepare("INSERT INTO event_participants (event_id, user_id, status) VALUES (?, ?, 'accepted')");
            $stmt->execute([$eventId, $userId]);
        }

        $stmt = $pdo->prepare("DELETE FROM event_invitations WHERE event_id = ? AND user_id = ?");
        $stmt->execute([$eventId, $userId]);

        $pdo->commit();
        echo json_encode(['message' => 'Invitation response processed successfully']);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>