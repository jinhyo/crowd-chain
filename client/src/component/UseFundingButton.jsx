import React, { useCallback } from "react";
import { Button, Divider } from "semantic-ui-react";
import { Link } from "react-router-dom";

function UseFundingButton({ address, managerAccount }) {
  return (
    <>
      <Link
        to={{
          pathname: `/new/request/${address}`,
          state: { managerAccount },
        }}
      >
        <Button fluid style={{ marginBottom: "10px" }} primary size="medium">
          <p>펀딩 사용 요청</p>
        </Button>
      </Link>
    </>
  );
}

export default UseFundingButton;
