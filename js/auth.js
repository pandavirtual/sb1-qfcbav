// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Google Auth Provider
const provider = new firebase.auth.GoogleAuthProvider();

// Login function
function login() {
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      checkUserProfile(user);
    }).catch((error) => {
      console.error("Login error:", error);
    });
}

// Logout function
function logout() {
  firebase.auth().signOut().then(() => {
    console.log("Logout successful");
    updateUIForLoggedOutUser();
  }).catch((error) => {
    console.error("Logout error:", error);
  });
}

// Check user profile
function checkUserProfile(user) {
  fetch(`/api/user_profile.php?uid=${user.uid}`)
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        showProfileEditForm(user);
      } else {
        updateUIForLoggedInUser(user);
      }
    })
    .catch(error => console.error("Profile fetch error:", error));
}

// Show profile edit form
function showProfileEditForm(user) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h2>プロフィール設定</h2>
    <form id="profile-form">
      <input type="text" id="username" placeholder="ユーザー名" value="${user.displayName || ''}" required>
      <input type="file" id="profile-image" accept="image/*">
      <button type="submit">保存</button>
    </form>
  `;

  document.getElementById('profile-form').addEventListener('submit', (e) => {
    e.preventDefault();
    updateUserProfile(user);
  });
}

// Update user profile
function updateUserProfile(user) {
  const username = document.getElementById('username').value;
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
        email: user.email,
        photoURL: user.photoURL
      }),
    });
  }).then(response => response.json())
  .then(data => {
    if (!data.error) {
      console.log("Profile update successful");
      updateUIForLoggedInUser(user);
    } else {
      console.error("Profile update error:", data.error);
    }
  }).catch(error => {
    console.error("Profile update error:", error);
  });
}

// Update UI for logged in user
function updateUIForLoggedInUser(user) {
  const loginButton = document.getElementById('login-button');
  const logoutButton = document.getElementById('logout-button');
  const userInfo = document.getElementById('user-info');

  if (loginButton) loginButton.style.display = 'none';
  if (logoutButton) logoutButton.style.display = 'block';
  if (userInfo) {
    userInfo.innerHTML = `
      <img src="${user.photoURL}" alt="${user.displayName}" width="32" height="32">
      <span>${user.displayName}</span>
    `;
  }
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
  const loginButton = document.getElementById('login-button');
  const logoutButton = document.getElementById('logout-button');
  const userInfo = document.getElementById('user-info');

  if (loginButton) loginButton.style.display = 'block';
  if (logoutButton) logoutButton.style.display = 'none';
  if (userInfo) userInfo.innerHTML = '';
}

// Auth state observer
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    checkUserProfile(user);
  } else {
    updateUIForLoggedOutUser();
  }
});

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  const loginButton = document.getElementById('login-button');
  const logoutButton = document.getElementById('logout-button');

  if (loginButton) loginButton.addEventListener('click', login);
  if (logoutButton) logoutButton.addEventListener('click', logout);
});