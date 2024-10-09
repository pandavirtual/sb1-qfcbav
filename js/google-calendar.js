// Google Calendar API credentials
const API_KEY = 'YOUR_API_KEY';
const CLIENT_ID = 'YOUR_CLIENT_ID';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar";

let tokenClient;
let gapiInited = false;
let gisInited = false;

document.addEventListener('DOMContentLoaded', gapiLoad);

function gapiLoad() {
  gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: DISCOVERY_DOCS,
  });
  gapiInited = true;
  maybeEnableButtons();
}

function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '', // defined later
  });
  gisInited = true;
  maybeEnableButtons();
}

function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    document.getElementById('authorize_button').style.visibility = 'visible';
  }
}

function handleAuthClick() {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw (resp);
    }
    document.getElementById('signout_button').style.visibility = 'visible';
    document.getElementById('authorize_button').innerText = 'Refresh';
    await listUpcomingEvents();
  };

  if (gapi.client.getToken() === null) {
    tokenClient.requestAccessToken({prompt: 'consent'});
  } else {
    tokenClient.requestAccessToken({prompt: ''});
  }
}

function handleSignoutClick() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken('');
    document.getElementById('content').innerText = '';
    document.getElementById('authorize_button').innerText = 'Authorize';
    document.getElementById('signout_button').style.visibility = 'hidden';
  }
}

async function listUpcomingEvents() {
  let response;
  try {
    const request = {
      'calendarId': 'primary',
      'timeMin': (new Date()).toISOString(),
      'showDeleted': false,
      'singleEvents': true,
      'maxResults': 10,
      'orderBy': 'startTime',
    };
    response = await gapi.client.calendar.events.list(request);
  } catch (err) {
    document.getElementById('content').innerText = err.message;
    return;
  }

  const events = response.result.items;
  if (!events || events.length == 0) {
    document.getElementById('content').innerText = 'No events found.';
    return;
  }
  // Flatten to string to display
  const output = events.reduce(
      (str, event) => `${str}${event.summary} (${event.start.dateTime || event.start.date})\n`,
      'Events:\n');
  document.getElementById('content').innerText = output;
}

// Add event to Google Calendar
async function addEventToCalendar(event) {
  const calendarEvent = {
    'summary': event.title,
    'location': event.location,
    'description': event.description,
    'start': {
      'dateTime': event.datetime,
      'timeZone': 'Asia/Tokyo'
    },
    'end': {
      'dateTime': event.datetime, // You may want to set an end time
      'timeZone': 'Asia/Tokyo'
    },
    'reminders': {
      'useDefault': false,
      'overrides': [
        {'method': 'email', 'minutes': 24 * 60},
        {'method': 'popup', 'minutes': 10}
      ]
    }
  };

  try {
    const request = gapi.client.calendar.events.insert({
      'calendarId': 'primary',
      'resource': calendarEvent
    });

    const response = await request.execute();
    console.log('Event added: ' + response.htmlLink);
    return response;
  } catch (error) {
    console.error('Error adding event to calendar:', error);
    throw error;
  }
}

// Get free/busy times
async function getFreeBusyTimes(startTime, endTime) {
  const request = {
    'timeMin': startTime.toISOString(),
    'timeMax': endTime.toISOString(),
    'timeZone': 'Asia/Tokyo',
    'items': [{'id': 'primary'}]
  };

  try {
    const response = await gapi.client.calendar.freebusy.query(request);
    const busyPeriods = response.result.calendars.primary.busy;
    return busyPeriods;
  } catch (error) {
    console.error('Error getting free/busy times:', error);
    throw error;
  }
}

// Export functions
window.handleAuthClick = handleAuthClick;
window.handleSignoutClick = handleSignoutClick;
window.addEventToCalendar = addEventToCalendar;
window.getFreeBusyTimes = getFreeBusyTimes;