<?php
require_once 'db_connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $uid = $_GET['uid'] ?? '';

    if (empty($uid)) {
        echo json_encode(['error' => 'UID is required']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE firebase_uid = ?");
    $stmt->execute([$uid]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo json_encode(['user' => $user]);
    } else {
        echo json_encode(['error' => 'User not found']);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $uid = $data['uid'] ?? '';
    $username = $data['username'] ?? '';
    $email = $data['email'] ?? '';
    $photoURL = $data['photoURL'] ?? '';

    if (empty($uid) || empty($username) || empty($email)) {
        echo json_encode(['error' => 'UID, username, and email are required']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO users (firebase_uid, username, email, photo_url) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE username = ?, email = ?, photo_url = ?");
    $stmt->execute([$uid, $username, $email, $photoURL, $username, $email, $photoURL]);

    echo json_encode(['message' => 'Profile updated successfully']);
}
?>