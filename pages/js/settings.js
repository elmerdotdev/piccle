let menu = document.getElementById("menuBtn");
let closeBtn = document.getElementById("clsBtn");

menu.addEventListener("click", function () {
  document.getElementById("st-sidenavId").style.width = "100%";
});

closeBtn.addEventListener("click", function () {
  document.getElementById("st-sidenavId").style.width = "0%";
});

document.querySelector('.signout-btn').addEventListener('click', () => {
  removeUIDinBrowser();
  window.location.hash = 'signin';
});

// Remove piccleUID from browser localStorage
function removeUIDinBrowser () {
  localStorage.removeItem('piccleUID');
};

