var oldHref = document.location.href;

window.onload = function () {
  var bodyList = document.querySelector("body");

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (oldHref != document.location.href) {
        oldHref = document.location.href;
        let url = window.location.href;
        pageName = url.split("#")[1];
        console.log(pageName);
        if (
          window.location.href == "https://dev.piccle.fun/#home" ||
          pageName == "home" ||
          pageName == "signup" ||
          pageName == "signin"
        ) {
          document.getElementById("nav-bar").style.display = "none";
        } else {
          document.getElementById("nav-bar").style.display = "flex";
          document.getElementById("pageName").innerHTML = pageName;
          switch (pageName) {
            case "history":
              document.getElementById("pageName").style.color = "#B470ED";
              break;
            case "play":
              document.getElementById("pageName").style.color = "#FF90E8";
              break;
            case "leaderboard":
              document.getElementById("pageName").style.color = "#E76057";
              break;
            case "settings":
              document.getElementById("pageName").style.color = "#5C91F6";
              break;
            case "shop":
              document.getElementById("pageName").style.color = "#4EC887";
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
