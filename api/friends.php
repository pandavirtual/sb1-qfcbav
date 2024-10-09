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
        SELECT u.firebase_uid, u.username, u.photo_url
        FROM friendships f
        JOIN users u ON f.friend_id = u.id
        WHERE f.user_id = (SELECT id FROM users WHERE firebase_uid = ?)
    ");
    $stmt->execute([$uid]);
    $friends = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['friends' => $friends]);
}
?>