
// Import statement below does not work.
// Recommended workaround found here:
// https://github.com/firebase/firebase-js-sdk/issues/5732
// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-app.js";
// import { getMessaging } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-messaging-sw-compat.js";

// Workaround shown here.
// Firebase 8 syntax is being used for this service worker.
importScripts("https://www.gstatic.com/firebasejs/9.8.3/firebase-app-compat.js");
console.log('script1 loaded');
importScripts("https://www.gstatic.com/firebasejs/9.8.3/firebase-messaging-compat.js");
console.log('script2 loaded');

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


// Show notification when page is inactive or not
messaging.onBackgroundMessage(payload => {
    console.log(new Date)
    console.log('BG message received. ', payload);
    console.log('starting notification')
    const notification = payload.notification;
    const notificationOption = {
        body: notification.body,
        icon: "./images/favicon.png"
    }
    console.log(`Title: ${notification.title}`);
    console.log(`Content: ${notification.notificationOption}`);
    return self.registration.showNotification(notification.title,notificationOption)
});

// Show notification when page is active / in focus
const receiver = new BroadcastChannel("sw-messages")

receiver.addEventListener("message", function(event) {
    const {data} = event;
    console.log(data)
    if (data.type === "fcm-notif") {
        const notificationOption = {
            body: data.body,
            icon: "./images/favicon.png"
        };
        return self.registration.showNotification(data.title,notificationOption)
    };
})

self.addEventListener('notificationclick', function(event) {
    console.log('On notification click: ', event.notification.tag);
    // Android doesn't close the notification when you click on it
    // See: http://crbug.com/463146
    event.notification.close();

    // This looks to see if the current is already open and
    // focuses if it is
    event.waitUntil(
    clients.matchAll({
        type: "window"
    })
    .then(function(clientList) {
        for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url == '/' && 'focus' in client)
            return client.focus();
        }
        if (clients.openWindow) {
            return clients.openWindow('/');
        }
    })
    );
});

