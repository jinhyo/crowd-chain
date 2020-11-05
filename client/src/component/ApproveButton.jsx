import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Label } from "semantic-ui-react";

import { ethActions, ethSelector } from "../features/ethSlice";
import { userSelector } from "../features/userSlice";

function ApproveButton({
  approveReady,
  request,
  contributorsCount,
  campaignContract,
  id,
  contributors,
}) {
  const dispatch = useDispatch();
  const loginUserID = useSelector(userSelector.loginUserID);
  const { web3 } = useSelector(ethSelector.all);

  const [approveState, setApproveState] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (campaignContract && loginUserID) {
      getApproveState(campaignContract, id, loginUserID);
    }
  }, [campaignContract, id, loginUserID, request]);

  function canIApprove(contributors, loginUserID) {
    return contributors.includes(loginUserID);
  }

  const approveRequest = useCallback(async () => {
    try {
      if (!canIApprove(contributors, loginUserID)) {
        return alert("참여자만 승인할 수 있습니다.");
      }
      setLoading(true);
      const [account] = await web3.eth.getAccounts();
      await campaignContract.methods
        .approveRequest(id, loginUserID)
        .send({ from: account });

      dispatch(ethActions.callGetRequest());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [contributors, loginUserID]);

  async function getApproveState(campaignContract, index, loginUserID) {
    try {
      const approveState = await campaignContract.methods
        .getApproveState(index, loginUserID)
        .call();

      setApproveState(approveState);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Button
      size="mini"
      disabled={approveReady || approveState}
      as="div"
      labelPosition="right"
    >
      <Button
        size="mini"
        color="teal"
        onClick={approveRequest}
        loading={loading}
      >
        {approveReady ? "과반수" : approveState ? "승인 완료" : "승인"}
      </Button>
      <Label size="mini" basic color="teal" pointing="left">
        {request.approvalCounts + " / " + contributorsCount}
      </Label>
    </Button>
  );
}

export default ApproveButton;
