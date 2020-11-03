import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "./component/Layout";
import { Card, Button, Grid, Divider, Image, Icon } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { ethSelector } from "./features/ethSlice";
import firebaseFuntions from "./firebase";
import ContentsLoading from "./component/ContentsLoading";

function Main() {
  const dispatch = useDispatch();

  const { web3 } = useSelector(ethSelector.all);

  const [campaignInfos, setCampaignInfos] = useState([]);
  const [campaignLoading, setCampaignLoading] = useState(false);

  useEffect(() => {
    getCampaignInfos();

    return () => {
      setCampaignInfos([]);
    };
  }, []);
  async function getCampaignInfos() {
    try {
      setCampaignLoading(true);
      const campaignInfos = await firebaseFuntions.getCampaignInfos();
      setCampaignInfos(campaignInfos);
    } catch (error) {
      console.error(error);
    } finally {
      setCampaignLoading(false);
    }
  }

  const renderCampaigns = useCallback(
    () =>
      campaignInfos.map((campaign) => {
        const time = campaign.createdAt.toDate();
        return (
          <Grid.Column key={campaign.address} width={4}>
            <Card>
              <Image src={campaign.pictureURL} wrapped />
              <Card.Content>
                <Card.Header>
                  <Link to={`/campaigns/${campaign.address}`}>
                    {campaign.name}
                  </Link>
                </Card.Header>
                <Card.Meta>
                  <span className="date">
                    생성일:
                    {time.getFullYear() +
                      "-" +
                      time.getMonth() +
                      "-" +
                      time.getDate()}
                  </span>
                </Card.Meta>
                <Card.Meta>매니저: {campaign.managerNickname}</Card.Meta>
                <Card.Description>{campaign.description}</Card.Description>
              </Card.Content>
              <Card.Content extra>
                <div>
                  <Icon name="user" />
                  참여자: {campaign.participants.length} 명
                </div>
                <div>
                  <Icon name="ethereum" />
                  모금액:{" "}
                  {web3 &&
                    web3.utils.fromWei(campaign.totalContribution.toString())}
                  ETH
                </div>
              </Card.Content>
            </Card>
          </Grid.Column>
        );
      }),
    [campaignInfos, web3]
  );

  return (
    <Layout>
      <Divider hidden />
      <Grid stackable columns="equal" columns={4} divided padded>
        {campaignInfos && renderCampaigns()}
        {campaignLoading && <ContentsLoading />}
      </Grid>
    </Layout>
  );
}

export default Main;
