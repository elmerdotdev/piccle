"use strict";

import {
    getFirestore,
    collection,
    query,
    where,
    orderBy,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore.js";

function init() {
    // If not logged in, redirect to login page
    const userEmail = localStorage.getItem('piccleUID')
    if (!userEmail) {
        location.hash = "#signin"
    }

    // Connect to Firebase
    const db = getFirestore()

    // Build shop page
    const renderShop = async (email) => {
        const shopItems = await getShopItems()
        const availablePoints = await getAvailablePoints(email)
        const purchases = await getPurchases(email)

        document.querySelector('.points-available').innerHTML = availablePoints
        document.querySelector('.items-available').innerHTML = ""
        document.querySelector('.items-purchased').innerHTML = ""

        shopItems.forEach(item => {
            let element = ""
            element += `<div class="shop_item item-${item.id}">`
            element += `<div class="item-name">${item.data().name}</div>`
            element += `<div class="item-price">${item.data().price}</div>`
            element += `</div>`
            document.querySelector('.items-available').innerHTML += element
            setTimeout(function() {
                document.querySelector(`.item-${item.id}`).addEventListener('click', () => {
                    showPopup(email, item.id)
                })
            }, 100)
        })

        purchases.forEach(item => {
            const itemRef = doc(db, "shop", item.data().item)
            getDoc(itemRef).then((doc) => {
                let element = ""
                element += `<div class="shop_item item-${item.id}">`
                element += `<div class="item-name">${doc.data().name}</div>`
                element += `<div class="item-desc">${doc.data().desc}</div>`
                element += `<div class="item-price">${item.data().cost}</div>`
                element += `</div>`
                document.querySelector('.items-purchased').innerHTML += element
            })
        })
    }

    /* BUTTON FUNCTIONS ========================================= */
    const showPopup = (email, itemID) => {
        document.querySelector('.shop-wrapper__overlay').classList.add('show')
    }

    const closePopup = (rebuildShop) => {
        document.querySelector('.shop-wrapper__overlay').classList.remove('show')
    }


    /* END BUTTON FUNCTIONS ========================================= */


    /* QUERY FUNCTIONS ========================================= */
    // Get user points
    const getAvailablePoints = async (email) => {
        const userRef = doc(db, "users", email)
        const snapshot = await getDoc(userRef)

        return snapshot.data().points
    }

    // Get shop items
    const getShopItems = async () => {
        const shopRef = collection(db, "shop")
        const shopQuery = query(shopRef)
        const snapshot = await getDocs(shopQuery)

        try {
            return snapshot.docs
        } catch(error) {
            console.log(error)
        }
    }

    // Get specific shop item
    const getSpecificItem = async (itemId) => {
        const itemRef = doc(db, "shop", itemId)
        const snapshot = await getDoc(itemRef)

        try {
            return snapshot
        } catch(error) {
            console.log(error)
        }
    }

    // Get purchases
    const getPurchases = async (email) => {
        const purchasesRef = collection(db, "purchases")
        const purchasesQuery = query(
            purchasesRef,
            where("user_email", "==", email)
        )
        const snapshot = await getDocs(purchasesQuery)

        try {
            return snapshot.docs
        } catch(error) {
            console.log(error)
        }
    }
    /*  END QUERY FUNCTIONS ========================================= */


    renderShop(userEmail)

}

init()