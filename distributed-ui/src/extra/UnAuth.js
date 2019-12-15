import React from "react";
import { Result, Button } from "antd";

const UnAuthorized = ({ host, history }) => (
  <Result
    status='403'
    title='403'
    subTitle={`Sorry ${host}, you are not authorized to access this page.`}
    extra={
      <Button type='primary' onClick={() => history.push("/")}>
        Back Home
      </Button>
    }
  />
);

export default UnAuthorized;
