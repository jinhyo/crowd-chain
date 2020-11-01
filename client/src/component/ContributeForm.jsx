import React, { useCallback } from "react";
import useInput from "../hooks/useInput";
import { Form, Input, Button, Message, Icon } from "semantic-ui-react";

function ContributeForm({
  address,
  web3,
  campaignContract,
  minimumContribution,
  history
}) {
  const [errorMessage, setErrorMessage] = useInput("");
  const [contributionAmount, setContributionAmount] = useInput("");
  const [loading, setLoading] = useInput(false);

  const onClickSubmit = useCallback(
    async e => {
      e.preventDefault();
      setLoading(true);
      setErrorMessage("");

      if (!contributionAmount) {
        setLoading(false);
        return setErrorMessage("최소 펀딩 금액을 입력하세요.");
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
    [contributionAmount, web3, address]
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
              onChange={e => setContributionAmount(e.target.value)}
            />
          </span>
        </Form.Field>
        <Message error header="Error!" content={errorMessage} />
      </Form>
    </>
  );
}

export default ContributeForm;
