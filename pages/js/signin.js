import { db, auth } from "../../firebase.js"

import { getAuth, signOut,
    createUserWithEmailAndPassword, signInWithEmailAndPassword,
    signInWithPopup, FacebookAuthProvider,
    GoogleAuthProvider, TwitterAuthProvider,
} from '../../firebase-lib/firebase-auth.js'

import {
    getFirestore, collection, doc, getDoc,
    setDoc, updateDoc, arrayUnion,
} from '../../firebase-lib/firebase-firestore.js'

export function init () {

// reference to collections
const colRefUsers = collection(db, "users")

// Redirect user to home if previous account already detected in browser
document.querySelector('body').style.display = "none";
checkUIDinBrowser()
.then((resp) => {
    if (resp) {
        // alert("Previous sign-in detected, logging in...")
        window.location.hash = "home";
    } else {
        window.location.has = "signin";
    }
    document.querySelector('body').style.display = "block";
})
.catch((err) => {
    console.log(err.message);
})


// Check if email id exists in user collection
function checkEmailInUserCol (email) {
    
    const testDoc = doc(db, 'users', email);
    return getDoc(testDoc)
        .then((document) => {
            return document.exists()
        })
        .catch((err) => {
            console.log(err.message)
        })
}

// Create new email id in user collection
    
function createEmailInUserCol (email, fname, lname) {
    // const existingRecordFlag = checkEmailInUserCol(email)
    checkEmailInUserCol(email)
    .then((existingRecordFlag) => {
        console.log('existingRecordFlag:', existingRecordFlag)
        if ( !(existingRecordFlag) ) {
            setDoc(doc(db, 'users', email), {
                user_email: email,
                firstname: fname,
                lastname: lname,
                photo: "",
                bonus_tries: 0,
                points: 0,
                score: 0,
                finished_tutorial: false,
            })
            .then(() => {
                console.log('new user record created')
            })
        } else {
            console.log('user already exists')
        }
    })
}

// Store user id in browser localStorage

function storeUIDInBrowser (email) {
    localStorage.setItem('piccleUID', email);
}

// Remove piccleUID from browser localStorage
function removeUIDinBrowser () {
    localStorage.removeItem('piccleUID');
}

// Check if UID stored in browser exists in "users" collection
async function checkUIDinBrowser () {
    const uIDInBrowser = localStorage.getItem('piccleUID');
    if ( uIDInBrowser != null ) {
        const docRef = doc(db, "users", uIDInBrowser);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    };
};

// Store providerID in "users" collection
function addProviderToCollection () {
    const userDoc = doc(db, "users", localStorage.piccleUID);
    const currProviderId = auth.currentUser.providerData[0].providerId; 
    getDoc( userDoc )
    .then(res => {
        const providerIDsArray = res.get("providerIDs")
        if (providerIDsArray === undefined) {
            updateDoc(userDoc, {
                providerIDs: [currProviderId]
            })
        } else if (! providerIDsArray.includes(currProviderId) ) {
            updateDoc(userDoc, {
                providerIDs: arrayUnion(currProviderId)
            })
            .then(() => {console.log("Provider stored.")})
        } else {
            console.log("This provider was already added.")
        }
        console.log("Provider update complete.")
    })
    .catch(err => {console.log(err.message)})
}

// Signing in User using Email and Password

const appLoginForm = document.querySelector('.login-field form');
const appLoginButton = document.querySelector('.login-field form .formfield-wrapper:nth-of-type(3)');
const appLoginPWField = document.querySelector('.login-field form input[type=password]');

appLoginButton.addEventListener('click', (e) => {
    e.preventDefault();
    const userEmail = appLoginForm.email.value;
    const userPw = appLoginForm.password.value;
    if (appLoginPWField.classList.contains('incorrect-pw')) {
        appLoginPWField.classList.remove('incorrect-pw');
    }
    signInWithEmailAndPassword(auth, userEmail, userPw)
        .then((cred) => {
            console.log('user signed in:', cred.user);
            storeUIDInBrowser(userEmail);
            addProviderToCollection();
            window.location.hash = "home";
        })
        .catch((err) => {
            console.log(err.message);
            if (err.message === "Firebase: Error (auth/wrong-password).") {
                if (!appLoginPWField.classList.contains('incorrect-pw')) {
                    appLoginPWField.classList.add('incorrect-pw');
                }
            }
        })
})

// Sign in with Facebook

const fbLoginButton = document.querySelector('.socialmedia-icons li:nth-of-type(1)');
const providerFB = new FacebookAuthProvider(); 
providerFB.addScope('email')

fbLoginButton.addEventListener('click', (e) => {
    e.preventDefault();
    signInWithPopup(auth, providerFB)
        .then((cred) => {
            console.log('Preparing users')
            const user = cred.user;
            console.log(user);
            createEmailInUserCol(user.email, user.displayName, "");
            storeUIDInBrowser(user.email);
            addProviderToCollection();
            window.location.hash = "home";
        })
        .catch((err) => {
            console.log(err.message);
        })
    })

// Sign in with Twitter
const twLoginButton = document.querySelector('.socialmedia-icons li:nth-of-type(2)');
const providerTW = new TwitterAuthProvider;

twLoginButton.addEventListener('click', (e) => {
    e.preventDefault();
    signInWithPopup(auth, providerTW)
    .then((cred) => {
        const user = cred._tokenResponse;
        createEmailInUserCol(user.email, user.displayName, "");
        storeUIDInBrowser(user.email);
        addProviderToCollection();
        window.location.hash = "home" 
    })
    .catch((err) => {
        console.log(err.message);
    })
})
    
// Sign in with Google
const googleLoginButton = document.querySelector('.socialmedia-icons li:nth-of-type(3)');
const providerGoogle = new GoogleAuthProvider();
providerGoogle.addScope('https://www.googleapis.com/auth/userinfo.email');
providerGoogle.addScope('https://www.googleapis.com/auth/userinfo.profile');

googleLoginButton.addEventListener('click', (e) => {
    e.preventDefault();
    signInWithPopup(auth, providerGoogle)
    .then((cred) => {
        const user = cred.user.providerData[0];
        createEmailInUserCol(user.email, user.displayName, "");
        storeUIDInBrowser(user.email);
        addProviderToCollection();
        window.location.hash = "home";
    })
    .catch((err) => {
        console.log(err.message);
    })
})


// =============== SHOW PW  

document.querySelector('.pw-checkbox').addEventListener('click', revealPW)

function revealPW() {
    const x = document.getElementById("password");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
  }
  
}