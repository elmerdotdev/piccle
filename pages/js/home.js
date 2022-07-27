"use strict";

import { db } from "../../firebase.js";

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy,
  limit,
} from "../../firebase-lib/firebase-firestore.js";

export function init() {
  document.getElementById("st-sidenavId").style.width = "0%";
  let loggedInUser = localStorage.getItem("piccleUID");
  let userPoints = null;
  let userHints = 5;
  let userCurrentGame = null;
  let userGameWord = null;

  const userRef = collection(db, "users");
  const progressColRef = collection(db, "progress");
  const wordsColRef = collection(db, "words");
  const queries = {
    userRankQuery: query(userRef, orderBy("score", "desc")),
    userProgress: query(
      progressColRef,
      where("user_email", "==", loggedInUser),
      orderBy("date_started", "desc"),
      limit(1)
    ),
    userGames: query(
      progressColRef,
      where("user_email", "==", loggedInUser),
      orderBy("date_started", "desc")
    ),
  };
  const playHintDisplay = {
    ready: "New Game is Ready",
    wait: "Next Game Begins Tomorrow",
  };

  getDocs(queries["userRankQuery"])
    .then((snapshot) => {
      const emailList = [];
      snapshot.forEach((doc) => {
        const userInfo = doc.data();
        emailList.push(userInfo.user_email);
        if (userInfo.user_email === loggedInUser) {
          userPoints = userInfo.points;
        }
      });
      const userRank = emailList.indexOf(loggedInUser) + 1;
      document.querySelector(".player-rank").innerHTML =
        ordinalSuffixOf(userRank);
      document.querySelector(".earned-points").innerHTML = userPoints;
    })
    .catch((err) => {
      console.log(err.message);
    });

  getDocs(queries["userProgress"]).then((snapshot) => {
    if (snapshot.size === 0) {
      document.querySelector("span.game-chance").style.display = "none";
      document.querySelector("span.game-hint").innerHTML =
        playHintDisplay["ready"];
    } else {
      snapshot.forEach((docSnap) => {
        console.log("Curr progress >>>>", docSnap.data());
        userCurrentGame = docSnap.data();
        userGameWord = userCurrentGame.word;
        const lastGameDate = new Date(
          userCurrentGame.date_started.seconds * 1000
        );

        // check if last game was started today
        if (datesAreOnSameDay(lastGameDate, new Date())) {
          userHints = 5 - userCurrentGame.tries;

          // check if game is done
          // game is done when:
          // 1. remaining hints == 0; or
          // 2. game resolved == true
          if (userHints === 0 || userCurrentGame.resolved) {
            document.querySelector("span.game-hint").innerHTML =
              playHintDisplay["wait"];
            document.querySelector("span.game-chance").style.display = "none";
          } else {
            document.querySelector("span.game-chance").innerHTML = userHints;
            const wordDocRef = doc(db, "words", userGameWord);
            getDoc(wordDocRef).then((wordDoc) => {
              const wordHints = wordDoc.data().hints;
              document.querySelector("span.game-hint").innerHTML =
                wordHints[userCurrentGame.tries];
            });
          }
        } else {
          document.querySelector("span.game-hint").innerHTML =
            playHintDisplay["ready"];
          document.querySelector("span.game-chance").style.display = "none";
          userHints = 0;
        }
      });
    }
  });

  getDocs(queries["userGames"]).then((snapshot) => {
    let pastGames = snapshot.size;
    snapshot.forEach((docSnap) => {
      const pastGameDate = new Date(docSnap.get("date_started").seconds * 1000);

      // Exclude unfinished game today in history count
      // Check if this game record was started today
      if (datesAreOnSameDay(pastGameDate, new Date())) {
        // Check if this game record is unfinished
        if (!(userHints === 0 || userCurrentGame.resolved)) {
          // If this game record was started today and is unfinished,
          // subtract 1 from pastGames
          pastGames -= 1;
        }
      }
    });
    document.querySelector("span.player-history").innerHTML = pastGames;
  });

  setTimeout(() => {
    document.querySelectorAll(".hide").forEach((card) => {
      card.classList.remove("hide");
    });
  }, 300);
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

function datesAreOnSameDay(first, second) {
  if (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  ) {
    return true;
  } else {
    return false;
  }
}
