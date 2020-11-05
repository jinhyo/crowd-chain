import React from "react";
import { Menu, Icon, Button } from "semantic-ui-react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <>
      <Menu style={{ marginTop: "10px" }}>
        <Link to="/" className="item">
          <Icon name="home" color="teal" />
        </Link>
        <Menu.Menu position="right">
          <Link to="/" className="item">
            프로젝트
          </Link>
          <Link to="/" className="item">
            나의 프로젝트
          </Link>
          <Link to="/new/campaign" className="item">
            프로젝트 만들기
          </Link>
        </Menu.Menu>
      </Menu>
    </>
  );
}

export default Header;
