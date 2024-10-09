<?php
require_once 'db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $uid = $data['uid'] ?? '';
    $title = $data['title'] ?? '';
    $datetime = $data['datetime'] ?? '';
    $locationType = $data['locationType'] ?? '';
    $location = $data['location'] ?? '';
    $scenarioId = $data['scenarioId'] ?? '';
    $maxParticipants = $data['maxParticipants'] ?? '';
    $description = $data['description'] ?? '';

    if (empty($uid) || empty($title) || empty($datetime) || empty($locationType) || empty($scenarioId) || empty($maxParticipants)) {
        echo json_encode(['error' => 'Required fields are missing']);
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

        $stmt = $pdo->prepare("INSERT INTO events (user_id, title, datetime, location_type, location, scenario_id, max_participants, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$userId, $title, $datetime, $locationType, $location, $scenarioId, $maxParticipants, $description]);

        $eventId = $pdo->lastInsertId();

        $pdo->commit();
        echo json_encode(['message' => 'Event created successfully', 'eventId' => $eventId]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>