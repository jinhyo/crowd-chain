import React, { useCallback } from "react";
import useInput from "../hooks/useInput";
import { Form, Input, Button, Message, Icon } from "semantic-ui-react";

function ContributeForm({
  address,
  web3,
  campaignContract,
  minimumContribution,
}) {
  const [errorMessage, setErrorMessage] = useInput("");
  const [contributionAmount, setContributionAmount] = useInput("");
  const [loading, setLoading] = useInput(false);
  console.log("contributionAmount", contributionAmount);
  console.log("minimumContribution", minimumContribution);

  const onClickSubmit = useCallback(
    async (e) => {
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
          .contribute()
          .send({ from: account, value: contributionAmountWei, to: address });
        setContributionAmount("");
      } catch (error) {
        setErrorMessage(error.message);
      }
      setLoading(false);
    },
    [contributionAmount, minimumContribution, web3, address]
  );

  const handleContributionInpu = useCallback((e) => {
    setContributionAmount(e.target.value);
  }, []);

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
              onChange={handleContributionInpu}
            />
          </span>
        </Form.Field>
        <Message error header={errorMessage} />
      </Form>
    </>
  );
}

export default ContributeForm;
