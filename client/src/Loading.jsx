import React from "react";
import { Loader, Dimmer } from "semantic-ui-react";

const Loading = () => (
  <Dimmer active inverted>
    <Loader size="huge" />
  </Dimmer>
);

export default Loading;
