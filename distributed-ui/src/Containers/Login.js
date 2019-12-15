import React, { useState, useEffect } from "react";
import { Form, Icon, Input, Button, Typography, message as msg } from "antd";
import axios from "axios";
import "antd/dist/antd.css";
import { apiEndpoint } from "../util";

const { Title } = Typography;

const Login = props => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    props.form.validateFields();
    return;
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        setLoading(true);
        axios
          .post(
            `${apiEndpoint}api/login`,
            {
              user: values.hostname,
              pass: values.password
            },
            {
              headers: {
                "Content-Type": "application/json; charset=utf-8"
              }
            }
          )
          .then(payload => {
            setLoading(false);
            const { message } = payload.data;
            if (message) {
              msg.info(message);
              return;
            }

            props.authorizer(payload.data);
          })
          .catch(err => {
            setLoading(false);
            console.error("Error in Login: ", err);
          });
      }
    });
  };

  const {
    getFieldDecorator,
    getFieldsError,
    getFieldError,
    isFieldTouched
  } = props.form;

  const hostnameError = isFieldTouched("hostname") && getFieldError("hostname");
  const passError = isFieldTouched("password") && getFieldError("password");

  const hasErrors = fieldErrors =>
    Object.keys(fieldErrors).some(field => fieldErrors[field]);

  return (
    <div className='form'>
      <br />
      <br />
      <br />
      <Title level={1} style={{ color: "rgba(0, 0, 0, 0.75)" }}>
        System Gateway
      </Title>
      <br /> <br />
      <Form onSubmit={handleSubmit}>
        <Form.Item
          validateStatus={hostnameError ? "error" : ""}
          help={hostnameError || ""}
        >
          {getFieldDecorator("hostname", {
            rules: [{ required: true, message: "Please input your Hostname!" }]
          })(
            <Input
              prefix={<Icon type='user' style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder='Hostname'
            />
          )}
        </Form.Item>

        <Form.Item
          validateStatus={passError ? "error" : ""}
          help={passError || ""}
        >
          {getFieldDecorator("password", {
            rules: [{ required: true, message: "Please input your Password!" }]
          })(
            <Input
              prefix={<Icon type='lock' style={{ color: "rgba(0,0,0,.25)" }} />}
              type='password'
              placeholder='Password'
            />
          )}
        </Form.Item>
        <br />
        <Button
          type='primary'
          htmlType='submit'
          disabled={hasErrors(getFieldsError())}
          loading={loading}
          icon='api'
        >
          Log in
        </Button>
      </Form>
    </div>
  );
};

export default Form.create({ name: "normal_login" })(Login);
