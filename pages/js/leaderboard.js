import { getAuth, 
} from 'https://www.gstatic.com/firebasejs/9.8.3/firebase-auth.js'

import {
    getFirestore, collection, 
    query, orderBy, limit,    
    doc, getDocs, setDoc,
    getDoc,
} from 'https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore.js'

// initialize firebase services
const auth = getAuth();
const db = getFirestore();
const user = localStorage.piccleUID;

// const user = auth.currentUser;
// console.log(user)
// if (user === null) {
//     console.log("User is not signed in");
//     alert("You are not signed in");
//     window.location.hash = "signin";
// }

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

checkUIDinBrowser()
    .then((resp) => {
        if (!resp) {
            alert("Please sign-in. Redirecting...");
            window.location.hash = "signin";
        }
    })
    .catch((err) => {console.log(err.message)})

console.log('hello from leaderboard.js');

// reference to collections
const colRefUsers = collection(db, "users")
const q = query(colRefUsers, orderBy("score", "desc"));

class Ranking {

    constructor (rank, name, score, curUser) {
        this.rank = rank;
        this.name = name;
        this.score = score;
        this.curUser = curUser;
    }
    
};

const leaderboardTable = [];
const leaderboardList = document.createElement('div');
leaderboardList.classList.add('leaderboard-list');
leaderboardList.innerHTML = "<p>Ranking, Name, Score, Current User</p>";
document.getElementById('mainArea').appendChild(leaderboardList);

getDocs(q)
.then((snapshot) => {
    snapshot.forEach((doc) => {
        const userInfo = doc.data();
        const userName = displayPublicName(userInfo.firstname, userInfo.lastname);
        const curUserFlag = (user === userInfo.user_email) ? true : false;
        leaderboardTable.push( new Ranking((leaderboardTable.length + 1), userName, userInfo.score, curUserFlag));
    })
    console.table(leaderboardTable);
    
    leaderboardTable.forEach((row) => {
        leaderboardList.innerHTML += `<p>${JSON.stringify(row)}</p>`;
    });
})
.catch((err) => {
    console.log(err.message);
})

function displayPublicName (firstname, lastname) {
    if ( (firstname.length + lastname.length + 1) > 10 ) {
        return firstname
    } else {
        if ( (lastname === "") ) {
            return firstname
        } else {
            return firstname + " " + lastname
        }
    }
};


// const leaderboardTable = document.createElement('table');
// leaderboardTable.style.width = "600px";
// const lbTableHeader = leaderboardTable.createTHead();
// const lbHeaderRow = lbTableHeader.insertRow();
// lbHeaderRow.insertCell("Rank");
// lbHeaderRow.insertCell("Name");
// lbHeaderRow.insertCell("Total Points");

// document.getElementById("mainArea").appendChild(leaderboardTable);

