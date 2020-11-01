import React, { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import Layout from "./Layout";
import { ethSelector } from "../features/ethSlice";
import useInput from "../hooks/useInput";
import { Form, Input, Button, Message } from "semantic-ui-react";

function NewCampaign({ history }) {
  const { web3, factoryContract } = useSelector(ethSelector.all);
  const [errorMessage, setErrorMessage] = useInput("");
  const [minimumContribution, setMinimumContribution] = useInput("");
  const [topic, setTopic] = useInput("");
  const [loading, setLoading] = useInput(false);

  const onClickSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      setErrorMessage("");

      if (!minimumContribution) {
        setLoading(false);
        return setErrorMessage("최소 후원비용을 입력하세요.");
      }
      console.log("topic in submit", topic);

      if (!topic) {
        setLoading(false);
        return setErrorMessage("분야를 정하세요. 입력하세요");
      }
      try {
        const minimumEther = web3.utils.toWei(minimumContribution);
        const [account] = await web3.eth.getAccounts();
        await factoryContract.methods
          .createCampaign(minimumEther, encodeURIComponent(topic))
          .send({ from: account });
        setLoading(false);
        history.push("/");
      } catch (error) {
        setErrorMessage(error.message);
        setLoading(false);
      }
    },
    [minimumContribution, topic, web3]
  );

  return (
    <Layout>
      <h3>Create a Campaign</h3>
      <Form onSubmit={onClickSubmit} error={!!errorMessage}>
        <Form.Field>
          <Input
            label="ETHER"
            labelPosition="right"
            placeholder="최소 후원비용"
            value={minimumContribution}
            onChange={(e) => setMinimumContribution(e.target.value)}
          />
          <p />
          <Input
            label="분야"
            labelPosition="right"
            placeholder="분야"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </Form.Field>
        <Message error header="Error!" content={errorMessage} />
        <Button primary loading={loading}>
          Create
        </Button>
      </Form>
    </Layout>
  );
}

export default NewCampaign;
