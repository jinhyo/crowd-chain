import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactDOM from "react-dom";
import App from "./App";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Route } from "react-router-dom";
import store from "./store/configureStore";
import { ethActions, ethSelector } from "./features/ethSlice";
import "semantic-ui-css/semantic.min.css";
import Campaign from "./component/Campaign";
import NewCampaign from "./component/NewCampaign";
import NewRequest from "./component/NewRequest";
import TotalFunding from "./component/TotalFunding";
import Contributors from "./component/Contributors";
import Usage from "./component/Usage";
import Login from "./component/Login";
import { userActions, userSelector } from "./features/userSlice";
import firebaseFuntions from "./firebase";
import Loading from "./Loading";

store.dispatch(ethActions.loadWeb3Request());

function Index() {
  const dispatch = useDispatch();

  const { initialized, web3, factoryContract } = useSelector(ethSelector.all);

  const userLoading = useSelector(userSelector.userLoading);

  useEffect(() => {
    console.log("useEffect factoryContract", factoryContract);
    if (factoryContract) {
      factoryContract.events
        .NewCampaign()
        .on("data", (event) => {
          console.log("NewCampaign event", event);
          dispatch(ethActions.addCampaign(event.returnValues.campaignAddress));
        })
        .on("error", (error) => console.error(error));
    }
  }, [factoryContract]);

  // 로그인 유저 체크 & 가져오기
  useEffect(() => {
    const unsubscribe = firebaseFuntions.checkAuth((user) => {
      if (user) {
        getLoginUser(user);
      } else {
        dispatch(userActions.clearLoginUser());
      }
    });

    return unsubscribe;
  }, []);

  async function getLoginUser(user) {
    try {
      const loginUser = await firebaseFuntions.getLoginUser(user);
      dispatch(userActions.setLoginUser(loginUser));
    } catch (error) {
      console.error(error);
    }
  }

  if (userLoading) return <Loading />;
  return (
    <Router>
      <Route exact path="/" component={App} />
      <Route exact path="/login" component={Login} />
      <Route path="/new/campaign" exact component={NewCampaign} />
      <Route path="/new/request/:address" exact component={NewRequest} />
      <Route exact path="/campaigns/:address" component={Campaign} />
      <Route
        exact
        path="/campaigns/:address/total-funding"
        component={TotalFunding}
      />
      <Route path="/campaigns/:address/contributors" component={Contributors} />
      <Route path="/campaigns/:address/usage" component={Usage} />
    </Router>
  );
}

ReactDOM.render(
  <Provider store={store}>
    <Index />
  </Provider>,
  document.getElementById("root")
);
