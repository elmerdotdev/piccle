import { getAuth, signOut,
    createUserWithEmailAndPassword, signInWithEmailAndPassword,
    signInWithPopup, FacebookAuthProvider,
    GoogleAuthProvider, 
} from 'https://www.gstatic.com/firebasejs/9.8.3/firebase-auth.js'

import {
    getFirestore, collection, doc, getDoc,
    setDoc,
} from 'https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore.js'


// initialize firebase services
const auth = getAuth();
const db = getFirestore();
// console.log(auth)

// reference to collections
const colRefUsers = collection(db, "users")

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
            })
            .then(() => {
                console.log('new user record created')
            })
        } else {
            console.log('user already exists')
        }
    })
}

// Registration of User using Email and Password

const appRegForm = document.querySelector('.signup-field form');

const pwMatchCheck = (firstPw, secondPw) => {
    if (firstPw === secondPw) {
        return true
    } else {
        return false
    }
};

appRegForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userFirstName = document.querySelector('#name');
    const userLastName = "";
    const userEmail = document.querySelector('#email');
    const userPw = document.querySelector('#password1');
    // Prepare error warning text
    const appRegFormOutp = document.createElement('p');
    appRegFormOutp.innerHTML = '';
    appRegFormOutp.classList.add('form-error-output-text');
    appRegFormOutp.classList.toggle('visually-hidden');
    if (!document.body.contains(appRegFormOutp)) {
        document.querySelector('input.signup-btn').parentElement.prepend(appLoginFormOutp)
    }
    appRegFormOutp.innerHTML = "";
    if (! pwMatchCheck(userPw, document.querySelector('#password2'))) {
        // Show error warning text
        appRegFormOutp.innerHTML = "Error: Passwords do not match."
        appRegFormOutp.classList.toggle('visually-hidden');
    } else {
        createUserWithEmailAndPassword(auth, userEmail, userPw)
            .then((cred) => {
                createEmailInUserCol(userEmail, userFirstName, userLastName)
                console.log('user created:', cred.user);
                appRegForm.reset();
            })
            .catch((err) => {
                console.log(err.message);
            })
        };
    })
    

