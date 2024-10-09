<?php
require_once 'db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $uid = $_GET['uid'] ?? '';

    if (empty($uid)) {
        echo json_encode(['error' => 'UID is required']);
        exit;
    }

    $stmt = $pdo->prepare("
        SELECT s.title, ps.played_date
        FROM played_scenarios ps
        JOIN scenarios s ON ps.scenario_id = s.id
        JOIN users u ON ps.user_id = u.id
        WHERE u.firebase_uid = ?
        ORDER BY ps.played_date DESC
    ");
    $stmt->execute([$uid]);
    $scenarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['scenarios' => $scenarios]);
}
?>