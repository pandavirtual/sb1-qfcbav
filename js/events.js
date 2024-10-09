// Add these functions to the existing events.js file

// Sync event with Google Calendar
function syncEventWithCalendar(event) {
  addEventToCalendar(event)
    .then(response => {
      console.log('Event synced with Google Calendar:', response);
      // You might want to save the Google Calendar event ID to your database here
    })
    .catch(error => {
      console.error('Error syncing event with Google Calendar:', error);
    });
}

// Get free/busy times for event scheduling
function getAvailableTimes(startDate, endDate) {
  const startTime = new Date(startDate);
  const endTime = new Date(endDate);

  getFreeBusyTimes(startTime, endTime)
    .then(busyPeriods => {
      const availableTimes = calculateAvailableTimes(startTime, endTime, busyPeriods);
      displayAvailableTimes(availableTimes);
    })
    .catch(error => {
      console.error('Error getting available times:', error);
    });
}

// Calculate available times based on busy periods
function calculateAvailableTimes(startTime, endTime, busyPeriods) {
  let availableTimes = [];
  let currentTime = new Date(startTime);

  busyPeriods.forEach(busyPeriod => {
    if (currentTime < new Date(busyPeriod.start)) {
      availableTimes.push({
        start: new Date(currentTime),
        end: new Date(busyPeriod.start)
      });
    }
    currentTime = new Date(busyPeriod.end);
  });

  if (currentTime < endTime) {
    availableTimes.push({
      start: new Date(currentTime),
      end: new Date(endTime)
    });
  }

  return availableTimes;
}

// Display available times
function displayAvailableTimes(availableTimes) {
  const app = document.getElementById('app');
  let html = '<h3>利用可能な時間帯</h3><ul>';

  availableTimes.forEach(time => {
    html += `<li>${formatDate(time.start)} - ${formatDate(time.end)}</li>`;
  });

  html += '</ul>';
  app.innerHTML += html;
}

// Format date for display
function formatDate(date) {
  return date.toLocaleString('ja-JP', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit'
  });
}

// Update createEvent function to include Google Calendar sync
function createEvent(e) {
  e.preventDefault();
  const user = firebase.auth().currentUser;
  if (!user) {
    console.error("User is not logged in");
    return;
  }

  const eventData = {
    uid: user.uid,
    title: document.getElementById('event-title').value,
    datetime: document.getElementById('event-datetime').value,
    locationType: document.getElementById('event-location-type').value,
    location: document.getElementById('event-location').value,
    scenarioId: document.getElementById('event-scenario').value,
    maxParticipants: document.getElementById('event-max-participants').value,
    description: document.getElementById('event-description').value
  };

  fetch('/api/create_event.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData),
  })
  .then(response => response.json())
  .then(data => {
    if (!data.error) {
      console.log("Event created successfully");
      syncEventWithCalendar(eventData);  // Sync with Google Calendar
      showEventDetails(data.eventId);
    } else {
      console.error("Event creation error:", data.error);
    }
  })
  .catch(error => console.error("Event creation error:", error));
}

// Add Google Calendar authorization button to event creation form
function showEventCreationForm() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h2>イベント作成</h2>
    <form id="event-creation-form">
      <!-- Existing form fields -->
      ...
      <button type="submit">イベントを作成</button>
    </form>
    <button id="authorize_button" style="display: none;">Authorize</button>
    <button id="signout_button" style="display: none;">Sign Out</button>
  `;

  document.getElementById('event-creation-form').addEventListener('submit', createEvent);
  document.getElementById('authorize_button').addEventListener('click', handleAuthClick);
  document.getElementById('signout_button').addEventListener('click', handleSignoutClick);
}