"use strict";

import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDoc,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore.js";
import Vision from "../../vision.js";



function init() {
  const userEmail = localStorage.getItem("piccleUID");
  if (!userEmail) {
    location.hash = "#signin"
  }

  let currentHint = [];
  let currentWord = "";
  let wordPoints = 0;
  let wordId = "";
  let progressId = "";
  let usedTries = 0;
  let userScore = 0;
  let userPoints = 0;

  const db = getFirestore();

  // Get User Details
  const userRef = collection(db, "users");
  const userDetails = query(userRef, where("user_email", "==", userEmail));

  getDocs(userDetails)
  .then((snapshot) => {
    userScore = snapshot.docs[0].data().score;
    userPoints = snapshot.docs[0].data().points;
  })

  // Get all words in database
  const wordsRef = collection(db, "words");
  const allWords = query(wordsRef);

  // Get User Progress
  const progressRef = collection(db, "progress");
  const userProgress = query(
    progressRef,
    where("user_email", "==", userEmail),
    orderBy("date_started", "desc")
  );

  getDocs(userProgress)
    .then((snapshot) => {
      // user progress found
      let allProgress = snapshot.docs;
      let recentProgress = allProgress[0];
      let dateStarted = new Date(
        recentProgress.data().date_started.seconds * 1000
      );

      if (recentProgress.data().resolved === false) {
        if (datesAreOnSameDay(dateStarted, new Date())) {
          if (recentProgress.data().tries < 5) {
            getWordAndHint(
              recentProgress.data().word,
              recentProgress.data().tries
            );
            progressId = recentProgress.id;
            usedTries = recentProgress.data().tries + 1;
          } else {
            noMoreTries();
          }
        } else {
          createProgress(allProgress);
        }
      } else {
        if (datesAreOnSameDay(dateStarted, new Date())) {
          challengeCompleteWaitTomorrow();
        } else {
          createProgress(allProgress);
        }
      }
    })
    .catch((error) => {
      console.log(error.message);
      // no user progress found
      // Get all words and choose one randomly
      getDocs(allWords).then((snapshot) => {
        let randomWord =
          snapshot.docs[Math.floor(Math.random() * snapshot.docs.length)].id;

        addNewProgress(randomWord);
      });
    });

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

  // get word and hint
  function getWordAndHint(word, tries) {
    const docRef = doc(db, "words", word);
    getDoc(docRef).then((doc) => {
      currentWord = doc.data().name;
      currentHint = doc.data().hints[tries];
      wordId = doc.id;
      wordPoints = doc.data().points;

      document.querySelector(".play-wrapper__hint").innerHTML = currentHint;
      document
        .querySelectorAll(".play-wrapper__numbers li")
        [tries].classList.add("current-hint");

        for (let i = 0; i < tries; i++) {
          document.querySelectorAll(".play-wrapper__numbers li")[i].classList.add("used-hint")
        }
    });
  }

  // generate a new challenge
  function createProgress(allProgress) {
    let wordPool = [];
    let listOfWords = [];
    let finishedWords = [];
    let chosenWord = "";

    allProgress.forEach((doc) => {
      finishedWords.push(doc.data().word);
    });

    getDocs(allWords).then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        listOfWords.push(doc.id);
      });

      wordPool = listOfWords.filter((val) => !finishedWords.includes(val));
      chosenWord = wordPool[Math.floor(Math.random() * wordPool.length)];

      addNewProgress(chosenWord);
    });
  }

  // add the new word to firebase progress
  async function addNewProgress(whatstheword) {
    await addDoc(collection(db, "progress"), {
      date_completed: "",
      date_started: Timestamp.fromDate(new Date()),
      resolved: false,
      tries: 0,
      user_email: userEmail,
      word: whatstheword,
    });

    location.reload();
  }

  function challengeCompleteWaitTomorrow() {
    alert(`you have completed today's challenge. come back tomorrow`);
    location.hash = "#home";
  }

  function noMoreTries() {
    alert(`you ran out of chances`);
    location.hash = "#home";
  }

  async function updateTries() {
    const currentProgressRef = doc(db, "progress", progressId);
    await updateDoc(currentProgressRef, {
      tries: usedTries,
    });
  }

  async function answerCorrect(theword, image) {
    const currentProgressRef = doc(db, "progress", progressId);
    await updateDoc(currentProgressRef, {
      date_completed: Timestamp.fromDate(new Date()),
      resolved: true,
      tries: usedTries,
    });

    const currentUserRef = doc(db, "users", userEmail);
    await updateDoc(currentUserRef, {
      points: (Number(userPoints) + Number(wordPoints)),
      score: (Number(userScore) + Number(wordPoints))
    });

    webcam.stop();
    let domContent = `<h2 class="results-success-title">Congratulations!</h2>`
    domContent += `<div class="results-inner">`
    domContent += `<div class="statistics"><h2>Statistics</h2>`
    domContent += `<table><tr><th>Points Earned</th><td><strong>${wordPoints} Piccles</strong></td></tr></table>`
    domContent += `</div>`
    domContent += `<div class="results-details">`
    domContent += `<h2><span>&ldquo;${theword}&rdquo;</span> <span>is the correct answer!</span></h2>`;
    domContent += `<div class="results-trivia"><strong>Did you know?</strong><p>${currentHint}</p></div>`
    domContent += `<div class="results-img"><img src="${image}" /></div>`;
    domContent += `</div>`
    domContent += `</div>`
    domContent += `<div class="home-btn"><button class="btn btn-primary"><a href="index.html#home">Home</a></button></div>`;
    document.querySelector(".results-wrapper").innerHTML = domContent;

    document.querySelector(".wrapper").classList.add('correct-answer');
    setTimeout(() => {
      document.querySelector('.results-success-title').classList.add('bounceMe')
    }, 300)
  }

  // Camera functions ==========================

  const webcamElement = document.getElementById("webcam");
  const canvasElement = document.getElementById("canvas");
  const webcam = new Webcam(webcamElement, "environment", canvasElement);
  let base64Image = "";

  webcam
    .start()
    .then((result) => {
      if (location.hash == "#play") {
        console.log("webcam started");
      } else {
        webcam.stop();
      }
    })
    .catch((err) => {
      console.log(err);
    });

  async function waitForVisionResponse(nonStrippedImage, strippedImage) {
    let vision = new Vision(strippedImage);
    let results = await vision.cloudVision();

    console.log(currentWord);
    console.log(results);

    if (results.includes(currentWord.toLowerCase())) {
      answerCorrect(currentWord, nonStrippedImage);
    } else {
      let domContent = "<h2>Try Again!</h2>";
      domContent += `<svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M90 9.06428L80.9357 0L45 35.9357L9.06428 0L0 9.06428L35.9357 45L0 80.9357L9.06428 90L45 54.0643L80.9357 90L90 80.9357L54.0643 45L90 9.06428Z" fill="#E76057"/>
      </svg>`;
      domContent += `<p>Sorry that is incorrect. You have ${
        5 - usedTries
      } tries remaining.</p>`;
      domContent += `<hr><button class="btn btn-primary"><a href="#play" class="next-clue-btn">Next Clue</a></button>`;
      document.querySelector(".popup-window").innerHTML = domContent;

      setTimeout(() => {
        document.querySelector('.next-clue-btn').addEventListener('click', () => {
          location.reload()
        })
      }, 100)

      document.querySelector('.play-wrapper_progress_bar').classList.add("fade");
      document.querySelector('.play-wrapper_card').classList.add("fade");
      document.querySelector(".popup-window").classList.add("show");
    }
    updateTries();
  }

  document.querySelector(".upload-btn").addEventListener("click", () => {
    document.querySelector("#uploader").click();
  });

  document.querySelector("#uploader").addEventListener("change", () => {
    let reader = new FileReader();
    if (document.querySelector("#uploader").files[0]) {
      reader.readAsDataURL(document.querySelector("#uploader").files[0]);
      reader.onload = function () {
        base64Image = reader.result;
        document
          .querySelector("#previewImage")
          .setAttribute("src", base64Image);
        document.querySelector("#previewImage").style.zIndex = 2;
        document.querySelector(".camera-btn").style.display = "inline";
        document.querySelector(".capture-btn").style.display = "none";
        webcam.stop();
      };
      reader.onerror = function (error) {
        console.log("Error: ", error);
      };
    }
  });

  document.querySelector(".camera-btn").addEventListener("click", () => {
    document.querySelector("#previewImage").style.zIndex = 0;
    webcam.start().then((result) => {
      document.querySelector(".camera-btn").style.display = "none";
      document.querySelector(".capture-btn").style.display = "inline";
    });
  });

  document.querySelector(".capture-btn").addEventListener("click", () => {
    base64Image = webcam.snap();
    document.querySelector("#previewImage").setAttribute("src", base64Image);
    document.querySelector("#previewImage").style.zIndex = 2;
    document.querySelector(".camera-btn").style.display = "inline";
    document.querySelector(".capture-btn").style.display = "none";
    webcam.stop();
  });

  document.querySelector(".delete-btn").addEventListener("click", () => {
    webcam.start();
    document.querySelector("#previewImage").style.zIndex = 0;
    document.querySelector(".camera-btn").style.display = "none";
    document.querySelector(".capture-btn").style.display = "inline";
    base64Image = "";
  });

  document.querySelector(".submit-btn").addEventListener("click", () => {
    if (base64Image != "") {
      let strippedBase64Image = base64Image.replace(
        "data:image/jpeg;base64,",
        ""
      );
      strippedBase64Image = strippedBase64Image.replace(
        "data:image/jpg;base64,",
        ""
      );
      strippedBase64Image = strippedBase64Image.replace(
        "data:image/png;base64,",
        ""
      );
      strippedBase64Image = strippedBase64Image.replace(
        "data:image/gif;base64,",
        ""
      );

      waitForVisionResponse(base64Image, strippedBase64Image);
    } else {
      alert("need photo");
    }
  });

  document.querySelectorAll('.main-menu li a').forEach(link => {
    link.addEventListener('click', () => {
      if (link.getAttribute('href') != "#play") {
        webcam.stop()
      }
    })
  })
}

init();
