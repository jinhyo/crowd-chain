import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Label, Message } from "semantic-ui-react";
import { ethActions } from "../features/ethSlice";
import { userSelector } from "../features/userSlice";

function ApproveButton({
  approveReady,
  request,
  contributorsCount,
  campaignContract,
  id,
  web3,
}) {
  const dispatch = useDispatch();

  const loginUserID = useSelector(userSelector.loginUserID);

  const approveRequest = useCallback(async () => {
    try {
      const [account] = await web3.eth.getAccounts();
      await campaignContract.methods
        .approveRequest(id, loginUserID)
        .send({ from: account });

      dispatch(ethActions.callGetRequest());
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <Button size="mini" disabled={approveReady} as="div" labelPosition="right">
      <Button size="mini" color="teal" onClick={approveRequest}>
        {approveReady ? "과반수" : "승인"}
      </Button>
      <Label size="mini" basic color="teal" pointing="left">
        {request.approvalCounts + " / " + contributorsCount}
      </Label>
    </Button>
  );
}

export default ApproveButton;
