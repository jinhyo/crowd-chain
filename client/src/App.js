import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "./component/Layout";
import { Card, Button } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { ethSelector, ethActions } from "./features/ethSlice";
import firebaseFuntions from "./firebase";
import { userActions } from "./features/userSlice";

function App() {
  const dispatch = useDispatch();
  const { initialized, web3, factoryContract } = useSelector(ethSelector.all);
  const campaigns = useSelector(ethSelector.campaigns);

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
      console.log("user;m", user);
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
      console.log("loginUser", loginUser);
      dispatch(userActions.setLoginUser(loginUser));
    } catch (error) {
      console.error(error);
    }
  }

  const renderCampaigns = () => {
    const items = campaigns.map((campaignAddress) => {
      return {
        header: campaignAddress,
        description: (
          <Link to={`/campaigns/${campaignAddress}`}>프로젝트 보기</Link>
        ),
        fluid: true,
      };
    });

    return <Card.Group items={items} />;
  };

  return (
    <Layout>
      <Link to="/new/campaign">
        <Button
          primary
          icon="add circle"
          floated="right"
          content="Create Campaign"
        />
      </Link>
      {campaigns ? renderCampaigns() : "loading"}
    </Layout>
  );
}

export default App;
