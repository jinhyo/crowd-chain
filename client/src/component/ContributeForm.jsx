import React, { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import useInput from "../hooks/useInput";
import { Form, Input, Button, Message, Icon } from "semantic-ui-react";
import { ethSelector } from "../features/ethSlice";
import { userSelector } from "../features/userSlice";
import firebaseFuntions from "../firebase";

function ContributeForm({
  address,
  web3,
  minimumContribution,
  campaignContract,
}) {
  const loginUserID = useSelector(userSelector.loginUserID);

  const [errorMessage, setErrorMessage] = useInput("");
  const [contributionAmount, setContributionAmount] = useInput("");
  const [loading, setLoading] = useInput(false);
  console.log("contributionAmount", contributionAmount);

  const onClickSubmit = useCallback(
    async (e) => {
      if (!loginUserID) {
        return alert("로그인이 필요합니다.");
      }

      e.preventDefault();
      setLoading(true);
      setErrorMessage("");

      if (contributionAmount < minimumContribution) {
        setLoading(false);
        return setErrorMessage(
          `최소 펀딩금액은 ${minimumContribution}ETH 입니다.`
        );
      }

      try {
        const [account] = await web3.eth.getAccounts();
        const contributionAmountWei = web3.utils.toWei(contributionAmount);
        await campaignContract.methods
          .contribute(loginUserID)
          .send({ from: account, value: contributionAmountWei, to: address });

        await firebaseFuntions.contribute(
          address,
          loginUserID,
          contributionAmountWei
        );

        setContributionAmount("");
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    },
    [
      contributionAmount,
      minimumContribution,
      web3,
      address,
      loginUserID,
      campaignContract,
    ]
  );

  return (
    <>
      <Form onSubmit={onClickSubmit} error={!!errorMessage}>
        <Form.Field>
          <span>
            <Input
              size="small"
              fluid
              placeholder={minimumContribution}
              label="ether"
              labelPosition="left"
              action={
                <Button
                  icon="ethereum"
                  size="small"
                  primary
                  loading={loading}
                  content="펀딩"
                ></Button>
              }
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
            />
          </span>
        </Form.Field>
        <Message error header={errorMessage} />
      </Form>
    </>
  );
}

export default ContributeForm;
