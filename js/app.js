// アプリケーションのメイン JavaScript ファイル

// ナビゲーションメニューの生成
function createNavMenu() {
    const nav = document.getElementById('main-nav');
    const menuItems = [
        { text: 'ホーム', href: '#home' },
        { text: 'プロフィール', href: '#profile' },
        { text: 'フレンド', href: '#friends' },
        { text: 'イベント作成', href: '#create-event' },
        { text: 'イベント一覧', href: '#events' },
        { text: 'シナリオ', href: '#scenarios' },
        { text: '通知', href: '#notifications' },
        { text: 'ヘルプ', href: '#help' },
    ];

    menuItems.forEach(item => {
        const link = document.createElement('a');
        link.textContent = item.text;
        link.href = item.href;
        nav.appendChild(link);
    });
}

// ルーティング
function handleRouting() {
    const app = document.getElementById('app');
    const hash = window.location.hash;

    switch (hash) {
        case '#home':
            app.innerHTML = '<h2>ホーム</h2><p>ようこそ、マーダーミステリーイベントスケジューラーへ！</p>';
            break;
        case '#profile':
            initProfilePage();
            break;
        case '#friends':
            initFriendsPage();
            break;
        case '#create-event':
            loadEventCreation();
            break;
        case '#events':
            loadEvents();
            break;
        case '#scenarios':
            loadScenarios();
            break;
        case '#notifications':
            loadNotifications();
            break;
        case '#help':
            loadHelp();
            break;
        default:
            app.innerHTML = '<h2>404</h2><p>ページが見つかりません。</p>';
    }
}

// 各ページの読み込み関数（仮実装）
function loadEventCreation() {
    const app = document.getElementById('app');
    app.innerHTML = '<h2>イベント作成</h2><p>イベント作成フォームをここに表示します。</p>';
}

function loadEvents() {
    const app = document.getElementById('app');
    app.innerHTML = '<h2>イベント一覧</h2><p>参加可能なイベントリストをここに表示します。</p>';
}

function loadScenarios() {
    const app = document.getElementById('app');
    app.innerHTML = '<h2>シナリオ</h2><p>利用可能なシナリオリストをここに表示します。</p>';
}

function loadNotifications() {
    const app = document.getElementById('app');
    app.innerHTML = '<h2>通知</h2><p>通知一覧をここに表示します。</p>';
}

function loadHelp() {
    const app = document.getElementById('app');
    app.innerHTML = '<h2>ヘルプ</h2><p>FAQと問い合わせフォームをここに表示します。</p>';
}

// イベントリスナー
window.addEventListener('load', () => {
    createNavMenu();
    handleRouting();
});

window.addEventListener('hashchange', handleRouting);

// Service Workerの登録
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}