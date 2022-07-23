let menu = document.getElementById("menuBtn");
let closeBtn = document.getElementById("clsBtn");

menu.addEventListener("click", function () {
  document.getElementById("st-sidenavId").style.width = "100%";
});

closeBtn.addEventListener("click", function () {
  document.getElementById("st-sidenavId").style.width = "0%";
});

document.querySelector(".st-card.sign-out").addEventListener("click", () => {
  removeUIDinBrowser();
  window.location.hash = "signin";
});

document.querySelector(".st-card.account").addEventListener("click", () => {
  window.location.hash = "account";
});

// Remove piccleUID from browser localStorage
function removeUIDinBrowser() {
  localStorage.removeItem("piccleUID");
}
