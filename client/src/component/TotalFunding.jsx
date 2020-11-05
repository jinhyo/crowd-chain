import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  Card,
  Divider,
  Feed,
  Grid,
  GridColumn,
  Header,
  Segment,
} from "semantic-ui-react";

import { ethActions, ethSelector } from "../features/ethSlice";
import firebaseFuntions from "../firebase";
import ContentsLoading from "./ContentsLoading";
import Layout from "./Layout";

function TotalFunding() {
  const dispatch = useDispatch();
  const { address } = useParams();

  const campaignContract = useSelector(ethSelector.campaignContract);
  const { initialized, web3 } = useSelector(ethSelector.all);

  const [contributionInfos, setContributionInfos] = useState([]);
  const [totalBalance, setTotalBalance] = useState("");
  const [loading, setLoading] = useState(false);

  // contract 가져오기
  useEffect(() => {
    if (initialized) {
      dispatch(ethActions.loadCampaignContractRequest({ web3, address }));
    }

    return () => {
      dispatch(ethActions.clearCampaignContract());
    };
  }, [initialized, address, web3]);

  // contribution 정보 가져오기
  useEffect(() => {
    if (campaignContract && web3) {
      getContributions(campaignContract, web3);
      getTotalBalance(campaignContract, web3);
    }
  }, [campaignContract, address, web3]);

  // 전체 펀딩금액 가져오기
  async function getTotalBalance(campaignContract, web3) {
    const balance = await campaignContract.methods.getTotalBalance().call();
    setTotalBalance(web3.utils.fromWei(balance) + " Ether");
  }

  // Contribute event 가져오기
  async function getContributions(campaignContract, web3) {
    setLoading(true);
    try {
      const {
        0: IDs,
        1: contributionAmount,
      } = await campaignContract.methods.getContributionAmounts().call();

      const detailedContributions = IDs.map((ID, index) => ({
        id: ID,
        contributionAmount: contributionAmount[index],
      }));

      addUserInfo(detailedContributions, web3);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  }

  // Contirution event info에 유저 정보 추가
  async function addUserInfo(detailedContributions, web3) {
    const finalContributionInfos = detailedContributions.map(async (info) => {
      const userInfo = await firebaseFuntions.getUserInfo(info.id);

      return {
        ...info,
        nickname: userInfo.nickname,
        avatarURL: userInfo.avatarURL,
        contributionAmount: web3.utils.fromWei(String(info.contributionAmount)),
      };
    });

    setContributionInfos(await Promise.all(finalContributionInfos));
  }

  return (
    <Layout>
      <Grid textAlign="center" verticalAlign="middle">
        <GridColumn width={8}>
          <Divider hidden />
          <Segment basic>
            <Header as="h2">모금액: {totalBalance} </Header>
          </Segment>
          <Segment stacked>
            <Card.Content>
              <Feed>
                {contributionInfos.map((info) => (
                  <Feed.Event key={info.id}>
                    <Feed.Label image={info.avatarURL} />
                    <Feed.Content>
                      <Feed.Content>{info.nickname}</Feed.Content>
                      <Feed.Summary>
                        {info.contributionAmount} Ether
                      </Feed.Summary>
                    </Feed.Content>
                  </Feed.Event>
                ))}
              </Feed>
            </Card.Content>
          </Segment>
        </GridColumn>
      </Grid>
      {loading && <ContentsLoading />}{" "}
    </Layout>
  );
}

export default TotalFunding;
