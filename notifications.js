const runPushNotifications = async () => {
    const reg = await navigator.serviceWorker.getRegistration();

    if ('showTrigger' in Notification.prototype) {
        alert('notifications work')
      } else {
        alert('no')
        console.log(Notification.prototype)
      }

    Notification.requestPermission().then(permission => {
        if (permission !== 'granted') {
            alert('you need to allow push notifications');
        } else {
            const timestamp = new Date().getTime() + 10 * 1000; // now plus 5000ms
            console.log(timestamp)
            reg.showNotification(
                'Demo Push Notification',
                {
                    tag: timestamp, // a unique ID
                    body: 'Hello World', // content of the push notification
                    showTrigger: new TimestampTrigger(timestamp), // set the time for the push notification
                    data: {
                        url: window.location.href, // pass the current url to the notification
                    },
                    badge: './assets/badge.png',
                    icon: './assets/icon.png',
                }
            );
        }
    });
};

runPushNotifications()