import { Injectable } from "@angular/core";

// This import loads the firebase namespace along with all its type information.
import * as firebase from "firebase";

// These imports load individual services into the firebase namespace.
import "firebase/messaging";

import { BehaviorSubject } from "rxjs";
import { HttpService } from "./app.http.service";
import { HomeApi } from "@app/helper/config/app.webapi";

@Injectable({ providedIn: "root" })
export class FCMMessagingService {
  config: any;
  messaging: any;
  currentMessage = new BehaviorSubject(null);

  constructor(private _http: HttpService) {
    if (firebase.default.messaging.isSupported()) {
      this.config = firebase.default.initializeApp({
        apiKey: "AIzaSyByM9-pe0SjiIQNslqIk9XQJIv4vctILGg",
        authDomain: "wellyx-tec.firebaseapp.com",
        databaseURL: "https://wellyx-tec.firebaseio.com",
        projectId: "wellyx-tec",
        storageBucket: "wellyx-tec.appspot.com",
        messagingSenderId: "436921745735",
        appId: "1:436921745735:web:ab0ae4569231e748010c62"
      });

      this.messaging = firebase.default.messaging();
    }
    // else {
    // }

    // this.messaging.requestPermission().then(() => {
    //   //console.log('have permission');
    //   return this.messaging.getToken()

    // }).then((token) => {
    //   //console.log(token);
    //   this.messaging.onMessage((message) =>{
    //   //  console.log(message);
    //   })
    // });
  }

  refreshToken() {
    if (firebase.default.messaging.isSupported()) {
      this.messaging.onTokenRefresh(() => {
        this.messaging
          .getToken()
          .then((refreshedToken) => {
            this.SetTokenSentToServer(false);
            this.SendTokenToServer(refreshedToken);
          })
          .catch(function (err) {
            //console.log('Unable to retrieve refreshed token ', err);
          });
      });
    }
  }

  requestPermission() {
    if (this.isSupportMessaging()) {
      this.messaging
        .requestPermission()
        .then(() => {
          //console.log('Notification permission granted.');

          if (!this.IsLogout()) {
            //console.log('after logout going to delete and get new fcm token');
            this.deleteToken();
          }
        })
        .catch(function (err) {
          //console.log('Unable to get permission to notify.', err);
        });
    }
  }

  getFcmToken() {
    if (firebase.default.messaging.isSupported()) {
      this.messaging
        .getToken()
        .then((currentToken) => {
          this.SendTokenToServer(currentToken);
        })
        .catch(function (err) {
          //console.log('An error occurred while retrieving token. ', err);
        });
    }
  }

  IsLogout() {
    return window.localStorage.getItem("access_token") === null;
  }

  IsTokenSentToServer() {
    return window.localStorage.getItem("sentToServer") === "1";
  }

  SetTokenSentToServer(sent) {
    window.localStorage.setItem("sentToServer", sent ? "1" : "0");
  }

  SendTokenToServer(currentToken) {
    if (firebase.default.messaging.isSupported()) {
      if (!this.IsTokenSentToServer()) {
        let param = {
          FcmToken: currentToken,
        };

        this._http.save(HomeApi.saveFCMToken, param).subscribe((res: any) => {
          //console.log('Successfull save token on server and message code is : ' + res);
        });

        this.SetTokenSentToServer(true);
      } else {
        //console.log('Token already sent to server so won\'t send it again unless it changes');
      }
    }
  }

  deleteToken() {
    if (firebase.default.messaging.isSupported()) {
      this.messaging
        .getToken()
        .then((currentToken) => {
          if (currentToken) {
            this.SetTokenSentToServer(false);
            //this.messaging.deleteToken(currentToken).then(() => {
            this.getFcmToken();
            // }).catch(function (err) {
            //   console.log('Unable to delete token. ', err);
            //  });
          } else {
            console.log(
              "No Instance ID token available. Request permission to generate one."
            );
            this.SetTokenSentToServer(false);
          }
        })
        .catch(function (err) {
          //console.log('Error retrieving Instance ID token. ', err);
          //this.SetTokenSentToServer(false);
        });
    }
  }

  receiveMessage() {
    if (this.isSupportMessaging()) {
      this.messaging.onMessage((payload) => {
        this.currentMessage.next(payload);
        // this.messaging.setBackgroundMessageHandler(function(payload) {
        //   console.log(payload);
        //   //  // return self.registration.showNotification(title, options);
        // });
      });
    }
  }

  receiveBackgroundMessage() {
    // this.messaging.setBackgroundMessageHandler((payload) => {
    //   console.log(payload);
    //   //  // return self.registration.showNotification(title, options);
    // });
  }

  isSupportMessaging(): boolean {
    if (firebase.default.messaging.isSupported()) {
      //  console.log("receive Messages working on this os = ", navigator.platform);
      return true;
    } else {
      //  console.log("receive Messages not working on this os = ", navigator.platform);
      return false;
    }
  }
}
