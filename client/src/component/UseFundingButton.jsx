import React from "react";
import { Button } from "semantic-ui-react";
import { Link } from "react-router-dom";

function UseFundingButton({ address }) {
  return (
    <Link to={`/new/request/${address}`}>
      <Button
        style={{ marginBottom: "10px" }}
        size="tiny"
        floated="right"
        primary
        size="medium"
      >
        <p>펀딩 사용 요청</p>- 메니저 전용 -
      </Button>
    </Link>
  );
}

export default UseFundingButton;
