import { db } from "../../firebase.js"

import { getAuth } from "../../firebase-lib/firebase-auth.js";

import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  doc,
  getDocs,
  setDoc,
  getDoc,
} from "../../firebase-lib/firebase-firestore.js";

export function init () {

// initialize firebase services
const auth = getAuth();
const user = localStorage.piccleUID;

// const user = auth.currentUser;
// console.log(user)
// if (user === null) {
//     console.log("User is not signed in");
//     alert("You are not signed in");
//     window.location.hash = "signin";
// }

// Check if UID stored in browser exists in "users" collection
async function checkUIDinBrowser() {
  const uIDInBrowser = localStorage.getItem("piccleUID");
  if (uIDInBrowser != null) {
    const docRef = doc(db, "users", uIDInBrowser);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

checkUIDinBrowser()
  .then((resp) => {
    if (!resp) {
      alert("Please sign-in. Redirecting...");
      window.location.hash = "signin";
    }
  })
  .catch((err) => {
    console.log(err.message);
  });

console.log("hello from leaderboard.js");

// reference to collections
const colRefUsers = collection(db, "users");
const q = query(colRefUsers, orderBy("score", "desc"));

class Ranking {
  constructor(rank, name, score, curUser) {
    this.rank = rank;
    this.name = name;
    this.score = score;
    this.curUser = curUser;
  }
}

const leaderboardTable = [];
const leaderboardList = document.getElementById("leaderboard");

getDocs(q)
  .then((snapshot) => {
    snapshot.forEach((doc) => {
      const userInfo = doc.data();
      const userName = displayPublicName(userInfo.firstname, userInfo.lastname);
      const curUserFlag = user === userInfo.user_email ? true : false;
      leaderboardTable.push(
        new Ranking(
          leaderboardTable.length + 1,
          userName,
          userInfo.score,
          curUserFlag
        )
      );
    });
    console.table(leaderboardTable);

    leaderboardTable.forEach((row) => {
      if (row.curUser == true) {
        const userPosition = document.getElementById("userPosition");
        userPosition.innerHTML = ordinalSuffixOf(row.rank);
        leaderboardList.innerHTML += `<tr class="current-user">
        <td>${row.rank}</td>
        <td>${row.name}</td>
        <td>${row.score}</td></tr>`;
      } else {
        leaderboardList.innerHTML += `<tr>
        <td>${row.rank}</td>
        <td>${row.name}</td>
        <td>${row.score}</td></tr>`;
      }
    });
  })
  .catch((err) => {
    console.log(err.message);
  });
}

function displayPublicName(firstname, lastname) {
  if (firstname.length + lastname.length + 1 > 10) {
    return firstname;
  } else {
    if (lastname === "") {
      return firstname;
    } else {
      return firstname + " " + lastname;
    }
  }
}

function ordinalSuffixOf(i) {
  let j = i % 10;
  let k = i % 100;
  if (j == 1 && k != 11) {
    return i + "st";
  }
  if (j == 2 && k != 12) {
    return i + "nd";
  }
  if (j == 3 && k != 13) {
    return i + "rd";
  }
  return i + "th";
}
