var oldHref = document.location.href;

window.onload = function () {
  var bodyList = document.querySelector("body");

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (oldHref != document.location.href) {
        oldHref = document.location.href;
        let url = window.location.href;
        pageName = url.split("#")[1];
        // console.log(pageName);
        if (
          window.location.href == "http://127.0.0.1:5500/" ||
          window.location.href == "http://127.0.0.1:5500/#home" ||
          window.location.href == "https://demo.piccle.fun/" ||
          window.location.href == "https://demo.piccle.fun/#home" ||
          window.location.href == "https://dev.piccle.fun/" ||
          window.location.href == "https://dev.piccle.fun/#home" ||
          window.location.href == "https://demo.piccle.fun" ||
          window.location.href == "https://demo.piccle.fun/#home" ||
          pageName == "home" ||
          pageName == "signup" ||
          pageName == "signin"
        ) {
          document.getElementById("nav-bar").style.display = "none";
        } else {
          document.getElementById("nav-bar").style.display = "flex";
          document.getElementById("pageName").innerHTML = pageName;
          setNavBarIconColor();
          switch (pageName) {
            case "history":
              document.getElementById("pageName").style.color = "#B470ED";
              document.querySelector('[href="#history"]').innerHTML =
                '<div style="background: #B470ED;" class="menu-icon"><img src="./../images/icons/fire-fill-w.svg" alt=""></div><span>History</span>';
              break;
            case "play":
              document.getElementById("pageName").style.color = "#FF90E8";
              document.querySelector('[href="#play"]').innerHTML =
                '<div style="background: #FF90E8;" class="menu-icon"><img src="./../images/icons/camera-3-fill-w.svg" alt=""></div><span>Play</span>';
              break;
            case "leaderboard":
              document.getElementById("pageName").style.color = "#E76057";
              document.querySelector('[href="#leaderboard"]').innerHTML =
                '<div style="background: #E76057;" class="menu-icon"><img src="./../images/icons/trophy-fill-w.svg" alt=""></div><span>Leaderboard</span>';
              break;
            case "settings":
              document.getElementById("pageName").style.color = "#5C91F6";
              document.querySelector('[href="#settings"]').innerHTML =
                '<div style="background: #5C91F6;" class="menu-icon"><img src="./../images/icons/settings-white.svg" alt=""></div><span>Settings</span>';
              break;
            case "shop":
              document.getElementById("pageName").style.color = "#4EC887";
              document.querySelector('[href="#shop"]').innerHTML =
                '<div style="background: #4EC887;" class="menu-icon"><img src="./../images/icons/P-w.svg" alt=""></div><span>Shop</span>';
          }
        }
      }
    });
  });

  var config = {
    childList: true,
    subtree: true,
  };

  observer.observe(bodyList, config);
};

let menu = document.getElementById("menuBtn");
let closeBtn = document.getElementById("clsBtn");

menu.addEventListener("click", function () {
  document.getElementById("st-sidenavId").style.width = "100%";
});

closeBtn.addEventListener("click", function () {
  document.getElementById("st-sidenavId").style.width = "0%";
});

function updateSideMenuColor() {
  document.querySelectorAll('.st-main-menu li:not(:first-of-type)').forEach(liElem => {
    if (liElem.querySelector(`a[href="${window.location.hash}"]`)) {
      liElem.classList.add('main-menu-active');
    } else {
      liElem.classList.remove('main-menu-active');
    };
  })
}

updateSideMenuColor();

window.addEventListener("hashchange", () => {
  updateSideMenuColor();
})

document.querySelectorAll('.st-main-menu li:not(:first-of-type)').forEach(liElem => {
  liElem.querySelector('a').addEventListener('click', () => {
    document.getElementById("st-sidenavId").style.width = "0%";
  });
})

function setNavBarIconColor() {
  document.querySelector('[href="#history"]').innerHTML =
    '<div style="background: #fff;" class="menu-icon"><img src="./../images/icons/fire-fill.svg" alt=""></div><span>History</span>';
  document.querySelector('[href="#play"]').innerHTML =
    '<div style="background: #fff;" class="menu-icon"><img src="./../images/icons/camera-3-fill.svg" alt=""></div><span>Play</span>';
  document.querySelector('[href="#leaderboard"]').innerHTML =
    '<div style="background: #fff;" class="menu-icon"><img src="./../images/icons/trophy-fill.svg" alt=""></div><span>Leaderboard</span>';
  document.querySelector('[href="#settings"]').innerHTML =
    '<div style="background: #fff;" class="menu-icon"><img src="./../images/icons/settings.svg" alt=""></div><span>Settings</span>';
  document.querySelector('[href="#shop"]').innerHTML =
  '<div style="background: #fff;" class="menu-icon"><img src="./../images/icons/P.svg" alt=""></div><span>Shop</span>';
}

// Check internet status
const offlineOverlay = document.querySelector('.offline-overlay');

function showOfflineOverlay() {
  offlineOverlay.querySelector('.btn-primary')
  .addEventListener('click', e => {
    e.preventDefault();
    location.reload();
    // offlineOverlay.classList.add('persist-overlay');
  });
  offlineOverlay.classList.remove('offline-overlay-hide');
}

if (navigator.onLine) {
  console.log("online");
} else {
  console.log('offline');
  showOfflineOverlay();
}

window.addEventListener('offline', function(e) { 
  console.log('offline');
  showOfflineOverlay();
});
