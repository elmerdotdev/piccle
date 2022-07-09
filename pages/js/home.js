'use strict';

import { getFirestore, collection, query, where, 
    getDocs, getDoc, doc, orderBy, limit  } from 'https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore.js'

function init () {
    
    let loggedInUser = localStorage.getItem('piccleUID');
    let userPoints = null;
    let userHints = 5;
    let userCurrentGame = null;
    let userGameWord = null;
    const db = getFirestore();

    const userRef = collection(db, "users");
    const progressColRef = collection(db, "progress");
    const wordsColRef = collection(db, "words");
    const userDetails = query(userRef, where("user_email", "==", loggedInUser));
    const userRankQuery = query(userRef, orderBy("score", "desc"));
    const userProgress = query(progressColRef, where("user_email", "==", loggedInUser), orderBy("date_started", "desc"), limit(1));
    const userGames = query(progressColRef, where("user_email", "==", loggedInUser), orderBy("date_started", "desc"));
    
    getDocs(userRankQuery)
    .then(snapshot => {
        const emailList = [];
        snapshot.forEach(doc => {
            const userInfo = doc.data();
            emailList.push(userInfo.user_email);
            if (userInfo.user_email === loggedInUser) {
                userPoints = userInfo.points;
            };
        });
        const userRank = emailList.indexOf(loggedInUser);
        document.querySelector('.player-rank').innerHTML = ordinalSuffixOf(userRank);
        document.querySelector('.earned-points').innerHTML = userPoints;
    })
    .catch(err => {
        console.log(err.message);
    });

    getDocs(userProgress)
    .then(snapshot => {
        snapshot.forEach(docSnap => {
            userCurrentGame = docSnap.data();
            console.log(userCurrentGame.date_started.toDate());
            userHints = 5 - userCurrentGame.tries;
            userGameWord = userCurrentGame.word;

            document.querySelector('span.game-chance').innerHTML = userHints;

            const wordDocRef = doc(db, "words", userGameWord);
            getDoc(wordDocRef)
            .then(wordDoc => {
                const wordHints = wordDoc.data().hints;
                document.querySelector('span.game-hint').innerHTML = wordHints[userCurrentGame.tries];
            })
        });
    });

    getDocs(userGames)
    .then(snapshot => {
        document.querySelector('span.player-history').innerHTML = snapshot.size;
    })
    .catch(err => {
        console.log(err.message)
    })
    
    // getDocs(userDetails)
    // .then((snapshot) => {
        //     document.querySelector('.logged-in-user').innerHTML = `Hi ${snapshot.docs[0].data().firstname}!`
        // })
        
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
    
init();
    

