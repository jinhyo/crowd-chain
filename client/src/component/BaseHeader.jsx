import React, { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Menu, Icon, Image, Dropdown, Header } from "semantic-ui-react";
import { Link, useHistory } from "react-router-dom";

import { userActions, userSelector } from "../features/userSlice";
import firebaseFuntions from "../firebase";

function BaseHeader() {
  const dispatch = useDispatch();

  const loginUser = useSelector(userSelector.loginUser);
  const history = useHistory();

  const logout = useCallback(async () => {
    try {
      await firebaseFuntions.logOut();
      dispatch(userActions.clearLoginUser());
      history.push("/");
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <>
      <Menu style={{ marginTop: "10px" }}>
        <Link to="/" className="item">
          <Icon name="home" color="teal" />
        </Link>
        {loginUser ? (
          <>
            <Link to="/public" className="item">
              <p>나의 프로젝트</p>
            </Link>
            <Link to="/new/campaign" className="item">
              프로젝트 만들기
            </Link>
          </>
        ) : null}

        <Menu.Menu position="right">
          {loginUser ? (
            <>
              <Dropdown
                trigger={
                  <Header
                    className="item"
                    as="h5"
                    inverted
                    style={{ paddingTop: 7, paddingBottom: 0 }}
                  >
                    <Image
                      src={loginUser.avatarURL}
                      spaced="right"
                      avatar
                      size="mini"
                    />
                    {loginUser.nickname}
                  </Header>
                }
                icon={null}
                pointing="top left"
              >
                <Dropdown.Menu>
                  <Dropdown.Item onClick={logout}>로그아웃</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </>
          ) : (
            <>
              <Link to="/login" className="item">
                <p>로그인</p>
              </Link>
            </>
          )}
        </Menu.Menu>
      </Menu>
    </>
  );
}

export default BaseHeader;
