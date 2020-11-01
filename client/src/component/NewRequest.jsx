import React, { useCallback, useState, useEffect } from "react";

import { useSelector, useDispatch } from "react-redux";
import Layout from "./Layout";
import { ethSelector } from "../features/ethSlice";
import useInput from "../hooks/useInput";
import { Form, Input, Button, Message, Dropdown } from "semantic-ui-react";
import { ethActions } from "../features/ethSlice";

function NewRequest({ match, history }) {
  const dispatch = useDispatch();
  const address = match.params.address;

  const { initialized, web3 } = useSelector(ethSelector.all);
  const campaignContract = useSelector(ethSelector.campaignContract);

  const [errorMessage, setErrorMessage] = useInput("");
  const [loading, setLoading] = useInput(false);
  const [description, setDescription] = useInput("");
  const [etherAmount, setEtherAmount] = useInput("");
  const [recipient, setRecipient] = useInput("");
  const [contractDone, setContractDone] = useInput(true);

  useEffect(() => {
    if (initialized && contractDone) {
      dispatch(ethActions.loadCampaignContractRequest({ web3, address }));
      setContractDone(false);
    }

    return () => {
      setContractDone(true);
    };
  }, [initialized, address]);

  const onClickSubmit = useCallback(
    async e => {
      e.preventDefault();
      setLoading(true);
      setErrorMessage("");

      if (!description) {
        setLoading(false);
        return setErrorMessage("사용내역을 입력하세요.");
      }
      if (!etherAmount) {
        setLoading(false);
        return setErrorMessage("필요 액수를 입력하세요.");
      }
      if (!recipient) {
        setLoading(false);
        return setErrorMessage("공급처를 입력하세요.");
      }

      try {
        const weiAmount = web3.utils.toWei(etherAmount);
        const [account] = await web3.eth.getAccounts();
        console.log("account", account);

        await campaignContract.methods
          .createRequest(description, weiAmount, recipient)
          .send({ from: account });
        setLoading(false);
        history.push(`/campaigns/${address}/usage`);
      } catch (error) {
        setErrorMessage(error.message);
        setLoading(false);
      }
    },
    [description, etherAmount, recipient, campaignContract]
  );

  const options1 = [
    { key: "buy", text: "구매", value: "buy" },
    { key: "employ", text: "고용", value: "employ" },
    { key: "outsource", text: "외주", value: "outsource" },
    { key: "ets", text: "기타", value: "ets" }
  ];

  const options2 = [
    { key: "ether", text: "ETHER", value: "ether" },
    { key: "gwei", text: "GWEI", value: "gwei" }
  ];

  return (
    <Layout>
      <h3>펀딩 사용 요청</h3>
      <Form onSubmit={onClickSubmit} error={!!errorMessage}>
        <Form.Field>
          <Input
            action={
              <Dropdown
                button
                basic
                floating
                options={options1}
                defaultValue="buy"
                onChange={e => console.log(e.target)}
              />
            }
            label="사용 내역"
            labelPosition="left"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <p />
          <Input
            action={
              <Dropdown
                button
                basic
                floating
                options={options2}
                defaultValue="ether"
                onSelect={e => setRecipient(e.target.value)}
              />
            }
            label="필요 액수"
            labelPosition="left"
            value={etherAmount}
            onChange={e => setEtherAmount(e.target.value)}
          />
          <p />
          <Input
            label="지불 대상"
            labelPosition="left"
            placeholder="지갑 주소: 0xab..."
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
          />
        </Form.Field>
        <Message error header="Error!" content={errorMessage} />
        <Button primary loading={loading}>
          요청
        </Button>
      </Form>
    </Layout>
  );
}

export default NewRequest;
