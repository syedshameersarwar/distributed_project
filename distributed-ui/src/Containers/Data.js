import React, { useEffect, useState } from "react";
import { Form, Icon, Input, Button, notification } from "antd";
import axios from "axios";
import { apiEndpoint } from "../util";

axios.defaults.headers.common["Authorization"] = localStorage.getItem(
  "AuthToken"
);
axios.defaults.headers.post["Content-Type"] = "application/json; charset=utf-8";

const Data = props => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [mail, setMail] = useState("");

  useEffect(() => {
    props.form.validateFields();
    return;
  }, []);

  const handleChange = e => {
    if (e.target.placeholder === "Name") setName(e.target.value);
    else if (e.target.placeholder === "Email") setMail(e.target.value);
    else if (e.target.placeholder === "Contact No") setContact(e.target.value);
  };

  const {
    getFieldDecorator,
    getFieldsError,
    getFieldError,
    isFieldTouched
  } = props.form;

  const nameError = isFieldTouched("name") && getFieldError("name");
  const emailError = isFieldTouched("mail") && getFieldError("mail");
  const contactError = isFieldTouched("contact") && getFieldError("contact");

  const hasErrors = fieldErrors =>
    Object.keys(fieldErrors).some(field => fieldErrors[field]);

  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        let route;
        setLoading(true);
        if (props.host !== "MASTER") route = "sync";
        else route = "async";

        axios
          .post(`${apiEndpoint}api/${route}/${props.table}`, {
            name: values.name,
            email: values.email,
            contact: values.contact,
            host: props.host
          })
          .then(payload => {
            setLoading(false);
            if (payload.status === 200 || payload.data.query_status === true) {
              notification.success({
                message: "Success",
                description: payload.data.message
              });
              props.form.setFields({
                name: {
                  value: "",
                  error: null
                },
                email: {
                  value: "",
                  error: null
                },
                contact: {
                  value: "",
                  error: null
                }
              });

              setMail("");
              setName("");
              setContact("");
            }
          })
          .catch(err => {
            setLoading(false);
            console.error("Error in Insertion: ", err);
            // notification.success({
            //   message: "Fail",
            //   description: err.response
            // });
          });
      }
    });
  };

  return (
    <div className='data-form'>
      <Form onSubmit={handleSubmit}>
        <Form.Item
          validateStatus={nameError ? "error" : ""}
          help={nameError || ""}
        >
          {getFieldDecorator("name", {
            rules: [
              { required: true, message: `Please input ${props.table}'s name!` }
            ]
          })(
            <Input
              prefix={<Icon type='user' style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder='Name'
              onChange={handleChange}
            />
          )}
        </Form.Item>

        <Form.Item
          validateStatus={emailError ? "error" : ""}
          help={emailError || ""}
        >
          {getFieldDecorator("email", {
            rules: [
              {
                required: true,
                message: `Please input ${props.table}'s email!`
              }
            ]
          })(
            <Input
              prefix={<Icon type='mail' style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder='Email'
              onChange={handleChange}
            />
          )}
        </Form.Item>

        <Form.Item
          validateStatus={contactError ? "error" : ""}
          help={contactError || ""}
        >
          {getFieldDecorator("contact", {
            rules: [
              {
                required: true,
                message: `Please input ${props.table}'s contact!`
              }
            ]
          })(
            <Input
              prefix={
                <Icon type='contacts' style={{ color: "rgba(0,0,0,.25)" }} />
              }
              placeholder='Contact No'
              onChange={handleChange}
            />
          )}
        </Form.Item>
        <br />
        <Form.Item>
          <Button
            type='primary'
            htmlType='submit'
            disabled={
              loading ||
              hasErrors(getFieldsError()) ||
              name === "" ||
              contact === "" ||
              mail === ""
            }
            icon='database'
            loading={loading}
          >
            Insert
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Form.create({ name: "entry_form" })(Data);
