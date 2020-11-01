import ethSaga from "./ethSaga";
import { all, fork } from "redux-saga/effects";

export default function* rootSaga() {
  yield all([fork(ethSaga)]);
}
