"use strict";

import { db } from "../../firebase.js"

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  Timestamp,
} from "../../firebase-lib/firebase-firestore.js";

export function init () {
  // If not logged in, redirect to login page
  const userEmail = localStorage.getItem("piccleUID");
  if (!userEmail) {
    location.hash = "#signin";
  }

  // Build shop page
  const renderShop = async (email) => {
    const shopItems = await getShopItems();
    const availablePoints = await getAvailablePoints(email);
    const purchases = await getPurchases(email);

    document.querySelector(".points-available").innerHTML = availablePoints;
    document.querySelector(".items-available").innerHTML = "";
    document.querySelector(".items-purchased").innerHTML = "";

    shopItems.forEach((item) => {
      let element = "";
      element += `<div class="shop_item item-${item.id}">`;
      element += `<button type="button" class="btn btn-icon round"><img src="./../images/icons/star.svg" /></button>`;
      element += `<div class="item-name">${item.data().name}</div>`;
      element += `<div class="shop_item__point_wrapper"><button type="button" class="btn btn-icon round"><img src="./../images/icons/P.svg" /></button><div class="item-price">${
        item.data().price
      }</div>`;
      element += `</div>`;
      document.querySelector(".items-available").innerHTML += element;
      setTimeout(function () {
        document
          .querySelector(`.item-${item.id}`)
          .addEventListener("click", () => {
            showPopup(item.id, item.data().name, item.data().price);
          });
      }, 100);
    });

    purchases.forEach((item) => {
      const itemRef = doc(db, "shop", item.data().item);
      getDoc(itemRef).then((doc) => {
        let element = "";
        element += `<div class="shop_item item-${item.id}">`;
        element += `<div class="item-name">${doc.data().name}</div>`;
        element += `<div class="item-desc">${doc.data().desc}</div>`;
        element += `<div class="item-price">${item.data().cost}</div>`;
        element += `</div>`;
        document.querySelector(".items-purchased").innerHTML += element;
      });
    });
  };

  /* BUTTON FUNCTIONS ========================================= */
  // Open popup
  const showPopup = (itemId, name, price) => {
    let element = "";
    element += `<div class="item-name">${name}</div>`;
    element += `<div class="point-wrapper"><button type="button" class="btn btn-icon round"><img src="./../images/icons/star.svg"></button><div class="item-price">${price}</div></div>`;
    document.querySelector(".popup-content").innerHTML = element;

    document.querySelector(".popup-purchase").setAttribute("item-id", itemId);
    document.querySelector(".shop-wrapper__overlay").classList.add("show");
  };

  // Purchase Successful Popup
  const successPopup = (name, price) => {
    document.querySelector(".popup-title").innerHTML = `Purchase Successful`;
    document.querySelector(".popup-cancel").innerHTML = `Close`;
    document.querySelector(".popup-purchase").classList.remove("show");
  };

  // Close popup
  document.querySelector(".popup-cancel").addEventListener("click", () => {
    document.querySelector(".popup-title").innerHTML = `Purchase Verification`;
    document.querySelector(".popup-cancel").innerHTML = `Cancel`;
    document.querySelector(".popup-purchase").classList.add("show");
    document.querySelector(".shop-wrapper__overlay").classList.remove("show");
  });

  // Purchase button
  document
    .querySelector(".popup-purchase")
    .addEventListener("click", function () {
      updateUser(this.getAttribute("item-id"), userEmail);
    });
  /* END BUTTON FUNCTIONS ========================================= */

  /* QUERY FUNCTIONS ========================================= */
  // Get user points
  const getAvailablePoints = async (email) => {
    const userRef = doc(db, "users", email);
    const snapshot = await getDoc(userRef);
    return snapshot.data().points;
  };

  // Update user doc
  const updateUser = async (itemId, email) => {
    const userRef = doc(db, "users", email);
    const currentPoints = await getAvailablePoints(email);
    const item = await getSpecificItem(itemId);

    if (currentPoints >= item.data().price) {
      await updateDoc(userRef, {
        points: currentPoints - item.data().price,
      });

      await addDoc(collection(db, "purchases"), {
        cost: item.data().price,
        date_purchased: Timestamp.fromDate(new Date()),
        item: itemId,
        used: false,
        user_email: email,
      });

      renderShop(userEmail);
      successPopup(item.data().name, item.data().price);
    } else {
      alert("You do not have enough points to purchase!");
    }
  };

  // Get shop items
  const getShopItems = async () => {
    const shopRef = collection(db, "shop");
    const shopQuery = query(shopRef);
    const snapshot = await getDocs(shopQuery);
    return snapshot.docs;
  };

  // Get specific shop item
  const getSpecificItem = async (itemId) => {
    const itemRef = doc(db, "shop", itemId);
    const snapshot = await getDoc(itemRef);
    return snapshot;
  };

  // Get purchases
  const getPurchases = async (email) => {
    const purchasesRef = collection(db, "purchases");
    const purchasesQuery = query(
      purchasesRef,
      where("user_email", "==", email)
    );
    const snapshot = await getDocs(purchasesQuery);
    return snapshot.docs;
  };
  /*  END QUERY FUNCTIONS ========================================= */

  renderShop(userEmail);
}
