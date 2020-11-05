import React, { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, Link } from "react-router-dom";
import Layout from "./Layout";
import {
  Grid,
  Card,
  Button,
  Image,
  Divider,
  Header,
  Segment,
  Popup,
} from "semantic-ui-react";

import { ethSelector, ethActions } from "../features/ethSlice";
import ContributeForm from "./ContributeForm";
import UseFundingButton from "./UseFundingButton";
import firebaseFuntions from "../firebase";
import { userSelector } from "../features/userSlice";

function Campaign() {
  const { address } = useParams();
  const dispatch = useDispatch();

  const { initialized, web3 } = useSelector(ethSelector.all);
  const campaignContract = useSelector(ethSelector.campaignContract);
  const loginUserID = useSelector(userSelector.loginUserID);

  const [detailedInfos, setDetailedInfos] = useState({
    minimumContribution: "",
    balance: "",
    requestCounts: "",
    approveCounts: "",
    owner: "",
    createdAt: "",
    description: "",
    managerNickname: "",
    name: "",
    pictureURL: "",
    managerID: "",
  });

  useEffect(() => {
    if (initialized) {
      dispatch(ethActions.loadCampaignContractRequest({ web3, address }));
    }

    return () => {
      dispatch(ethActions.clearCampaignContract());
    };
  }, [initialized, address, web3]);

  useEffect(() => {
    if (campaignContract) {
      getSummary(campaignContract);
    }
  }, [campaignContract]);

  // 프로젝트 정보 가져오기
  const getSummary = useCallback(
    async (campaignContract) => {
      const summary = await campaignContract.methods.getSummary().call();
      const {
        createdAt,
        description,
        managerNickname,
        name,
        pictureURL,
        managerID,
      } = await firebaseFuntions.getProjectDetail(summary[6]);
      const time = createdAt.toDate();

      setDetailedInfos((prev) => ({
        ...prev,
        minimumContribution: web3.utils.fromWei(summary[0]),
        balance: web3.utils.fromWei(summary[1]),
        requestCounts: summary[2],
        approveCounts: summary[3],
        owner: summary[4],
        createdAt:
          time.getFullYear() + "-" + time.getMonth() + "-" + time.getDate(),
        description,
        managerNickname,
        name,
        pictureURL,
        managerID,
      }));
    },
    [web3]
  );

  // Contribute event
  useEffect(() => {
    if (campaignContract) {
      campaignContract.events
        .Contribute()
        .on("data", (event) => {
          setDetailedInfos((prev) => ({
            ...prev,
            balance: web3.utils.fromWei(event.returnValues[0]),
            approveCounts: event.returnValues[1],
          }));
        })
        .on("error", (error) => console.error(error));
    }
  }, [campaignContract, address]);

  const renderCampaignDetails = useCallback(
    () => (
      <Card.Group>
        <Card centered>
          <Image src={detailedInfos.pictureURL} wrapped />
        </Card>
        <Card color="red" fluid style={{ overflowWrap: "break-word" }}>
          <Card.Content>
            <Card.Header as="h2">{detailedInfos.name}</Card.Header>
            <Card.Content>{detailedInfos.description}</Card.Content>
            <Card.Meta textAlign="right">
              생성일: {detailedInfos.createdAt}
            </Card.Meta>
          </Card.Content>
        </Card>

        <Card color="blue">
          <Card.Content>
            <Popup
              hoverable
              content={detailedInfos.owner}
              trigger={
                <Card.Header>{detailedInfos.managerNickname}</Card.Header>
              }
            />

            <Card.Meta>프로젝트 메니저</Card.Meta>
          </Card.Content>
        </Card>

        <Card color="blue">
          <Card.Content>
            <Card.Header>{detailedInfos.minimumContribution} Ether</Card.Header>
            <Card.Meta>최소 펀딩금액</Card.Meta>
          </Card.Content>
        </Card>

        <Card color="blue">
          <Card.Content>
            <Link to={`/campaigns/${address}/total-funding`}>
              <Button
                color="instagram"
                size="tiny"
                floated="right"
                content="상세보기"
              />
            </Link>
            <Card.Header>{detailedInfos.balance} Ether</Card.Header>
            <Card.Meta>모금액</Card.Meta>
          </Card.Content>
        </Card>

        <Card color="blue">
          <Card.Content>
            <Link
              to={{
                pathname: `/campaigns/${address}/usage`,
                state: { managerAccount: detailedInfos.owner },
              }}
            >
              <Button
                size="tiny"
                color="instagram"
                floated="right"
                content="상세보기"
              />
            </Link>

            <Card.Header>{detailedInfos.requestCounts}</Card.Header>
            <Card.Meta>펀딩 사용처</Card.Meta>
          </Card.Content>
        </Card>

        <Card color="blue">
          <Card.Content>
            <Card.Header>{detailedInfos.approveCounts} 명</Card.Header>
            <Card.Meta>참여자</Card.Meta>
          </Card.Content>
        </Card>
      </Card.Group>
    ),
    [detailedInfos, address, campaignContract]
  );

  const { Row, Column } = Grid;
  return (
    <Layout>
      <Segment basic>
        <Header as="h2">프로젝트 세부사항</Header>
      </Segment>
      <Grid divided>
        <Row>
          <Column width={11}>
            {campaignContract ? renderCampaignDetails() : null}
          </Column>
          <Column width={5}>
            <ContributeForm
              web3={web3}
              address={address}
              minimumContribution={detailedInfos.minimumContribution}
              campaignContract={campaignContract}
            />
            <Divider hidden />
            {loginUserID === detailedInfos.managerID && (
              <UseFundingButton
                address={address}
                managerAccount={detailedInfos.owner}
              />
            )}
          </Column>
        </Row>
      </Grid>
    </Layout>
  );
}

export default Campaign;
