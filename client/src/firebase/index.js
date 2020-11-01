import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

import firebaseConfig from "./config";

class Firebase {
  constructor() {
    firebase.initializeApp(firebaseConfig);
    this.auth = firebase.auth();
    this.db = firebase.firestore();
    this.storage = firebase.storage();
  }

  async googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");

    const { user } = await this.auth.signInWithPopup(provider);
    console.log("user", user);
    await this.db.collection("users").doc(user.uid).set({
      id: user.uid,
      nickname: user.displayName,
      avatarURL: user.photoURL,
    });
  }

  checkAuth(cb) {
    return this.auth.onAuthStateChanged(cb);
  }

  async getLoginUser(user) {
    console.log("~~user", user);
    const userData = {
      id: user.uid,
      nickname: user.displayName,
      avatarURL: user.photoURL,
    };

    return userData;
  }

  async login(email, password) {
    await this.auth.signInWithEmailAndPassword(email, password);
  }

  async logOut() {
    this.auth.signOut();
    window.location.reload();
  }
}

const firebaseFuntions = new Firebase();

export default firebaseFuntions;
