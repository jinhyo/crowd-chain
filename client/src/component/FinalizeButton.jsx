import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "semantic-ui-react";

import { ethActions, ethSelector } from "../features/ethSlice";
import { userSelector } from "../features/userSlice";

function FinalizeButton({
  approveReady,
  request,
  campaignContract,
  id,
  managerID,
  contributors,
}) {
  const dispatch = useDispatch();
  const loginUserID = useSelector(userSelector.loginUserID);
  const { web3 } = useSelector(ethSelector.all);

  const [loading, setLoading] = useState(false);

  const finalizeRequest = useCallback(async () => {
    if (!canIFinalize(contributors, loginUserID, managerID)) {
      return alert("매니저와 참여자만 지급을 실행할 수 있습니다.");
    }
    try {
      setLoading(true);
      const [account] = await web3.eth.getAccounts();
      await campaignContract.methods
        .finalizeRequest(id, loginUserID)
        .send({ from: account });

      dispatch(ethActions.callGetRequest());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [loginUserID, managerID, contributors]);

  function canIFinalize(contributors, loginUserID, managerID) {
    return contributors.includes(loginUserID) || loginUserID === managerID;
  }

  const renderButton = useCallback(() => {
    if (request.complete) {
      return (
        <Button disabled={request.complete} size="mini" color="teal">
          지급 완료
        </Button>
      );
    } else if (approveReady && !request.complete) {
      return (
        <Button
          size="mini"
          color="teal"
          onClick={finalizeRequest}
          loading={loading}
        >
          지급 실행
        </Button>
      );
    } else {
      return (
        <Button disabled size="mini" color="teal">
          투표 대기중
        </Button>
      );
    }
  }, [request, approveReady, contributors, loginUserID, managerID, loading]);

  return renderButton();
}

export default FinalizeButton;
