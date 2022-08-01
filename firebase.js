import { initializeApp } from './firebase-lib/firebase-app.js'
import { getAnalytics } from "./firebase-lib/firebase-analytics.js"
import { getMessaging, getToken, onMessage } from "./firebase-lib/firebase-messaging.js";
import { getFirestore, doc, getDoc, updateDoc, arrayUnion, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED, disableNetwork, enableNetwork } from "./firebase-lib/firebase-firestore.js";
import { getAuth } from "./firebase-lib/firebase-auth.js";

// import { getAuth, signOut,
//     createUserWithEmailAndPassword, signInWithEmailAndPassword,
//     signInWithPopup, FacebookAuthProvider,
//     GoogleAuthProvider, 
// } from 'https://www.gstatic.com/firebasejs/9.8.3/firebase-auth.js'


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
export const auth = getAuth(app);
export const db = getFirestore(app, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
});

enableIndexedDbPersistence(db).then(
    console.log("Indexed db from: firebase.js")
).catch((err) => {
    console.log(err.code)
});

// document.querySelector('.dcFirebase').addEventListener('click', async () => {
//     await disableNetwork(db);
//     console.log("Network disabled!");
// })

// document.querySelector('.rcFirebase').addEventListener('click', async () => {
//     await enableNetwork(db);
//     console.log("Network enabled!");
// })

// Function to request notification approval from user
function requestPermission() {
    console.log('Requesting permission...');
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            console.log('Notification permission granted.');
        }
    })
};

// Request notification approval if in home page
window.addEventListener('hashchange', () => {
    if (window.location.hash === "#home" ) {
        requestPermission();
        getToken(messaging, {vapidKey: "BImddxEb7T0PKBfC7dIteWyZ37ea7pJjUJlNqlc7YMxEdl7zkAr0KPrywc5R7iO3zz59Em6vk-Wo_EtO6mU_IhY"})
        .then(currentToken => {
            console.log(currentToken);
            // check if token exists
            // true: try to store token in doc
            // false: log no registration token
            if (currentToken) {
                const userDoc = doc(db, "users", localStorage.piccleUID);
                getDoc( userDoc )
                .then(res => {
                    // check if field "webpushtokens" is in doc
                    // true: create field and add client token
                    // false: check if client token is NOT in doc
                    if (res.get("webpushtokens") === undefined) {
                        updateDoc( userDoc, {
                            webpushtokens: [currentToken]
                        } )
                        .then(() => {
                            console.log("Field 'webpushtokens' created. Token stored.")
                        })
                    } else {
                        let tokenArray = res.get("webpushtokens");
                        // check if client token is NOT in doc
                        // true: add client token to doc
                        // false: log token already exists
                        if (! tokenArray.includes(currentToken) ) {
                            updateDoc(userDoc, {
                                webpushtokens: arrayUnion(currentToken)
                            })
                            .then(() => {
                                console.log("Token stored.")
                            })
                        } else {
                            console.log("Token already exists.")
                        }
                    };
                });
            } else {
                console.log("No registration token.")
            }
        })
        .catch(err => {console.log(err.message)});
    }
});

onMessage(messaging, payload => {
    const broadCaster = new BroadcastChannel("sw-messages")
    console.log(new Date);
    console.log("Foreground Message Received: ", payload);
    const notification = payload.notification;
    
    broadCaster.postMessage({ 
        type: "fcm-notif",
        title: notification.title,
        body: notification.body
    });
    console.log('sent to FCM SW.');
})