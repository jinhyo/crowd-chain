import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Route } from "react-router-dom";
import store from "./store/configureStore";
import { ethActions } from "./features/ethSlice";
import "semantic-ui-css/semantic.min.css";
import Campaign from "./component/Campaign";
import NewCampaign from "./component/NewCampaign";
import NewRequest from "./component/NewRequest";
import TotalFunding from "./component/TotalFunding";
import Contributors from "./component/Contributors";
import Usage from "./component/Usage";
import Login from "./component/Login";

store.dispatch(ethActions.loadWeb3Request());
ReactDOM.render(
  <Provider store={store}>
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
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
