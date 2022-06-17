'use strict';

//setting up the Router with pages
Router.init('mainArea', [
  new Page('#home', 'pages/home.html', 'pages/js/home.js'), // 1st Page is default if no URL match
  new Page('#history', 'pages/history.html', 'pages/js/history.js'),
  new Page('#leaderboard', 'pages/leaderboard.html', 'pages/js/leaderboard.js'),
  new Page('#play', 'pages/play.html', 'pages/js/play.js'),
  new Page('#settings', 'pages/settings.html', 'pages/js/settings.js'),
  new Page('#shop', 'pages/shop.html', 'pages/js/shop.js')
]);
