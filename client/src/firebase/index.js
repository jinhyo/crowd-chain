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
    this.fieldValue = firebase.firestore.FieldValue;
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
      projectsICreated: [],
      projectsIJoined: [],
    });
  }

  checkAuth(cb) {
    return this.auth.onAuthStateChanged(cb);
  }

  async getLoginUser(user) {
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

  async getCampaignInfos() {
    const projectSnap = await this.db
      .collection("projects")
      .orderBy("createdAt", "desc")
      .get();

    const projects = [];
    projectSnap.forEach((campaign) => {
      projects.push(campaign.data());
    });
    console.log("projects,projects", projects);

    return projects;
  }

  async createProject(projectInfo) {
    console.log("projectInfo", projectInfo);
    await this.db
      .collection("projects")
      .doc(projectInfo.address)
      .set(projectInfo);

    await this.db
      .collection("users")
      .doc(this.auth.currentUser.uid)
      .update({
        projectICreated: this.fieldValue.arrayUnion(projectInfo.address),
      });
  }

  async getProjectDetail(projectAddress) {
    console.log("projectAddress", projectAddress);
    const projectSnap = await this.db
      .collection("projects")
      .doc(projectAddress)
      .get();

    const projectDetails = projectSnap.data();

    return projectDetails;
  }
}

const firebaseFuntions = new Firebase();

export default firebaseFuntions;
