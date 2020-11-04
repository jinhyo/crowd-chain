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
    const userSnap = await this.db.collection("users").doc(user.uid).get();
    const userData = userSnap.data();
    // const userData = {
    //   id: user.uid,
    //   nickname: user.displayName,
    //   avatarURL: user.photoURL,
    // };

    return userData;
  }

  async login(email, password) {
    await this.auth.signInWithEmailAndPassword(email, password);
  }

  async logOut() {
    this.auth.signOut();
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

    return projects;
  }

  async createProject(projectInfo) {
    await this.db
      .collection("projects")
      .doc(projectInfo.address)
      .set(projectInfo);

    await this.db
      .collection("users")
      .doc(this.auth.currentUser.uid)
      .update({
        projectsICreated: this.fieldValue.arrayUnion(projectInfo.address),
      });
  }

  async checkDuplicateName(name) {
    const snap = await this.db
      .collection("projects")
      .where("name", "==", name)
      .get();
    let isAvailable = true;
    if (!snap.empty) {
      isAvailable = false;
    }

    return isAvailable;
  }

  async getProjectDetail(projectAddress) {
    const projectSnap = await this.db
      .collection("projects")
      .doc(projectAddress)
      .get();

    const projectDetails = projectSnap.data();

    return projectDetails;
  }

  async contribute(projectAddress, participantID, contributionAmount) {
    await this.db
      .collection("projects")
      .doc(projectAddress)
      .update({
        participants: this.fieldValue.arrayUnion(participantID),
        totalContribution: this.fieldValue.increment(contributionAmount),
      });

    await this.db
      .collection("users")
      .doc(this.auth.currentUser.uid)
      .update({ projectsIJoined: this.fieldValue.arrayUnion(projectAddress) });
  }

  async getUserInfo(userID) {
    const userSnap = await this.db.collection("users").doc(userID).get();

    const userData = userSnap.data();

    return userData;
  }

  async getUserProjects() {
    const userSnap = await this.db
      .collection("users")
      .doc(this.auth.currentUser.uid)
      .get();
    const userData = userSnap.data();

    const projectsICreatedIDs = userData.projectsICreated;
    const projectsIJoinedIDs = userData.projectsIJoined;

    const projectsICreated = await Promise.all(
      projectsICreatedIDs.map((id) => {
        return this.getProjectDetail(id);
      })
    );
    const projectsIJoined = await Promise.all(
      projectsIJoinedIDs.map((id) => {
        return this.getProjectDetail(id);
      })
    );

    return { projectsICreated, projectsIJoined };
  }
}

const firebaseFuntions = new Firebase();

export default firebaseFuntions;
