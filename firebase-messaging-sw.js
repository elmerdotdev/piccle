
// Import statement below does not work.
// Recommended workaround found here:
// https://github.com/firebase/firebase-js-sdk/issues/5732
// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-app.js";
// import { getMessaging } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-messaging-sw.js";

// Workaround shown here.
// Firebase 8 syntax is being used for this service worker.
importScripts("https://www.gstatic.com/firebasejs/9.8.3/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.8.3/firebase-messaging-compat.js");

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: 'api-key',
  authDomain: 'project-id.firebaseapp.com',
  databaseURL: 'https://project-id.firebaseio.com',
  projectId: 'project-id',
  storageBucket: 'project-id.appspot.com',
  messagingSenderId: 'sender-id',
  appId: 'app-id',
  measurementId: 'G-measurement-id',
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

// Handle incoming messages. Called when:
// - a message is received while the app has focus
// - the user clicks on an app notification created by a service worker
//   `messaging.onBackgroundMessage` handler.
messaging.onMessage((payload) => {
    console.log('Message received. ', payload);
    // ...
  });

messaging.onBackgroundMessage(payload => {
    console.log('BG message received. ', payload);
});

