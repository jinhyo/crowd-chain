import React, { useEffect, useState } from "react";
import { Table } from "semantic-ui-react";

import ApproveButton from "./ApproveButton";
import FinalizeButton from "./FinalizeButton";

function RequestRow({
  id,
  web3,
  request,
  contributorsCount,
  campaignContract,
}) {
  const [approveReady, setapproveReady] = useState(false);
  const [contributors, setContributors] = useState([]);
  const [managerID, setManagerID] = useState("");

  useEffect(() => {
    if (campaignContract) {
      getParticipantsInfo(campaignContract);
    }
    const approveReady =
      request.approvalCounts > parseInt(contributorsCount / 2);
    setapproveReady(approveReady);
  }, [campaignContract, request]);

  async function getParticipantsInfo(campaignContract) {
    try {
      const result = await campaignContract.methods.getParticipants().call();
      setManagerID(result[0]);
      setContributors(result[1]);
    } catch (error) {
      console.error(error);
    }
  }

  const { Row, Cell } = Table;

  return (
    <Row
      disabled={request.complete}
      warning={approveReady && !request.complete}
    >
      <Cell textAlign="center">{id + 1}</Cell>
      <Cell>{decodeURIComponent(request.description)}</Cell>
      <Cell>{web3.utils.fromWei(request.value)} Ether</Cell>
      <Cell>{request.recipient}</Cell>
      <Cell textAlign="center">
        <ApproveButton
          id={id}
          request={request}
          contributorsCount={contributorsCount}
          approveReady={approveReady}
          campaignContract={campaignContract}
          contributors={contributors}
        />
      </Cell>

      <Cell textAlign="center">
        <FinalizeButton
          id={id}
          request={request}
          contributorsCount={contributorsCount}
          approveReady={approveReady}
          campaignContract={campaignContract}
          managerID={managerID}
          contributors={contributors}
        />
      </Cell>
    </Row>
  );
}

export default RequestRow;
