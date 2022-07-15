import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.8.3/firebase-app.js'
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-analytics.js"
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-messaging.js";

import { getAuth, signOut,
    createUserWithEmailAndPassword, signInWithEmailAndPassword,
    signInWithPopup, FacebookAuthProvider,
    GoogleAuthProvider, 
} from 'https://www.gstatic.com/firebasejs/9.8.3/firebase-auth.js'


const firebaseConfig = {
    apiKey: "AIzaSyBz55X3M4wdtYiW7EsbFwGz98K1Mw4xOOo",
    authDomain: "wmdd-4885-integrated-project.firebaseapp.com",
    projectId: "wmdd-4885-integrated-project",
    storageBucket: "wmdd-4885-integrated-project.appspot.com",
    messagingSenderId: "65956786490",
    appId: "1:65956786490:web:329f96ce8f75152a06e003"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

getToken(messaging, {vapidKey: "BImddxEb7T0PKBfC7dIteWyZ37ea7pJjUJlNqlc7YMxEdl7zkAr0KPrywc5R7iO3zz59Em6vk-Wo_EtO6mU_IhY"})
.then(currentToken => {
    if (currentToken) {
        console.log(currentToken);
    } else {
        console.log("No registration token.")
    }
})
.catch(err => {console.log(err.message)});

// function requestPermission() {
//     console.log('Requesting permission...');
//     Notification.requestPermission().then((permission) => {
//       if (permission === 'granted') {
//         console.log('Notification permission granted.')}}};

function requestPermission() {
    console.log('Requesting permission...');
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            console.log('Notification permission granted.');
        }
    })
};

requestPermission();