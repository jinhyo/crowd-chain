import React from "react";
import { Button, Divider } from "semantic-ui-react";
import { Link } from "react-router-dom";

function UseFundingButton({ address }) {
  return (
    <>
      <Divider />
      <Link to={`/new/request/${address}`}>
        <Button fluid style={{ marginBottom: "10px" }} primary size="medium">
          <p>펀딩 사용 요청</p>
        </Button>
      </Link>
    </>
  );
}

export default UseFundingButton;
