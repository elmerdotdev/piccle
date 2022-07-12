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
} from "https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore.js"
import Vision from "../../vision.js"

function init() {
  // check if user logged in
  const userEmail = localStorage.getItem("piccleUID")

  if (!userEmail) {
      location.hash = "#signin"
  }

  const currentWord = {
      id: "",
      name: "",
      currentHint: "",
      points: 0
  }

  const player = {
      score: 0,
      points: 0,
      currentProgress: {
          id: "",
          usedTries: 0
      }
  }

  const camera = {
    status: "",
    webcamElement: document.getElementById("webcam"),
    canvasElement: document.getElementById("canvas"),
    webcam: "",
    base64Image: ""
  }

  // Connect to Firebase
  const db = getFirestore()

  // Render play screen
  const renderDOM = async () => {
    await initializeCamera()
    await getUser()
    await getUserProgress()
  }

  // Get user score and points
  const getUser = async () => {        
    const ref = doc(db, "users", userEmail)
    const snapshot = await getDoc(ref)
    player.score = snapshot.data().score
    player.points = snapshot.data().points
  }

  // Get recent user progress
  const getUserProgress = async () => {
    const ref = collection(db, "progress")
    const progressQuery = query(
      ref,
      where("user_email", "==", userEmail),
      orderBy("date_started", "desc")
    )
    const snapshot = await getDocs(progressQuery)

    try {
      const recent = snapshot.docs[0]
      const dateStarted = new Date(recent.data().date_started.seconds * 1000)

      if (recent.data().resolved === false) {
        // if recent challenge is not resolved
        if (datesAreOnSameDay(dateStarted, new Date())) {
          // if same day, check if user has remaining tries
          if (recent.data().tries < 5) {
            player.currentProgress.id = recent.id
            player.currentProgress.usedTries = recent.data().tries + 1
            
            await getWordAndHint(recent.data().word, recent.data().tries)
            
            document.querySelector(".play-wrapper__hint").innerHTML = currentWord.currentHint
            document.querySelectorAll(".play-wrapper__numbers li")[recent.data().tries].classList.add("current-hint")
            
            for (let i = 0; i < recent.data().tries; i++) {
              document.querySelectorAll(".play-wrapper__numbers li")[i].classList.remove("current-hint")
              document.querySelectorAll(".play-wrapper__numbers li")[i].classList.add("used-hint")
            }
          } else {
            noMoreTries()
          }
        } else {
          // if not on same day, create new progress
          createNewChallenge(snapshot.docs)
        }
      } else {
        // if recent challenge is resolved
        if (datesAreOnSameDay(dateStarted, new Date())) {
          // challenge complete wait for next day
          challengeCompleteWaitTomorrow()
        } else {
          // create new challenge
          createNewChallenge(snapshot.docs)
        }
      }

    } catch (error) {
      // No user progress found, create progress
      console.log(error.message)
      const snapshot = await getAllWords()
      const randomWord = snapshot.docs[Math.floor(Math.random() * snapshot.docs.length)].id;
      addNewProgress(randomWord)
    }
  }
  
  // Get all words from Firebase
  const getAllWords = async () => {
    const ref = collection(db, "words")
    const wordsQuery = query(ref)
    const snapshot = await getDocs(wordsQuery)
    return snapshot
  }

  // Compare two dates if same day
  const datesAreOnSameDay = (first, second) => {
    if ( first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth() && first.getDate() === second.getDate()) {
        return true
    } else {
        return false
    }
  }

  // Get word and hint
  const getWordAndHint = async (recentWord, tries) => {
    const ref = doc(db, "words", recentWord)
    const snapshot = await getDoc(ref)
    currentWord.id = snapshot.id
    currentWord.name = snapshot.data().name
    currentWord.currentHint = snapshot.data().hints[tries]
    currentWord.points = snapshot.data().points
  }

  // No more tries
  const noMoreTries = () => {
    let domContent = "<h2>You have no more tries!</h2>"
    domContent += `<svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M90 9.06428L80.9357 0L45 35.9357L9.06428 0L0 9.06428L35.9357 45L0 80.9357L9.06428 90L45 54.0643L80.9357 90L90 80.9357L54.0643 45L90 9.06428Z" fill="#E76057"/>
    </svg>`;
    domContent += `<p>Oops you ran out of chances.</p>`
    domContent += `<hr><button class="btn btn-primary"><a href="#home" class="close-btn">Close</a></button>`
    document.querySelector(".popup-window").innerHTML = domContent
    document.querySelector(".popup-window").classList.add("show")
    setTimeout(() => {
      document.querySelector('.close-btn').addEventListener('click', () => {
        if (camera.status) {
          camera.webcam.stop()
        }
        location.hash = "#home"
      })
    }, 100)
  }

  // Wait for tomorrow's challenge
  const challengeCompleteWaitTomorrow = () => {
    alert(`you have completed today's challenge. come back tomorrow`)
    location.hash = "#home"
  }

  // generate a new challenge
  const createNewChallenge = async (allProgress) => {
    let wordPool = []
    const allWords = []
    const finishedWords = []
    let chosenWord = ""
    const snapshot = await getAllWords()
    try {
      allProgress.forEach((progress) => {
        finishedWords.push(progress.data().word)
      })

      snapshot.docs.forEach((doc) => {
        allWords.push(doc.id);
      })

      wordPool = allWords.filter((val) => !finishedWords.includes(val))
      chosenWord = wordPool[Math.floor(Math.random() * wordPool.length)]

      addNewProgress(chosenWord)
    } catch (error) {
      console.log(error.message)
    }
  }

  // Add the new word to firebase progress
  const addNewProgress = async (whatstheword) => {
    await addDoc(collection(db, "progress"), {
      date_completed: "",
      date_started: Timestamp.fromDate(new Date()),
      resolved: false,
      tries: 0,
      user_email: userEmail,
      word: whatstheword,
    });

    renderDOM()
  }

  // Update progress tries
  const updateTries = async () => {
    const ref = doc(db, "progress", player.currentProgress.id)
    await updateDoc(ref, {
      tries: player.currentProgress.usedTries,
    })
  }

  // Correct answer
  const answerCorrect = async (theword, image) => {
    const currentProgressRef = doc(db, "progress", player.currentProgress.id);
    await updateDoc(currentProgressRef, {
      date_completed: Timestamp.fromDate(new Date()),
      resolved: true,
      tries: player.currentProgress.usedTries
    })

    const currentUserRef = doc(db, "users", userEmail)
    await updateDoc(currentUserRef, {
      points: (Number(player.points) + Number(currentWord.points)),
      score: (Number(player.score) + Number(currentWord.points))
    })

    camera.webcam.stop()

    let domContent = `<h2>&ldquo;${theword}&rdquo; <span>is the correct answer!</span></h2>`
    domContent += `<div><img src="${image}" /></div>`
    domContent += `<a href="index.html#home">Home</a>`
    document.querySelector(".results-wrapper").innerHTML = domContent

    document.querySelector(".results-wrapper").classList.add("show")
    document.querySelector(".play-wrapper").classList.remove("show")
  }

  // Incorrect answer
  const answerIncorrect = () => {
    let domContent = "<h2>Try Again!</h2>"
    domContent += `<svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M90 9.06428L80.9357 0L45 35.9357L9.06428 0L0 9.06428L35.9357 45L0 80.9357L9.06428 90L45 54.0643L80.9357 90L90 80.9357L54.0643 45L90 9.06428Z" fill="#E76057"/>
    </svg>`;
    domContent += `<p>Sorry that is incorrect. You have ${
      5 - player.currentProgress.usedTries
    } tries remaining.</p>`
    domContent += `<hr><button class="btn btn-primary"><a href="#play" class="next-clue-btn">Next Clue</a></button>`
    document.querySelector(".popup-window").innerHTML = domContent

    setTimeout(() => {
      document.querySelector('.next-clue-btn').addEventListener('click', () => {
        resetCamera()
        renderDOM()
        document.querySelector(".popup-window").classList.remove("show")
      })
    }, 100)
    document.querySelector(".popup-window").classList.add("show")
  }

  /* CAMERA ===================================== */
  const initializeCamera = async () => {
    camera.webcamElement = document.getElementById("webcam")
    camera.canvasElement = document.getElementById("canvas")
    camera.webcam = new Webcam(camera.webcamElement, "environment", camera.canvasElement)

    camera.status = await camera.webcam.start()
    try {
      if (location.hash == "#play") {
        console.log("webcam started")
      } else {
        camera.webcam.stop()
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  // Check if word is in vision results
  const waitForVisionResponse = async (nonStrippedImage, strippedImage) => {
    let vision = new Vision(strippedImage)
    let results = await vision.cloudVision()

    console.log(currentWord.id)
    console.log(results)

    if (results.includes(currentWord.id.toLowerCase())) {
      answerCorrect(currentWord.id, nonStrippedImage)
    } else {
      answerIncorrect()
    }
    updateTries()
  }

  // Trigger file uploader click
  document.querySelector(".upload-btn").addEventListener("click", () => {
    document.querySelector("#uploader").click()
  })

  // Get uploaded file and store base64 value
  document.querySelector("#uploader").addEventListener("change", () => {
    let reader = new FileReader()
    if (document.querySelector("#uploader").files[0]) {
      reader.readAsDataURL(document.querySelector("#uploader").files[0])
      reader.onload = function () {
        camera.base64Image = reader.result

        document
          .querySelector("#previewImage")
          .setAttribute("src", camera.base64Image)
        document.querySelector("#previewImage").style.zIndex = 2
        document.querySelector(".camera-btn").style.display = "inline"
        document.querySelector(".capture-btn").style.display = "none"

        camera.webcam.stop()
      }
      reader.onerror = function (error) {
        console.log("Error: ", error)
      }
    }
  })

  // Activate camera mode
  document.querySelector(".camera-btn").addEventListener("click", () => {
    resetCamera()
  })

  // Capture photo from webcam
  document.querySelector(".capture-btn").addEventListener("click", () => {
    camera.base64Image = camera.webcam.snap()
    document.querySelector("#previewImage").setAttribute("src", camera.base64Image)
    document.querySelector("#previewImage").style.zIndex = 2
    document.querySelector(".camera-btn").style.display = "inline"
    document.querySelector(".capture-btn").style.display = "none"
    camera.webcam.stop()
  })

  // Delete button
  document.querySelector(".delete-btn").addEventListener("click", () => {
    resetCamera()
    camera.base64Image = ""
  })

  // Reset camera
  const resetCamera = async () => {
    document.querySelector("#previewImage").style.zIndex = 0
    camera.status = await camera.webcam.start()
    try {
      document.querySelector(".camera-btn").style.display = "none"
      document.querySelector(".capture-btn").style.display = "inline"
    } catch(error) {
      console.log(error.message)
    }
  }

  // Submit image to Vision
  document.querySelector(".submit-btn").addEventListener("click", () => {
    if (camera.base64Image != "") {
      let strippedBase64Image = camera.base64Image.replace(
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

      waitForVisionResponse(camera.base64Image, strippedBase64Image);
    } else {
      alert("need photo");
    }
  });

  renderDOM()
}

init()