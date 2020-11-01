import React, { useCallback } from "react";
import { Button, Label } from "semantic-ui-react";
import useInput from "../hooks/useInput";

function ApproveButton({
  approveReady,
  request,
  contributorsCount,
  campaignContract,
  id,
  web3
}) {
  const approveRequest = useCallback(async () => {
    try {
      const [account] = await web3.eth.getAccounts();
      await campaignContract.methods.approveRequest(id).send({ from: account });
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
