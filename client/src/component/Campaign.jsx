import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Layout from "./Layout";
import { ethSelector, ethActions } from "../features/ethSlice";
import { Grid, Card, Button } from "semantic-ui-react";
import ContributeForm from "./ContributeForm";
import useInput from "../hooks/useInput";
import UseFundingButton from "./UseFundingButton";
import { Link } from "react-router-dom";

function Campaign({ match, history }) {
  const address = match.params.address;
  const dispatch = useDispatch();

  const { initialized, web3 } = useSelector(ethSelector.all);
  const campaignContract = useSelector(ethSelector.campaignContract);

  const [minimumContribution, setMinimumContribution] = useInput("");
  const [balance, setBalance] = useInput("");
  const [requestCounts, setRequestCounts] = useInput("");
  const [approveCounts, setApproveCounts] = useInput("");
  const [topic, setTopic] = useInput("");
  const [owner, setOwner] = useInput("");
  const [contractDone, setContractDone] = useInput(false);

  console.log("topic", decodeURIComponent(topic));

  useEffect(() => {
    if (initialized && !contractDone) {
      dispatch(ethActions.loadCampaignContractRequest({ web3, address }));
      setContractDone(true);
    }

    if (campaignContract) {
      async function getSummary() {
        const summary = await campaignContract.methods.getSummary().call();
        console.log("getSummary", summary);
        setMinimumContribution(web3.utils.fromWei(summary[0]));
        setBalance(web3.utils.fromWei(summary[1]));
        setRequestCounts(summary[2]);
        setApproveCounts(summary[3]);
        setTopic(summary[5]);
        setOwner(summary[4]);
      }
      getSummary();
    }
  }, [campaignContract, initialized, address]);

  useEffect(() => {
    if (campaignContract) {
      campaignContract.events
        .Contribute()
        .on("data", (event) => {
          setBalance(web3.utils.fromWei(event.returnValues[0]));
          setApproveCounts(event.returnValues[1]);
          console.log("event", event);
        })
        .on("error", (error) => console.error(error));
    }
  }, [campaignContract, address]);

  const renderCampaignDetails = () => {
    return (
      <Card.Group>
        <Card fluid color="red" style={{ overflowWrap: "break-word" }}>
          <Card.Content>
            <UseFundingButton address={address} />
            <Card.Header>{owner}</Card.Header>
            <Card.Meta>프로젝트 메니저</Card.Meta>
          </Card.Content>
        </Card>

        <Card color="blue">
          <Card.Content>
            <Card.Header>{decodeURIComponent(topic)}</Card.Header>
            <Card.Meta>프로젝트 분야</Card.Meta>
          </Card.Content>
        </Card>

        <Card color="blue">
          <Card.Content>
            <Card.Header>{minimumContribution} ETH</Card.Header>
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
            <Card.Header>{balance} ETH</Card.Header>
            <Card.Meta>총 펀딩금액</Card.Meta>
          </Card.Content>
        </Card>

        <Card color="blue">
          <Card.Content>
            <Link to={`/campaigns/${address}/contributors`}>
              <Button
                color="instagram"
                size="tiny"
                floated="right"
                content="상세보기"
              />
            </Link>

            <Card.Header>{approveCounts} 명</Card.Header>
            <Card.Meta>참여자</Card.Meta>
          </Card.Content>
        </Card>

        <Card color="blue">
          <Card.Content>
            <Link to={`/campaigns/${address}/usage`}>
              <Button
                size="tiny"
                color="instagram"
                floated="right"
                content="상세보기"
              />
            </Link>

            <Card.Header>{requestCounts}</Card.Header>
            <Card.Meta>펀딩 사용처</Card.Meta>
          </Card.Content>
        </Card>
      </Card.Group>
    );
  };

  const { Row, Column } = Grid;
  return (
    <Layout>
      <h3>켐페인 세부사항</h3>
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
              minimumContribution={minimumContribution}
              history={history}
            />
          </Column>
        </Row>
      </Grid>
    </Layout>
  );
}

export default Campaign;
