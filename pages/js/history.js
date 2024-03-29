"use strict";

import { db } from "../../firebase.js";

import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
} from "../../firebase-lib/firebase-firestore.js";

export function init() {
  // If not logged in, redirect to login page
  const userEmail = localStorage.getItem("piccleUID");
  if (!userEmail) {
    location.hash = "#signin";
  }

  let points;
  let rank;

  // Messages
  const messages = {
    win: "You won the game",
    lose: "Try again next time",
  };

  // In-game status
  let inGame = false;

  // Get list of progress
  const getProgress = async () => {
    const progressRef = collection(db, "progress");
    const progressQuery = query(
      progressRef,
      where("user_email", "==", userEmail),
      orderBy("date_started", "desc")
    );

    const snapshot = await getDocs(progressQuery);
    try {
      snapshot.forEach((doc) => {
        if (
          !datesAreOnSameDay(
            new Date(doc.data().date_started.seconds * 1000),
            new Date()
          )
        ) {
          const fullDate = timestampToDate(doc.data().date_started);
          renderDOM(
            fullDate,
            doc.data().resolved,
            doc.data().tries,
            doc.id,
            doc.data().word,
            snapshot.docs.length
          );
        } else {
          if (doc.data().resolved) {
            const fullDate = timestampToDate(doc.data().date_started);
            renderDOM(
              fullDate,
              doc.data().resolved,
              doc.data().tries,
              doc.id,
              doc.data().word,
              snapshot.docs.length
            );
          } else {
            if (doc.data().tries >= 5) {
              const fullDate = timestampToDate(doc.data().date_started);
              renderDOM(
                fullDate,
                doc.data().resolved,
                doc.data().tries,
                doc.id,
                doc.data().word,
                snapshot.docs.length
              );
            } else {
              inGame = true;
            }
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Convert timestamp to date
  const timestampToDate = (timestamp) => {
    const MONTHS = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    let date = timestamp.toDate();
    date = `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
    return date;
  };

  const datesAreOnSameDay = (first, second) => {
    if (
      first.getFullYear() === second.getFullYear() &&
      first.getMonth() === second.getMonth() &&
      first.getDate() === second.getDate()
    ) {
      return true;
    } else {
      return false;
    }
  };

  // Render progress history into DOM
  const renderDOM = (date, resolved, tries, id, word, totalGames) => {
    let message = "";
    let boxElement = "";
    let elementClass = "";

    if (resolved) {
      message = messages.win;
      elementClass = "status-win";
    } else {
      message = messages.lose;
      elementClass = "status-lose";
    }

    if (inGame) {
      totalGames = totalGames - 1;
    }

    boxElement += `<div class="box box-${id} ${elementClass}">`;
    boxElement += `<h3>${date}</h3>`;
    boxElement += `<p>${message}</p>`;
    boxElement += `<div>Hints used: ${tries}</div>`;
    boxElement += `</div>`;

    document.querySelector(".total-games-counter").innerHTML = totalGames;
    document.querySelector(".history-wrapper__body").innerHTML += boxElement;
    setTimeout(() => {
      document.querySelector(".box-" + id).addEventListener("click", () => {
        showPopup(date, message, resolved, tries, word);
      });

      const shareTwitter = document.querySelector(".shareTwitter");
      shareTwitter.addEventListener("click", () => {
        var url = "https://demo.piccle.fun/";
        window.open(
          "https://twitter.com/intent/tweet?url=" +
            url +
            "&text=" +
            "I have scored " +
            points +
            " points."
        );
      });

      const shareFacebook = document.querySelector(".shareFacebook");
      shareFacebook.addEventListener("click", () => {
        var url = "https://demo.piccle.fun/";
        window.open(
          "http://www.facebook.com/sharer.php?u=" + url,
          "",
          "width=1200, height=630, scrollbars=yes, resizable=no"
        );
      });
    }, 100);
  };

  // Get word info
  const wordAndPoints = async (wordId) => {
    const wordRef = doc(db, "words", wordId);
    const snapshot = await getDoc(wordRef);
    const wordPoints = {
      word: snapshot.data().name,
      points: snapshot.data().points,
    };
    return wordPoints;
  };

  // Show popup
  const showPopup = async (date, message, resolved, tries, word) => {
    let popupElement = "";
    const wordpoints = await wordAndPoints(word);
    points = wordpoints.points;
    document
      .querySelector(".history-wrapper__popup-overlay")
      .classList.add("show");
    document.querySelector(".popup-message").classList.add("card");

    popupElement += `<h3>${date}</h3>`;
    popupElement += `<h3>${message}</h3>`;
    popupElement += `<table>`;
    popupElement += `<tr><th>Word of the day:</th><td>${wordpoints.word}</td></tr>`;
    if (resolved) {
      popupElement += `<tr><th>Points earned:</th><td>${wordpoints.points} Piccles</td></tr>`;
    }
    popupElement += `<tr><th>Solved with:</th><td>${tries} Hints</td></tr>`;
    popupElement += `</table>`;

    document.querySelector(".popup-content").innerHTML = popupElement;
  };

  // Close popup
  document
    .querySelector(".history-wrapper__popup-overlay .close-btn")
    .addEventListener("click", () => {
      document
        .querySelector(".history-wrapper__popup-overlay")
        .classList.remove("show");
    });

  // Monitor change of select dropdown
  document.querySelector(".filter").addEventListener("change", (e) => {
    if (e.target.value == "win") {
      showHideWL("lose");
    } else if (e.target.value == "lose") {
      showHideWL("win");
    } else {
      showHideWL();
    }
  });

  // Hide/Show wins/losses
  const showHideWL = (status) => {
    document.querySelectorAll(".box").forEach((box) => {
      box.classList.remove("hide");
    });
    if (status) {
      document.querySelectorAll(".status-" + status).forEach((box) => {
        box.classList.add("hide");
      });
    }
  };

  getProgress();

  document.getElementById("pageName").innerHTML = "History";
  document.getElementById("pageName").style.color = "#B470ED";
  document.querySelector('[href="#history"]').innerHTML =
    '<div style="background: #B470ED;" class="menu-icon"><img src="./../images/icons/fire-fill-w.svg" alt=""></div><span>History</span>';
}
