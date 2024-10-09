<?php
require_once 'db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $uid = $_GET['uid'] ?? '';
    $term = $_GET['term'] ?? '';

    if (empty($uid) || empty($term)) {
        echo json_encode(['error' => 'UID and search term are required']);
        exit;
    }

    $stmt = $pdo->prepare("
        SELECT firebase_uid, username, photo_url
        FROM users
        WHERE username LIKE ?
        AND firebase_uid != ?
        AND id NOT IN (
            SELECT friend_id
            FROM friendships
            WHERE user_id = (SELECT id FROM users WHERE firebase_uid = ?)
        )
        LIMIT 10
    ");
    $stmt->execute(["%$term%", $uid, $uid]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['results' => $results]);
}
?>