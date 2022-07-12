"use strict";

Router.init("mainArea", [
  new Page(
    "#signin",
    "pages/signin.html",
    "pages/js/signin.js",
    "pages/css/signin.css"
  ),
  new Page(
    "#signup",
    "pages/signup.html",
    "pages/js/signup.js",
    "pages/css/signup.css"
  ),
  new Page("#testpage", "pages/test.html"),
  new Page(
    "#home",
    "pages/home.html",
    "pages/js/home.js",
    "pages/css/home.css"
  ),
  new Page(
    "#history",
    "pages/history.html",
    "pages/js/history.js",
    "pages/css/history.css"
  ),
  new Page(
    "#leaderboard",
    "pages/leaderboard.html",
    "pages/js/leaderboard.js",
    "pages/css/leaderboard.css"
  ),
  new Page(
    "#play",
    "pages/play.html",
    "pages/js/play.js",
    "pages/css/play.css"
  ),
  new Page(
    "#component",
    "pages/component.html",
    "pages/js/component.js",
    "pages/css/component.css"
  ),
  new Page(
    "#settings",
    "pages/settings.html",
    "pages/js/settings.js",
    "pages/css/settings.css"
  ),
  new Page(
    "#shop",
    "pages/shop.html",
    "pages/js/shop.js",
    "pages/css/shop.css"
  ),
]);
