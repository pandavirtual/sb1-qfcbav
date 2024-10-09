<?php
require_once 'db_connect.php';

header('Content-Type: application/json');

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // シナリオ一覧の取得
        $stmt = $pdo->query("SELECT * FROM scenarios");
        $scenarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($scenarios);
        break;

    case 'POST':
        // 新しいシナリオの追加
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("INSERT INTO scenarios (title, min_player_count, max_player_count, duration, description, gm_required, url) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$data['title'], $data['min_player_count'], $data['max_player_count'], $data['duration'], $data['description'], $data['gm_required'], $data['url']]);
        echo json_encode(['message' => 'Scenario added successfully']);
        break;

    // PUT, DELETEメソッドも必要に応じて実装
}
?>