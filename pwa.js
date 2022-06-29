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
} else {
  console.warn("Service Worker not available");
}
