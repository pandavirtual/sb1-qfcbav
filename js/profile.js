// Fetch user profile
function fetchUserProfile() {
  const user = firebase.auth().currentUser;
  if (!user) {
    console.error("User is not logged in");
    return;
  }

  fetch(`/api/user_profile.php?uid=${user.uid}`)
    .then(response => response.json())
    .then(data => {
      if (!data.error) {
        displayUserProfile(data.user);
      } else {
        console.error("Profile fetch error:", data.error);
      }
    })
    .catch(error => console.error("Profile fetch error:", error));
}

// Display user profile
function displayUserProfile(user) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h2>プロフィール</h2>
    <div id="profile-container">
      <img src="${user.photo_url}" alt="${user.username}" width="100" height="100">
      <h3>${user.username}</h3>
      <p>${user.bio || '自己紹介が設定されていません'}</p>
      <button id="edit-profile-button">プロフィール編集</button>
    </div>
    <h3>プレイ済みシナリオ</h3>
    <div id="played-scenarios"></div>
  `;

  document.getElementById('edit-profile-button').addEventListener('click', showProfileEditForm);
  fetchPlayedScenarios();
}

// Show profile edit form
function showProfileEditForm() {
  const user = firebase.auth().currentUser;
  const app = document.getElementById('app');
  app.innerHTML = `
    <h2>プロフィール編集</h2>
    <form id="profile-form">
      <input type="text" id="username" placeholder="ユーザー名" value="${user.displayName || ''}" required>
      <textarea id="bio" placeholder="自己紹介"></textarea>
      <input type="file" id="profile-image" accept="image/*">
      <button type="submit">保存</button>
    </form>
  `;

  document.getElementById('profile-form').addEventListener('submit', (e) => {
    e.preventDefault();
    updateUserProfile();
  });
}

// Update user profile
function updateUserProfile() {
  const user = firebase.auth().currentUser;
  const username = document.getElementById('username').value;
  const bio = document.getElementById('bio').value;
  const profileImage = document.getElementById('profile-image').files[0];

  let updatePromise;
  if (profileImage) {
    const storageRef = firebase.storage().ref(`profile_images/${user.uid}`);
    updatePromise = storageRef.put(profileImage).then(() => storageRef.getDownloadURL());
  } else {
    updatePromise = Promise.resolve(user.photoURL);
  }

  updatePromise.then(photoURL => {
    return user.updateProfile({
      displayName: username,
      photoURL: photoURL
    });
  }).then(() => {
    return fetch('/api/user_profile.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: user.uid,
        username: username,
        photoURL: user.photoURL,
        bio: bio
      }),
    });
  }).then(response => response.json())
  .then(data => {
    if (!data.error) {
      console.log("Profile update successful");
      fetchUserProfile();
    } else {
      console.error("Profile update error:", data.error);
    }
  }).catch(error => {
    console.error("Profile update error:", error);
  });
}

// Fetch played scenarios
function fetchPlayedScenarios() {
  const user = firebase.auth().currentUser;
  fetch(`/api/played_scenarios.php?uid=${user.uid}`)
    .then(response => response.json())
    .then(data => {
      if (!data.error) {
        displayPlayedScenarios(data.scenarios);
      } else {
        console.error("Played scenarios fetch error:", data.error);
      }
    })
    .catch(error => console.error("Played scenarios fetch error:", error));
}

// Display played scenarios
function displayPlayedScenarios(scenarios) {
  const container = document.getElementById('played-scenarios');
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

// Initialize profile page
function initProfilePage() {
  fetchUserProfile();
}