// SW
const cacheName = "v2.1";
const urlsToCache = [
    "/pwa.js","/firebase-lib/firebase-app-compat.js","/firebase-lib/firebase-app.js","/firebase-lib/firebase-auth.js","/firebase-lib/firebase-firestore.js","/firebase.js","/main.js","/notifications.js","/routing-module.js","/routing.js","/vision.js","/pages/js/history.js","/pages/js/home.js","/pages/js/leaderboard.js","/pages/js/play.js","/pages/js/settings.js","/pages/js/shop.js","/pages/js/signin.js","/pages/js/signup.js",
  "/" ,"/index.html","/pages/component.html","/pages/history.html","/pages/home.html","/pages/leaderboard.html","/pages/play.html","/pages/settings.html","/pages/shop.html","/pages/signin.html","/pages/signup.html",
  "/css/components.css","/css/style.css","/pages/css/component.css","/pages/css/history.css","/pages/css/home.css","/pages/css/leaderboard.css","/pages/css/play.css","/pages/css/settings.css","/pages/css/shop.css","/pages/css/signin.css","/pages/css/signup.css",
  "/images/animated-logo.svg","/images/favicon.png","/images/logo.png","/images/pattern.png",
];


self.addEventListener('install', event => {
    // it is invoked when the browser installs the service worker
    // here we cache the resources that are defined in the urlsToCache[] array
    console.log(`[SW] Event fired: ${event.type}`);
    event.waitUntil(				  // waitUntil tells the browser to wait for the passed promise is done
		  caches.open( cacheName )		//caches is a global object representing CacheStorage
			  .then( ( cache ) => { 			// open the cache with the name cacheName*
				  return cache.addAll( urlsToCache );      	// pass the array of URLs to cache. returns a promise
		  }));
      console.log(`[SW] installed`);
});

self.addEventListener('activate', event => {
    // it is invoked after the service worker completes its installation. 
    // It's a place for the service worker to clean up from previous SW versions
    console.log(`[SW] Event fired: ${event.type}`);

    console.log(`[SW] activated`);

    event.waitUntil( // waitUntil tells the browser to wait for passed promise to finish
        caches.keys().then( ( keyList ) => {
            return Promise.all( keyList.map( ( key ) => {
                if ( key !== cacheName ) { // compare key with the new cache Name in SW
                    return caches.delete( key ); // delete any cache with old name
                }
            }));
        })
    );
});

self.addEventListener("fetch", event => {
    // Fires whenever the app requests a resource (file or data)  normally this is where the service worker would check to see
    // if the requested resource is in the local cache before going to the server to get it. 
    console.log(`[SW] Fetch event for ${event.request.url}`);

    //1. No Strategy, simply forward the request to server (i.e. No Offline Capability)
    // event.respondWith(fetch(event.request));

    //2. Cache first, then network
    // event.respondWith( ( async() => {
    //     const response = await caches.match( event.request);
    //     return response || fetch( event.request );
    // })());

    //3. Network first, then cache
    event.respondWith( (async () => {
        try {
            return await fetch( event.request ); // get online
        } catch(error) {
            return caches.match( event.request ); // get offline
        }
        })()
    );

    // if offline
    // if (event.request.mode === 'navigate') {

    // }
});


// Import statement below does not work.
// Recommended workaround found here:
// https://github.com/firebase/firebase-js-sdk/issues/5732
// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-app.js";
// import { getMessaging } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-messaging-sw-compat.js";

// Workaround shown here.
// Firebase 8 syntax is being used for this service worker.
importScripts("./firebase-lib/firebase-app-compat.js");
console.log('script1 loaded');
importScripts("./firebase-lib/firebase-messaging-compat.js");
console.log('script2 loaded');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
    apiKey: piccleConfig.firebase,
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