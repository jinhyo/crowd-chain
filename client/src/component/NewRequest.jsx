import React, { useCallback, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useParams, useHistory } from "react-router-dom";
import Layout from "./Layout";
import { ethSelector } from "../features/ethSlice";
import useInput from "../hooks/useInput";
import {
  Form,
  Input,
  Button,
  Message,
  GridColumn,
  Grid,
  Divider,
  Header,
  Segment,
} from "semantic-ui-react";
import { ethActions } from "../features/ethSlice";
import { userSelector } from "../features/userSlice";

function NewRequest() {
  const dispatch = useDispatch();
  const history = useHistory();
  const { address } = useParams();
  const {
    state: { managerAccount },
  } = useLocation();

  console.log("managerAccount", managerAccount);

  const { initialized, web3 } = useSelector(ethSelector.all);
  const currentAccount = useSelector(ethSelector.currentAccount);
  const loginUserID = useSelector(userSelector.loginUserID);
  const campaignContract = useSelector(ethSelector.campaignContract);

  const [errorMessage, setErrorMessage] = useInput("");
  const [loading, setLoading] = useInput(false);
  const [description, setDescription] = useInput("");
  const [etherAmount, setEtherAmount] = useInput("");
  const [recipient, setRecipient] = useInput("");
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    if (initialized && web3) {
      dispatch(ethActions.loadCampaignContractRequest({ web3, address }));
    }

    return () => {
      dispatch(ethActions.clearCampaignContract());
    };
  }, [initialized, address, web3]);

  useEffect(() => {
    if (campaignContract) {
      getTotalBalance(campaignContract, web3);
    }
  }, [campaignContract, web3]);

  async function getTotalBalance(campaignContract, web3) {
    const summary = await campaignContract.methods.getSummary().call();
    setTotalBalance(web3.utils.fromWei(summary[1]));
  }

  const onClickSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const [account] = await web3.eth.getAccounts();

      if (managerAccount.toUpperCase() !== account.toUpperCase()) {
        return alert(
          `프로젝트를 생성한 계정으로 설정해 주세요. => ${managerAccount}`
        );
      }

      setLoading(true);
      setErrorMessage("");

      if (!description) {
        setLoading(false);
        return setErrorMessage("사용내역을 입력하세요.");
      } else if (!etherAmount) {
        setLoading(false);
        return setErrorMessage("필요 액수를 입력하세요.");
      } else if (!recipient) {
        setLoading(false);
        return setErrorMessage("공급처를 입력하세요.");
      } else if (etherAmount > totalBalance) {
        setLoading(false);
        return setErrorMessage(
          `현재 모금액(${totalBalance} ETH)보다 많은 액수를 요청할수 없습니다.`
        );
      }

      try {
        const weiAmount = web3.utils.toWei(etherAmount);
        console.log("account", account);
        console.log("loginUserID", loginUserID);

        await campaignContract.methods
          .createRequest(
            encodeURIComponent(description),
            weiAmount,
            recipient,
            loginUserID
          )
          .send({ from: account });
        setLoading(false);
        history.push({
          pathname: `/campaigns/${address}/usage`,
          state: { managerAccount: account },
        });
      } catch (error) {
        setErrorMessage(error.message);
        setLoading(false);
      }
    },
    [
      description,
      etherAmount,
      recipient,
      campaignContract,
      managerAccount,
      loginUserID,
      totalBalance,
    ]
  );

  return (
    <Layout>
      <Grid textAlign="center" verticalAlign="middle">
        <GridColumn width={10}>
          <Divider hidden />
          <Segment basic>
            <Header as="h2">펀딩 사용 요청 </Header>
          </Segment>
          <Segment stacked>
            <Form onSubmit={onClickSubmit} error={!!errorMessage}>
              <Form.Field>
                <Input
                  label="사용 내역"
                  labelPosition="left"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <p />
                <Input
                  label="필요 액수"
                  labelPosition="left"
                  value={etherAmount}
                  placeholder="ETH"
                  onChange={(e) => setEtherAmount(e.target.value)}
                />
                <p />
                <Input
                  label="지불 대상"
                  labelPosition="left"
                  placeholder="지갑 주소: 0xab..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </Form.Field>
              <Message error header={errorMessage} />
              <Button primary loading={loading}>
                요청
              </Button>
            </Form>
          </Segment>
        </GridColumn>
      </Grid>
    </Layout>
  );
}

export default NewRequest;
