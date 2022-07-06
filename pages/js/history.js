"use strict";

import {
    getFirestore,
    collection,
    query,
    where,
    orderBy,
    getDocs
} from "https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore.js";

function init() {
    
    // If not logged in, redirect to login page
    const userEmail = localStorage.getItem('piccleUID')
    if (!userEmail) {
        location.hash = "#signin"
    }

    // Messages
    const messages = {
        win: 'You won the game',
        lose: 'Try again next time'
    }

    // Connect to Firebase
    const db = getFirestore();

    // Get list of progress
    const getProgress = async (filter) => {
        const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        let progressQuery = ""

        const progressRef = collection(db, "progress");

        if (filter != undefined) {
            progressQuery = query(
                progressRef,
                where("user_email", "==", userEmail),
                where("resolved", "==", filter),
                orderBy("date_started", "desc")
            )
        } else {
            progressQuery = query(
                progressRef,
                where("user_email", "==", userEmail),
                orderBy("date_started", "desc")
            )
        }

        const snapshot = await getDocs(progressQuery)
        try {
            snapshot.forEach((doc) => {
                const date = doc.data().date_started.toDate()
                const fullDate = `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
                renderDOM(fullDate, doc.data().resolved, doc.data().tries)
            })
        } catch (error) {
            alert(error)
        }
    }

    const renderDOM = (date, resolved, tries) => {
        let message = ""
        let element = ""

        if (resolved) {
            message = messages.win
        } else {
            message = messages.lose
        }

        element += `<div class="entry-score">` 
        element += `<h3>${date}</h3>`
        element += `<p>${message}</p>`
        element += `<div>Hints used: ${tries}</div>`
        element += `</div>`

        document.querySelector('.history-wrapper__body').innerHTML += element
    }

    document.querySelector('.filter').addEventListener('change', (e) => {
        document.querySelector('.history-wrapper__body').innerHTML = ""
        if (e.target.value == "win") {
            getProgress(true)
        } else if (e.target.value == "lose") {
            getProgress(false)
        } else {
            getProgress(undefined)
        }
    })

    getProgress()

}
init()