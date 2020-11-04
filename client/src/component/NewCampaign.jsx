import React, { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import Layout from "./Layout";
import { ethSelector } from "../features/ethSlice";
import useInput from "../hooks/useInput";
import {
  Form,
  Input,
  Button,
  Message,
  GridColumn,
  Grid,
  Divider,
  Header,
  TextArea,
  Segment,
} from "semantic-ui-react";
import { userSelector } from "../features/userSlice";
import firebaseFuntions from "../firebase";

function NewCampaign({ history }) {
  const { web3, factoryContract } = useSelector(ethSelector.all);
  const currentAccount = useSelector(ethSelector.currentAccount);
  const loginUser = useSelector(userSelector.loginUser);

  const [errorMessage, setErrorMessage] = useInput("");
  const [input, setInput] = useState({
    topic: "",
    minimumContribution: "",
    description: "",
  });
  const [loading, setLoading] = useInput(false);

  const handleInputChange = useCallback((e) => {
    e.persist();
    setInput((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const onClickSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      setErrorMessage("");

      if (!input.minimumContribution) {
        setLoading(false);
        return setErrorMessage("최소 후원비용을 입력하세요.");
      } else if (
        typeof Number(input.minimumContribution) !== "number" ||
        Number(input.minimumContribution) <= 0
      ) {
        setLoading(false);
        return setErrorMessage("최소 후원비용은 0 이상의 금액을 입력하세요");
      } else if (!input.topic) {
        setLoading(false);
        return setErrorMessage("프로젝트명을 정하세요");
      } else if (!input.description) {
        setLoading(false);
        return setErrorMessage("프로젝트 설명을 작성하세요");
      }

      try {
        const isAvailable = await firebaseFuntions.checkDuplicateName(
          input.topic
        );

        if (!isAvailable) {
          setLoading(false);
          return setErrorMessage("동일한 프로젝트명이 있습니다.");
        }
        const minimumEther = web3.utils.toWei(input.minimumContribution);
        console.log("loginUser.id", loginUser.id);

        const project = await factoryContract.methods
          .createCampaign(minimumEther, encodeURIComponent(loginUser.id))
          .send({ from: currentAccount });
        console.log("`project", project);
        console.log(
          "`project.events.NewCampaign.returnValues.ownerID",
          project.events.NewCampaign.returnValues.ownerID
        );
        console.log(
          "`web3.utils.keccak256(loginUser.id",
          web3.utils.keccak256(loginUser.id)
        );
        const newProject = {
          address: project.events.NewCampaign.returnValues.campaignAddress,
          managerAccount: project.events.NewCampaign.returnValues.ownerAddress,
          managerID: loginUser.id,
          minimymContribution: Number(input.minimumContribution),
          createdAt: new Date(),
          description: input.description,
          managerNickname: loginUser.nickname,
          name: input.topic,
          participants: [],
          totalContribution: 0,
          pictureURL:
            "https://lh3.googleusercontent.com/-ByjfnGJ7388/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuckCNlm5FokVcty6O46xwZwTgrDITw/s96-c/photo.jpg",
        };
        await firebaseFuntions.createProject(newProject);
        setLoading(false);
        history.push("/");
        console.log("done");
      } catch (error) {
        setErrorMessage(error.message);
        setLoading(false);
      }
    },
    [input, web3, currentAccount, factoryContract, loginUser]
  );

  return (
    <Layout>
      <Grid textAlign="center" verticalAlign="middle">
        <GridColumn width={10}>
          <Divider hidden />
          <Segment basic>
            <Header as="h2">새 프로젝트 </Header>
          </Segment>
          <Segment stacked>
            <Form onSubmit={onClickSubmit} error={!!errorMessage}>
              <Form.Field>
                <Input
                  placeholder="프로젝트명"
                  name="topic"
                  value={input.topic}
                  onChange={handleInputChange}
                />
              </Form.Field>
              <Form.Field>
                <Input
                  name="minimumContribution"
                  label="ETHER"
                  labelPosition="right"
                  placeholder="최소 후원비용"
                  value={input.minimumContribution}
                  onChange={handleInputChange}
                />
              </Form.Field>
              <Form.Field>
                <TextArea
                  name="description"
                  placeholder="설명"
                  onChange={handleInputChange}
                  value={input.description}
                ></TextArea>
              </Form.Field>

              <Message error header={errorMessage} />
              <Button primary loading={loading}>
                프로젝트 등록
              </Button>
            </Form>
          </Segment>
        </GridColumn>
      </Grid>
    </Layout>
  );
}

export default NewCampaign;
