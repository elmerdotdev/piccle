import { getAuth, 
} from 'https://www.gstatic.com/firebasejs/9.8.3/firebase-auth.js'

import {
    getFirestore, collection, 
    query, orderBy, limit,    
    doc, getDocs, setDoc,
} from 'https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore.js'

// initialize firebase services
const auth = getAuth();
const db = getFirestore();
const user = auth.currentUser;
console.log(user)
if (user === null) {
    console.log("User is not signed in");
    alert("You are not signed in");
    window.location.hash = "signin";
}

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

getDocs(q)
.then((snapshot) => {
    snapshot.forEach((doc) => {
        const userInfo = doc.data();
        const userName = displayPublicName(userInfo.firstname, userInfo.lastname);
        const curUserFlag = (user.email === userInfo.user_email) ? true : false;
        leaderboardTable.push( new Ranking((leaderboardTable.length + 1), userName, userInfo.score, curUserFlag));
    })
    console.table(leaderboardTable);
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

