document.getElementById("pageName").innerHTML = "Settings";
document.getElementById("pageName").style.color = "#5C91F6";
document.querySelector('[href="#settings"]').innerHTML =
  '<div style="background: #5C91F6;" class="menu-icon"><img src="./../images/icons/settings-white.svg" alt=""></div><span>Settings</span>';

let menu = document.getElementById("menuBtn");
let closeBtn = document.getElementById("clsBtn");

menu.addEventListener("click", function () {
  document.getElementById("st-sidenavId").style.width = "100%";
});

closeBtn.addEventListener("click", function () {
  document.getElementById("st-sidenavId").style.width = "0%";
});

document.querySelector(".sign-out").addEventListener("click", () => {
  removeUIDinBrowser();
  window.location.hash = "signin";
});

document.querySelector(".about-us").addEventListener("click", () => {
  removeUIDinBrowser();
  window.location.hash = "aboutus";
});

// Remove piccleUID from browser localStorage
function removeUIDinBrowser() {
  localStorage.removeItem("piccleUID");
}
