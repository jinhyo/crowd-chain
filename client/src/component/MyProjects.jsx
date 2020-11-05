import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Card, Grid, Divider, Image, Icon, Header } from "semantic-ui-react";
import { Link } from "react-router-dom";

import ContentsLoading from "./ContentsLoading";
import Layout from "./Layout";
import { ethSelector } from "../features/ethSlice";
import firebaseFuntions from "../firebase";
import { userSelector } from "../features/userSlice";

function Main() {
  const { web3 } = useSelector(ethSelector.all);
  const loginUserID = useSelector(userSelector.loginUserID);

  const [loading, setLoading] = useState(false);
  const [projectsICreated, setProjectsICreated] = useState([]);
  const [projectsIJoined, setprojectsIJoined] = useState([]);

  useEffect(() => {
    if (loginUserID) {
      getUserProjects();
    }
  }, [loginUserID]);

  async function getUserProjects() {
    try {
      setLoading(true);
      const {
        projectsICreated,
        projectsIJoined,
      } = await firebaseFuntions.getUserProjects();
      setProjectsICreated(projectsICreated);
      setprojectsIJoined(projectsIJoined);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const renderCampaigns = useCallback(
    (projects) =>
      projects.map((campaign) => {
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
                    web3.utils.fromWei(
                      campaign.totalContribution.toString()
                    )}{" "}
                  Ether
                </div>
              </Card.Content>
            </Card>
          </Grid.Column>
        );
      }),
    [web3]
  );

  return (
    <Layout>
      <Divider hidden />
      {loading && <ContentsLoading />}

      <Header as="h2" content="나의 프로젝트" />
      <Grid stackable columns="equal" columns={4} divided padded>
        {projectsICreated && renderCampaigns(projectsICreated)}
      </Grid>

      <Header as="h2" content="참가중인 프로젝트" />
      <Grid stackable columns="equal" columns={4} divided padded>
        {projectsIJoined && renderCampaigns(projectsIJoined)}
        {loading && <ContentsLoading />}
      </Grid>
    </Layout>
  );
}

export default Main;
