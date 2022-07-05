

importScripts('https://www.gstatic.com/firebasejs/8.2.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.2/firebase-messaging.js');


firebase.initializeApp({
  apiKey: "AIzaSyByM9-pe0SjiIQNslqIk9XQJIv4vctILGg",
  authDomain: "wellyx-tec.firebaseapp.com",
  databaseURL: "https://wellyx-tec.firebaseio.com",
  projectId: "wellyx-tec",
  storageBucket: "wellyx-tec.appspot.com",
  messagingSenderId: "436921745735",
  appId: "1:436921745735:web:ab0ae4569231e748010c62"

});

const messaging = firebase.messaging();


messaging.setBackgroundMessageHandler(function (payload) {
  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  })
    .then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const windowClient = windowClients[i];
        windowClient.postMessage(payload.data);
      }
    })
    .then(() => {
      //return registration.showNotification('my notification title');
    });
  return promiseChain;

  //   console.log('[firebase-messaging-sw.js] Received background message ', payload);

  // var notificationTitle = 'Background Message Title';
  // var notificationOptions = {
  //   body: 'Background Message body.',
  //   icon: '/firebase-logo.png'
  // };

  // return self.registration.showNotification(notificationTitle, notificationOptions);

});

