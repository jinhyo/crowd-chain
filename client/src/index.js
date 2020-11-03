import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Route } from "react-router-dom";
import store from "./store/configureStore";
import { ethActions, ethSelector } from "./features/ethSlice";
import "semantic-ui-css/semantic.min.css";
import Campaign from "./component/Campaign";
import NewCampaign from "./component/NewCampaign";
import NewRequest from "./component/NewRequest";
import TotalFunding from "./component/TotalFunding";
import Usage from "./component/Usage";
import Login from "./component/Login";
import { userActions, userSelector } from "./features/userSlice";
import firebaseFuntions from "./firebase";
import Loading from "./Loading";
import Main from "./Main";

store.dispatch(ethActions.loadWeb3Request());

function Index() {
  const dispatch = useDispatch();

  const { initialized, web3, factoryContract } = useSelector(ethSelector.all);

  const userLoading = useSelector(userSelector.userLoading);

  useEffect(() => {
    window.ethereum.on("accountsChanged", (accounts) => {
      dispatch(ethActions.setCurrentAccount(accounts[0]));
      console.log("accounts", accounts[0]);
    });

    // if (window.ethereum.chainId !== "0x4") {
    //   alert("네트워크를 Rinkeby 테스트넷으로 설정해 주세요.");
    // }
  }, []);

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
      <Route exact path="/" component={Main} />
      <Route exact path="/login" component={Login} />
      <Route path="/new/campaign" exact component={NewCampaign} />
      <Route path="/new/request/:address" exact component={NewRequest} />
      <Route exact path="/campaigns/:address" component={Campaign} />
      <Route
        exact
        path="/campaigns/:address/total-funding"
        component={TotalFunding}
      />
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
