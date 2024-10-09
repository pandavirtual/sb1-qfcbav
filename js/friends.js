// Fetch friend list
function fetchFriendList() {
  const user = firebase.auth().currentUser;
  if (!user) {
    console.error("User is not logged in");
    return;
  }

  fetch(`/api/friends.php?uid=${user.uid}`)
    .then(response => response.json())
    .then(data => {
      if (!data.error) {
        displayFriendList(data.friends);
      } else {
        console.error("Friend list fetch error:", data.error);
      }
    })
    .catch(error => console.error("Friend list fetch error:", error));
}

// Display friend list
function displayFriendList(friends) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h2>フレンド</h2>
    <div id="friend-search">
      <input type="text" id="friend-search-input" placeholder="フレンドを検索">
      <button id="friend-search-button">検索</button>
    </div>
    <div id="friend-list"></div>
  `;

  const friendList = document.getElementById('friend-list');
  if (friends.length === 0) {
    friendList.innerHTML = '<p>フレンドがいません。</p>';
  } else {
    const friendItems = friends.map(friend => `
      <div class="friend-item">
        <img src="${friend.photo_url}" alt="${friend.username}" width="50" height="50">
        <span>${friend.username}</span>
        <button class="view-profile-button" data-uid="${friend.firebase_uid}">プロフィール</button>
        <button class="remove-friend-button" data-uid="${friend.firebase_uid}">削除</button>
      </div>
    `).join('');
    friendList.innerHTML = friendItems;
  }

  // Add event listeners
  document.getElementById('friend-search-button').addEventListener('click', searchFriends);
  friendList.addEventListener('click', handleFriendAction);
}

// Search friends
function searchFriends() {
  const searchTerm = document.getElementById('friend-search-input').value;
  const user = firebase.auth().currentUser;

  fetch(`/api/search_friends.php?uid=${user.uid}&term=${searchTerm}`)
    .then(response => response.json())
    .then(data => {
      if (!data.error) {
        displaySearchResults(data.results);
      } else {
        console.error("Friend search error:", data.error);
      }
    })
    .catch(error => console.error("Friend search error:", error));
}

// Display search results
function displaySearchResults(results) {
  const searchResults = document.createElement('div');
  searchResults.id = 'search-results';
  
  if (results.length === 0) {
    searchResults.innerHTML = '<p>検索結果がありません。</p>';
  } else {
    const resultItems = results.map(user => `
      <div class="search-result-item">
        <img src="${user.photo_url}" alt="${user.username}" width="50" height="50">
        <span>${user.username}</span>
        <button class="add-friend-button" data-uid="${user.firebase_uid}">フレンド追加</button>
      </div>
    `).join('');
    searchResults.innerHTML = resultItems;
  }

  const app = document.getElementById('app');
  app.appendChild(searchResults);

  // Add event listener
  searchResults.addEventListener('click', handleSearchResultAction);
}

// Handle friend actions
function handleFriendAction(event) {
  if (event.target.classList.contains('view-profile-button')) {
    viewFriendProfile(event.target.dataset.uid);
  } else if (event.target.classList.contains('remove-friend-button')) {
    removeFriend(event.target.dataset.uid);
  }
}

// Handle search result actions
function handleSearchResultAction(event) {
  if (event.target.classList.contains('add-friend-button')) {
    addFriend(event.target.dataset.uid);
  }
}

// View friend profile
function viewFriendProfile(friendUid) {
  fetch(`/api/user_profile.php?uid=${friendUid}`)
    .then(response => response.json())
    .then(data => {
      if (!data.error) {
        displayFriendProfile(data.user);
      } else {
        console.error("Friend profile fetch error:", data.error);
      }
    })
    .catch(error => console.error("Friend profile fetch error:", error));
}

// Display friend profile
function displayFriendProfile(friend) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h2>${friend.username}のプロフィール</h2>
    <div id="friend-profile">
      <img src="${friend.photo_url}" alt="${friend.username}" width="100" height="100">
      <p>${friend.bio || '自己紹介が設定されていません'}</p>
    </div>
    <h3>プレイ済みシナリオ</h3>
    <div id="friend-played-scenarios"></div>
    <button id="back-to-friends">フレンドリストに戻る</button>
  `;

  document.getElementById('back-to-friends').addEventListener('click', fetchFriendList);
  fetchFriendPlayedScenarios(friend.firebase_uid);
}

// Fetch friend's played scenarios
function fetchFriendPlayedScenarios(friendUid) {
  fetch(`/api/played_scenarios.php?uid=${friendUid}`)
    .then(response => response.json())
    .then(data => {
      if (!data.error) {
        displayFriendPlayedScenarios(data.scenarios);
      } else {
        console.error("Friend's played scenarios fetch error:", data.error);
      }
    })
    .catch(error => console.error("Friend's played scenarios fetch error:", error));
}

// Display friend's played scenarios
function displayFriendPlayedScenarios(scenarios) {
  const container = document.getElementById('friend-played-scenarios');
  if (scenarios.length === 0) {
    container.innerHTML = '<p>プレイ済みのシナリオはありません。</p>';
    return;
  }

  const scenarioList = scenarios.map(scenario => `
    <li>
      <h4>${scenario.title}</h4>
      <p>プレイ日: ${scenario.played_date}</p>
    </li>
  `).join('');

  container.innerHTML = `<ul>${scenarioList}</ul>`;
}

// Remove friend
function removeFriend(friendUid) {
  const user = firebase.auth().currentUser;
  if (!user) {
    console.error("User is not logged in");
    return;
  }

  fetch('/api/remove_friend.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uid: user.uid,
      friendUid: friendUid
    }),
  })
  .then(response => response.json())
  .then(data => {
    if (!data.error) {
      console.log("Friend removed successfully");
      fetchFriendList();
    } else {
      console.error("Friend removal error:", data.error);
    }
  })
  .catch(error => console.error("Friend removal error:", error));
}

// Add friend
function addFriend(friendUid) {
  const user = firebase.auth().currentUser;
  if (!user) {
    console.error("User is not logged in");
    return;
  }

  fetch('/api/add_friend.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uid: user.uid,
      friendUid: friendUid
    }),
  })
  .then(response => response.json())
  .then(data => {
    if (!data.error) {
      console.log("Friend added successfully");
      fetchFriendList();
    } else {
      console.error("Friend addition error:", data.error);
    }
  })
  .catch(error => console.error("Friend addition error:", error));
}

// Initialize friends page
function initFriendsPage() {
  fetchFriendList();
}