import React, { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import Layout from "./Layout";
import { ethSelector, ethActions } from "../features/ethSlice";
import {
  Grid,
  Card,
  Button,
  Message,
  Image,
  Divider,
  Header,
  Segment,
} from "semantic-ui-react";
import ContributeForm from "./ContributeForm";
import useInput from "../hooks/useInput";
import UseFundingButton from "./UseFundingButton";
import { Link } from "react-router-dom";
import firebaseFuntions from "../firebase";
import ContentsLoading from "./ContentsLoading";

function Campaign() {
  const { address } = useParams();
  const dispatch = useDispatch();

  const { initialized, web3 } = useSelector(ethSelector.all);
  const campaignContract = useSelector(ethSelector.campaignContract);

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
  });

  // const [contractDone, setContractDone] = useInput(false);

  useEffect(() => {
    if (initialized /* && !contractDone */) {
      dispatch(ethActions.loadCampaignContractRequest({ web3, address }));
      // setContractDone(true);
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

  useEffect(() => {
    if (campaignContract) {
      campaignContract.events
        .Contribute()
        .on("data", (event) => {
          setDetailedInfos((prev) => ({
            ...prev,
            approveCounts: event.returnValues[1],
            balance: event.returnValues[0],
          }));
          console.log("event", event);
        })
        .on("error", (error) => console.error(error));
    }
  }, [campaignContract, address]);

  const getSummary = useCallback(
    async (campaignContract) => {
      const summary = await campaignContract.methods.getSummary().call();
      const {
        createdAt,
        description,
        managerNickname,
        name,
        pictureURL,
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
      }));
    },
    [web3]
  );

  const renderCampaignDetails = useCallback(
    () => (
      <Card.Group>
        <Card>
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
            <Card.Header>{detailedInfos.managerNickname}</Card.Header>
            <Card.Meta>프로젝트 메니저</Card.Meta>
          </Card.Content>
        </Card>
        <Card color="blue">
          <Card.Content>
            <Card.Header>{detailedInfos.minimumContribution} ETH</Card.Header>
            <Card.Meta>최소 펀딩금액</Card.Meta>
          </Card.Content>
        </Card>

        <Card color="blue">
          <Card.Content>
            <Link to={`/campaigns/${detailedInfos.address}/total-funding`}>
              <Button
                color="instagram"
                size="tiny"
                floated="right"
                content="상세보기"
              />
            </Link>
            <Card.Header>{detailedInfos.balance} ETH</Card.Header>
            <Card.Meta>총 펀딩금액</Card.Meta>
          </Card.Content>
        </Card>

        <Card color="blue">
          <Card.Content>
            <Link to={`/campaigns/${detailedInfos.address}/contributors`}>
              <Button
                color="instagram"
                size="tiny"
                floated="right"
                content="상세보기"
              />
            </Link>

            <Card.Header>{detailedInfos.approveCounts} 명</Card.Header>
            <Card.Meta>참여자</Card.Meta>
          </Card.Content>
        </Card>

        <Card color="blue">
          <Card.Content>
            <Link to={`/campaigns/${detailedInfos.address}/usage`}>
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
      </Card.Group>
    ),
    [detailedInfos]
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
              campaignContract={campaignContract}
              address={address}
              minimumContribution={detailedInfos.minimumContribution}
            />
            <UseFundingButton address={detailedInfos.address} />
          </Column>
        </Row>
      </Grid>
    </Layout>
  );
}

export default Campaign;
