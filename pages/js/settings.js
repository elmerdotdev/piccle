let menu = document.getElementById("menuBtn");
let closeBtn = document.getElementById("clsBtn");

menu.addEventListener("click", function () {
  document.getElementById("st-sidenavId").style.width = "100%";
});

closeBtn.addEventListener("click", function () {
  document.getElementById("st-sidenavId").style.width = "0%";
});
