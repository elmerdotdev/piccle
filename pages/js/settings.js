export function init() {
  document.getElementById("pageName").innerHTML = "Settings";
  document.getElementById("pageName").style.color = "#5C91F6";
  document.querySelector('[href="#settings"]').innerHTML =
    '<div style="background: #5C91F6;" class="menu-icon"><img src="./../images/icons/settings-white.svg" alt=""></div><span>Settings</span>';

  document.querySelector(".st-card.sign-out").addEventListener("click", () => {
    removeUIDinBrowser();
    window.location.hash = "signin";
  });

  document.querySelector(".about-us").addEventListener("click", () => {
    window.location.hash = "aboutus";
  });

  document.querySelector(".account").addEventListener("click", () => {
    window.location.hash = "account";
  });
}

// Remove piccleUID from browser localStorage
function removeUIDinBrowser() {
  localStorage.removeItem("piccleUID");
}

const ntShow = document.querySelector(".show-nt");
debugger;
ntShow.addEventListener("click", () => {
  document.querySelector(".nt-popup-window").classList.add("show");
});

const ntHide = document.querySelector(".hide-nt");
ntHide.addEventListener("click", () => {
  document.querySelector(".nt-popup-window").classList.remove("show");
});
