import { getAuth, signOut,
    createUserWithEmailAndPassword, signInWithEmailAndPassword,
    signInWithPopup, FacebookAuthProvider,
    GoogleAuthProvider,
    } from 'firebase/auth'
import {
    getFirestore, collection, doc, getDoc,
    setDoc,
} from 'firebase/firestore'


// initialize firebase services
const auth = getAuth();
const db = getFirestore();
// console.log(auth)

// reference to collections
const colRefUsers = collection(db, "users")

// Registration of User using Email and Password

const appRegForm = document.querySelector('#appRegForm');
const appRegFormOutp = document.querySelector('#appRegFormTextOutp');

const pwMatchCheck = (firstPw, secondPw) => {
    if (firstPw === secondPw) {
        return true
    } else {
        return false
    }
};

appRegForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userFirstName = appRegForm.fname.value;
    const userLastName = appRegForm.lname.value;
    const userEmail = appRegForm.email.value;
    const userPw = appRegForm.password.value;
    appRegFormOutp.innerHTML = "";
    if (! pwMatchCheck(appRegForm.password.value, appRegForm.confirmPw.value)) {
        appRegFormOutp.innerHTML = "Error: Passwords do not match."
    } else {
        createUserWithEmailAndPassword(auth, userEmail, userPw)
            .then((cred) => {
                console.log('user created:', cred.user);
                setDoc(doc(db, 'users', userEmail), {
                    user_email: userEmail,
                    firstname: userFirstName,
                    lastname: userLastName,
                    photo: "",
                    bonus_tries: 0,
                    points: 0,
                    score: 0,
                })
                .then(() => {
                    console.log('new user record created')
                })
                appRegForm.reset();
            })
            .catch((err) => {
                console.log(err.message);
            })
        };
    })
    

// Signing in User using Email and Password

const appLoginForm = document.querySelector('#appLoginForm');
const appLoginFormOutp = document.querySelector('#appLoginFormTextOutp');

appLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userEmail = appLoginForm.loginUsername.value;
    const userPw = appLoginForm.loginPw.value;
    appLoginFormOutp.innerHTML = ""
    signInWithEmailAndPassword(auth, userEmail, userPw)
        .then((cred) => {
            console.log('user signed in:', cred.user);
        })
        .catch((err) => {
            console.log(err.message);
            if (err.message === "Firebase: Error (auth/wrong-password).") {
                appLoginFormOutp.innerHTML = "Error: Wrong password."
            }
        })
})

// Check if user exists

// const testDoc = doc(db, 'users', 'ebalbin0@mylangara.ca');
// getDoc(testDoc)
//     .then((document) => {
//         if (document.exists()) {
//             console.log('Document exists:', document.data())
//         } else {
//             console.log('Document does not exist.')
//         }
//     })
//     .catch((err) => {
//         console.log(err.message)
//     })
    
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

// Sign in with Facebook

const fbLoginButton = document.getElementById('fbLoginBtn');
const providerFB = new FacebookAuthProvider(); 
providerFB.addScope('email')

fbLoginButton.addEventListener('click', (e) => {
    e.preventDefault();
    signInWithPopup(auth, providerFB)
        .then((cred) => {
            console.log('Preparing users')
            const user = cred.user;
            console.log(user);
        })
        .catch((err) => {
            console.log(err.message);
        })
    })
    
// Sign in with Google
const googleLoginButton = document.getElementById('googleLoginBtn');
const providerGoogle = new GoogleAuthProvider();
providerGoogle.addScope('https://www.googleapis.com/auth/userinfo.email');
providerGoogle.addScope('https://www.googleapis.com/auth/userinfo.profile');

googleLoginButton.addEventListener('click', (e) => {
    e.preventDefault();
    signInWithPopup(auth, providerGoogle)
    .then((cred) => {
        const user = cred.user.providerData[0];
        // console.log(user)
        createEmailInUserCol(user.email, user.displayName, "");
    })
    .catch((err) => {
        console.log(err.message);
    })
})