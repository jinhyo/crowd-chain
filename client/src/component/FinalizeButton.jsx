import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Label } from "semantic-ui-react";
import { ethActions } from "../features/ethSlice";
import { userSelector } from "../features/userSlice";

function FinalizeButton({ approveReady, request, campaignContract, id, web3 }) {
  const dispatch = useDispatch();

  const loginUserID = useSelector(userSelector.loginUserID);

  const finalizeRequest = useCallback(async () => {
    try {
      const [account] = await web3.eth.getAccounts();
      await campaignContract.methods
        .finalizeRequest(id, loginUserID)
        .send({ from: account });

      dispatch(ethActions.callGetRequest());
    } catch (error) {
      console.error(error);
    }
  }, []);

  if (request.complete) {
    return (
      <Button
        disabled={request.complete}
        size="mini"
        color="teal"
        onClick={finalizeRequest}
      >
        지급 완료
      </Button>
    );
  } else if (approveReady && !request.complete) {
    return (
      <Button size="mini" color="teal" onClick={finalizeRequest}>
        지급 실행
      </Button>
    );
  } else {
    return (
      <Button disabled size="mini" color="teal" onClick={finalizeRequest}>
        투표 대기
      </Button>
    );
  }
}

export default FinalizeButton;
