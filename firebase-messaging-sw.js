
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
    apiKey: "AIzaSyBz55X3M4wdtYiW7EsbFwGz98K1Mw4xOOo",
    authDomain: "wmdd-4885-integrated-project.firebaseapp.com",
    projectId: "wmdd-4885-integrated-project",
    storageBucket: "wmdd-4885-integrated-project.appspot.com",
    messagingSenderId: "65956786490",
    appId: "1:65956786490:web:329f96ce8f75152a06e003",
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

console.log("hello from fcm sw.")

