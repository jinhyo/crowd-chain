import { takeLatest, put, fork, all, call } from "redux-saga/effects";

import { ethActions } from "./ethSlice";
import getContract from "../lib/getContract";
import getWeb3 from "../lib/getWeb3";
import CampaignFactory from "../lib/contracts/CampaignFactory.json";
import Campaign from "../lib/contracts/Campaign.json";

function* campaginContractHanlder({ payload: { web3, address } }) {
  try {
    const campaignContract = yield call(getContract, web3, Campaign, address);
    yield put(ethActions.loadCampaignContractSuccess(campaignContract));
  } catch (error) {
    console.error(error);
    yield put(ethActions.loadCampaignContractFailure(error));
  }
}

function* RequestCampaignContractWatcher() {
  yield takeLatest(
    ethActions.loadCampaignContractRequest,
    campaginContractHanlder
  );
}

function* FactoryContracHanlder({ payload: web3 }) {
  try {
    yield put(ethActions.loadFactoryContractRequest());
    const campaignFactory = yield call(getContract, web3, CampaignFactory);
    yield put(ethActions.loadFactoryContractSuccess(campaignFactory));
  } catch (error) {
    console.error(error);
    yield put(ethActions.loadFactoryContractFailure(error));
  }
}

function* facotryContractRequestWatcher() {
  yield takeLatest(ethActions.loadWeb3Success, FactoryContracHanlder);
}

function* web3Hanlder() {
  try {
    const web3 = yield call(getWeb3);
    yield put(ethActions.loadWeb3Success(web3));
  } catch (error) {
    console.error(error);
    yield put(ethActions.loadWeb3Failure(error));
  }
}

function* web3RequestWatcher() {
  yield takeLatest(ethActions.loadWeb3Request, web3Hanlder);
}

export default function* ethSaga() {
  yield all([
    fork(web3RequestWatcher),
    fork(facotryContractRequestWatcher),
    fork(RequestCampaignContractWatcher),
  ]);
}
