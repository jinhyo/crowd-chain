import React, { useEffect, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import Layout from "./Layout";
import { ethSelector, ethActions } from "../features/ethSlice";
import { Grid, Card, Button, Table } from "semantic-ui-react";
import ContributeForm from "./ContributeForm";
import useInput from "../hooks/useInput";
import UseFundingButton from "./UseFundingButton";
import { Link } from "react-router-dom";
import RequestRow from "./RequestRow";

function Usage() {
  const { address } = useParams();
  const {
    state: { managerAccount },
  } = useLocation();
  const dispatch = useDispatch();

  console.log("managerAccount", managerAccount);

  const { initialized, web3 } = useSelector(ethSelector.all);
  const campaignContract = useSelector(ethSelector.campaignContract);
  const requestCall = useSelector(ethSelector.requestCall);

  const [requests, setRequests] = useState([]);
  const [contributorsCount, setcontributorsCount] = useState("");

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
      console.log("requests", requests);
      setRequests(requests);
    } catch (error) {
      console.error(error);
    }
  }

  const renderRequests = () => {
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
  };

  const { Header, Row, HeaderCell, Body } = Table;

  return (
    <Layout>
      <UseFundingButton address={address} managerAccount={managerAccount} />
      <h3>펀딩 사용내역</h3>

      <Table celled>
        <Header>
          <Row textAlign="center">
            <HeaderCell>ID</HeaderCell>
            <HeaderCell>내역</HeaderCell>
            <HeaderCell>지급 액수</HeaderCell>
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
