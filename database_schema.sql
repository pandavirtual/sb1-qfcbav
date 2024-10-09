-- Users table (既存のテーブルに追加)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    firebase_uid TEXT UNIQUE,
    username TEXT,
    email TEXT UNIQUE,
    photo_url TEXT,
    bio TEXT
);

-- Friendships table
CREATE TABLE IF NOT EXISTS friendships (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    friend_id INTEGER,
    status TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(friend_id) REFERENCES users(id),
    UNIQUE(user_id, friend_id)
);

-- Played Scenarios table
CREATE TABLE IF NOT EXISTS played_scenarios (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    scenario_id INTEGER,
    played_date DATE,
    rating INTEGER,
    review TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(scenario_id) REFERENCES scenarios(id)
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    title TEXT,
    datetime DATETIME,
    location_type TEXT,
    location TEXT,
    scenario_id INTEGER,
    max_participants INTEGER,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(scenario_id) REFERENCES scenarios(id)
);

-- Event Participants table
CREATE TABLE IF NOT EXISTS event_participants (
    id INTEGER PRIMARY KEY,
    event_id INTEGER,
    user_id INTEGER,
    status TEXT,
    FOREIGN KEY(event_id) REFERENCES events(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Event Invitations table
CREATE TABLE IF NOT EXISTS event_invitations (
    id INTEGER PRIMARY KEY,
    event_id INTEGER,
    user_id INTEGER,
    status TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(event_id) REFERENCES events(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    type TEXT,
    content TEXT,
    is_read BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);