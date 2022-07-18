if ("serviceWorker" in navigator) {
  navigator.serviceWorker.ready.then((reg) => {
    console.log(`Service Worker ready (Scope: ${reg.scope})`);
  });
  navigator.serviceWorker
    .register("./sw.js", { scope: "/" })
    .then(function (reg) {
      console.log(`Service Worker Registration (Scope: ${reg.scope})`);
    })
    .catch(function (error) {
      console.log(`Service Worker Error (${error})`);
    });
  navigator.serviceWorker
    .register("./firebase-messaging-sw.js", { scope: "/"})
    .then(reg => {
      console.log(`Firebase Messaging Service Worker Registration (Scope: ${reg.scope})`);
    })
    .catch(err => {
      console.log(err.message);
    });
} else {
  console.warn("Service Worker not available");
}
