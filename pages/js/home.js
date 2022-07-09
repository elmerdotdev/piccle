'use strict';

import { getFirestore, collection, query, where, getDocs  } from 'https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore.js'

function init () {
    
    let loggedInUser = localStorage.getItem('piccleUID')
    const db = getFirestore()

    const userRef = collection(db, "users")
    const userDetails = query(userRef, where("user_email", "==", loggedInUser))

    getDocs(userDetails)
    .then((snapshot) => {
        document.querySelector('.logged-in-user').innerHTML = `Hi ${snapshot.docs[0].data().firstname}!`
    })
}

init();