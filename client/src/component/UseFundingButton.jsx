import React from "react";
import { Button } from "semantic-ui-react";
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
