import React, { useCallback } from "react";
import { Table, Button, Label } from "semantic-ui-react";
import ApproveButton from "./ApproveButton";
import FinalizeButton from "./FinalizeButton";

function RequestRow({
  id,
  web3,
  request,
  contributorsCount,
  campaignContract
}) {
  const { Row, Cell } = Table;
  const approveReady = request.approvalCounts > parseInt(contributorsCount / 2);

  return (
    <Row
      disabled={request.complete}
      warning={approveReady && !request.complete}
    >
      <Cell textAlign="center">{id + 1}</Cell>
      <Cell>{request.description}</Cell>
      <Cell>{web3.utils.fromWei(request.value)} Ether</Cell>
      <Cell>{request.recipient}</Cell>
      <Cell textAlign="center">
        <ApproveButton
          id={id}
          web3={web3}
          request={request}
          contributorsCount={contributorsCount}
          approveReady={approveReady}
          campaignContract={campaignContract}
        />
      </Cell>

      <Cell textAlign="center">
        <FinalizeButton
          id={id}
          web3={web3}
          request={request}
          contributorsCount={contributorsCount}
          approveReady={approveReady}
          campaignContract={campaignContract}
        />
      </Cell>
    </Row>
  );
}

export default RequestRow;
