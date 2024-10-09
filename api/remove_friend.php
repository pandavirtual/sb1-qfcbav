<?php
require_once 'db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $uid = $data['uid'] ?? '';
    $friendUid = $data['friendUid'] ?? '';

    if (empty($uid) || empty($friendUid)) {
        echo json_encode(['error' => 'UID and friend UID are required']);
        exit;
    }

    $pdo->beginTransaction();

    try {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE firebase_uid = ?");
        $stmt->execute([$uid]);
        $userId = $stmt->fetchColumn();

        $stmt = $pdo->prepare("SELECT id FROM users WHERE firebase_uid = ?");
        $stmt->execute([$friendUid]);
        $friendId = $stmt->fetchColumn();

        if (!$userId || !$friendId) {
            throw new Exception('User or friend not found');
        }

        $stmt = $pdo->prepare("DELETE FROM friendships WHERE user_id = ? AND friend_id = ?");
        $stmt->execute([$userId, $friendId]);

        $pdo->commit();
        echo json_encode(['message' => 'Friend removed successfully']);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>