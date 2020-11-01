import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "./component/Layout";
import { Card, Button } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { ethSelector } from "./features/ethSlice";

function App() {
  const dispatch = useDispatch();
  const campaigns = useSelector(ethSelector.campaigns);

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
