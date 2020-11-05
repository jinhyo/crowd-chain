import React, { useCallback, useRef, useState } from "react";
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
  Card,
  Image,
} from "semantic-ui-react";
import { userSelector } from "../features/userSlice";
import firebaseFuntions from "../firebase";

function NewCampaign({ history }) {
  const imageRef = useRef();

  const { web3, factoryContract } = useSelector(ethSelector.all);
  const currentAccount = useSelector(ethSelector.currentAccount);
  const loginUser = useSelector(userSelector.loginUser);

  const [errorMessage, setErrorMessage] = useInput("");
  const [loading, setLoading] = useInput(false);
  const [input, setInput] = useState({
    topic: "",
    minimumContribution: "",
    description: "",
  });
  const [previewImageURL, setPreviewImageURL] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const handleInputChange = useCallback((e) => {
    e.persist();
    setErrorMessage("");
    setInput((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const handleImageChange = useCallback((e) => {
    if (e.target.files.length > 0) {
      setErrorMessage("");
      const [image] = e.target.files;
      console.log("image", image);
      console.log("image", image.type);
      const reader = new FileReader();

      reader.readAsDataURL(image);
      reader.onload = () => {
        setPreviewImageURL(reader.result);
        setImageFile(image);
      };
    }
  }, []);

  const handleImageInput = useCallback(() => {
    if (imageRef.current) {
      imageRef.current.click();
    }
  }, [imageRef]);

  const onClickSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      setErrorMessage("");

      if (!input.topic) {
        setLoading(false);
        return setErrorMessage("프로젝트명을 정하세요");
      } else if (!input.minimumContribution) {
        setLoading(false);
        return setErrorMessage("최소 후원비용을 입력하세요.");
      } else if (
        typeof Number(input.minimumContribution) !== "number" ||
        Number(input.minimumContribution) <= 0
      ) {
        setLoading(false);
        return setErrorMessage("최소 후원비용은 0 이상의 금액을 입력하세요");
      } else if (!input.description) {
        setLoading(false);
        return setErrorMessage("프로젝트 설명을 작성하세요");
      } else if (!previewImageURL) {
        setLoading(false);
        return setErrorMessage("이미지를 추가하세요");
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

        const [account] = await web3.eth.getAccounts();
        const project = await factoryContract.methods
          .createCampaign(minimumEther, encodeURIComponent(loginUser.id))
          .send({ from: account });

        const imageURL = await firebaseFuntions.uploadImage(imageFile);
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
          pictureURL: imageURL,
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
    [input, web3, factoryContract, loginUser, imageFile]
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
            {previewImageURL && (
              <Card centered>
                <Image src={previewImageURL} />
              </Card>
            )}

            <Form error={!!errorMessage}>
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
              <Button primary loading={loading} onClick={onClickSubmit}>
                프로젝트 등록
              </Button>
              <Button
                icon="picture"
                color="instagram"
                onClick={handleImageInput}
              />
            </Form>
            <input
              type="file"
              hidden
              ref={imageRef}
              onChange={handleImageChange}
            />
          </Segment>
        </GridColumn>
      </Grid>
    </Layout>
  );
}

export default NewCampaign;
