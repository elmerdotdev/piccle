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


class UserRank {
 
    constructor (rank, name, score, curUser) {
        this.rank = rank;
        this.name = name;
        this.score = score;
        this.curUser = curUser;
    }
 
    static createRow (rowItems) {
        const row = document.createElement('tr');
        rowItems.forEach((rowItem) => {
            const cell = row.insertCell();
            cell.innerHTML = rowItem;

            // temporary styling
            cell.style = "border: 1px solid black;"
        });
        return row;
    }

    static createTable () {
        const newTable = document.createElement('table');
        const headerRow = newTable.createTHead().insertRow();
        const rowHeaders = ["Ranking", "Name", "Score", "Current User"];
        rowHeaders.forEach((headerItem) => {
            const headerCell = headerRow.insertCell();
            headerCell.innerHTML = headerItem;
        })

        // temporary styling
        newTable.style = "border-collapse: collapse;"

        return newTable;
    }
 
    getAsList () {
        return [this.rank, this.name, this.score, this.curUser];
    }

    getAsRow () {
        const valuesList = this.getAsList(); 
        return UserRank.createRow(valuesList);
    }
 
}

const leaderboardTable = UserRank.createTable();
document.getElementById('mainArea').appendChild(leaderboardTable);
const leaderboardTBody = leaderboardTable.createTBody();

getDocs(q)
.then((snapshot) => {
    snapshot.forEach((doc) => {
        const userInfo = doc.data();
        const userName = displayPublicName(userInfo.firstname, userInfo.lastname);
        const curUserFlag = (user === userInfo.user_email) ? true : false;
        const userObj = new UserRank((leaderboardTBody.rows.length + 1), userName, userInfo.score, curUserFlag);
        leaderboardTBody.appendChild(userObj.getAsRow());
    })
    
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
