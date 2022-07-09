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

// Store user id in browser localStorage

function storeUIDInBrowser (email) {
    localStorage.setItem('piccleUID', email);
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

const pwMatchCheck = (firstPw, secondPw) => {
    if (firstPw === secondPw) {
        return true
    } else {
        return false
    }
};


// Registration of User using Email and Password

const appRegForm = document.querySelector('.signup-field form');

// Create error warning p element
const appRegFormOutp = document.createElement('p');

appRegForm.addEventListener('submit', (e) => {
    e.preventDefault();
    appRegFormOutp.classList.toggle('visually-hidden');
    const userFirstName = document.querySelector('#name').value;
    const userLastName = "";
    const userEmail = document.querySelector('#email').value;
    const userPw = document.querySelector('#password1').value;

    // Prepare error warning p element
    appRegFormOutp.innerHTML = '';
    appRegFormOutp.classList.add('form-error-output-text');
    appRegFormOutp.classList.add('visually-hidden');
    if (!document.body.contains(appRegFormOutp)) {
        document.querySelector('input.signup-btn').parentElement.prepend(appRegFormOutp)
    }
    appRegFormOutp.innerHTML = "";
    if (! pwMatchCheck(userPw, document.querySelector('#password2').value)) {
        // Display error warning p element and error text
        appRegFormOutp.innerHTML = "Error: Passwords do not match."
        appRegFormOutp.classList.remove('visually-hidden');
    } else {
        createUserWithEmailAndPassword(auth, userEmail, userPw)
        .then((cred) => {
            createEmailInUserCol(userEmail, userFirstName, userLastName)
            console.log('user created:', cred.user);
            signInWithEmailAndPassword(auth, userEmail, userPw)
            .then((signincred) => {
                appRegForm.reset();
                console.log('user created:', signincred.user);
                storeUIDInBrowser(userEmail);
                window.location.hash = "home";
            })
        })
        .catch((err) => {
            console.log(err.message);
        })
    };
})

// SHOW PW =======================  
function myFunction() {
    // Place HTML element reference in variable
    const checkboxShowPw = document.querySelector("input.pw-checkbox");
    const pwField1 = document.getElementById('password1')
    const pwField2 = document.getElementById('password2')
    
    // See if checkbox is checked ============
    if (checkboxShowPw.checked === true) {
        // If true or checked, set pw inputs to type = text
        pwField1.type = "text";
        pwField2.type = "text";
        
    } else {
        // If false or unchecked, set pw inputs to type = password
        pwField1.type = "password";
        pwField2.type = "password";
    }     

} 