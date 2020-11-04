import React, { useEffect, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import Layout from "./Layout";
import { ethSelector, ethActions } from "../features/ethSlice";
import {
  Grid,
  Card,
  Button,
  Table,
  GridColumn,
  Divider,
} from "semantic-ui-react";
import UseFundingButton from "./UseFundingButton";
import RequestRow from "./RequestRow";
import { userSelector } from "../features/userSlice";

function Usage() {
  const { address } = useParams();
  const {
    state: { managerAccount },
  } = useLocation();
  const dispatch = useDispatch();

  const loginUserID = useSelector(userSelector.loginUserID);
  const { initialized, web3 } = useSelector(ethSelector.all);
  const campaignContract = useSelector(ethSelector.campaignContract);
  const requestCall = useSelector(ethSelector.requestCall);

  const [requests, setRequests] = useState([]);
  const [contributorsCount, setcontributorsCount] = useState("");
  const [managerID, setManagerID] = useState("");

  useEffect(() => {
    if (initialized && !campaignContract) {
      dispatch(ethActions.loadCampaignContractRequest({ web3, address }));
    }

    if (campaignContract) {
      getRequests(campaignContract);
    }
  }, [campaignContract, initialized, address, requestCall]);

  async function getRequests(campaignContract) {
    try {
      const requestsCount = await campaignContract.methods
        .getRequestCounts()
        .call();
      const contributorsCount = await campaignContract.methods
        .approveCounts()
        .call();
      setcontributorsCount(contributorsCount);

      const requests = await Promise.all(
        Array(parseInt(requestsCount))
          .fill()
          .map((r, index) => campaignContract.methods.requests(index).call())
      );

      const managerID = await campaignContract.methods.ownerID().call();

      console.log("managerID", managerID);
      console.log("requests", requests);
      setManagerID(managerID);
      setRequests(requests);
    } catch (error) {
      console.error(error);
    }
  }

  const renderRequests = useCallback(() => {
    return requests.map((request, index) => {
      return (
        <RequestRow
          key={index}
          id={index}
          web3={web3}
          request={request}
          contributorsCount={contributorsCount}
          campaignContract={campaignContract}
        />
      );
    });
  }, [requests]);

  const { Header, Row, HeaderCell, Body } = Table;

  return (
    <Layout>
      <Divider hidden />
      <Grid>
        <GridColumn floated="left" width={7}>
          <Header as="h2">펀딩 사용내역</Header>
        </GridColumn>
        <GridColumn floated="right" width={3}>
          {loginUserID === managerID && (
            <UseFundingButton
              address={address}
              managerAccount={managerAccount}
            />
          )}
        </GridColumn>
      </Grid>
      <Table celled>
        <Header>
          <Row textAlign="center">
            <HeaderCell>ID</HeaderCell>
            <HeaderCell>내역</HeaderCell>
            <HeaderCell>요청 액수</HeaderCell>
            <HeaderCell>지급 대상</HeaderCell>
            <HeaderCell>승인 상태</HeaderCell>
            <HeaderCell>실행 유무</HeaderCell>
          </Row>
        </Header>
        <Body>{requests ? renderRequests() : null}</Body>
      </Table>
    </Layout>
  );
}

export default Usage;
