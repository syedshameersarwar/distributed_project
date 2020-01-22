import React from "react";
import { Modal, Form, Input, notification } from "antd";
import { apiEndpoint } from "../util";

const CollectionCreateForm = Form.create({ name: "form_in_modal" })(
  class Form extends React.Component {
    render() {
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator } = form;
      return (
        <Modal
          visible={visible}
          title='Insert a Teacher.'
          okText='Push'
          onCancel={onCancel}
          onOk={onCreate}
          confirmLoading={this.props.loading}
        >
          <Form layout='vertical'>
            <Form.Item label='Name'>
              {getFieldDecorator("name", {
                rules: [
                  {
                    required: true,
                    message: "Please input the name of student!"
                  }
                ]
              })(<Input />)}
            </Form.Item>
            <Form.Item label='Contact'>
              {getFieldDecorator("contact", {
                rules: [
                  {
                    required: true,
                    message: "Please input the Contact of student!"
                  }
                ]
              })(<Input />)}
            </Form.Item>

            <Form.Item label='Email'>
              {getFieldDecorator("email", {
                rules: [
                  {
                    required: true,
                    message: "Please input the Email of student!"
                  }
                ]
              })(<Input />)}
            </Form.Item>
            <Form.Item label='City'>
              {getFieldDecorator("city", {
                rules: [
                  {
                    required: true,
                    message: "Please input the City of student!"
                  }
                ]
              })(<Input />)}
            </Form.Item>
            <Form.Item label='District'>
              {getFieldDecorator("district", {
                rules: [
                  {
                    required: true,
                    message: "Please input the title of collection!"
                  }
                ]
              })(<Input />)}
            </Form.Item>

            <Form.Item label='Desciption'>
              {getFieldDecorator("desc", {
                rules: [
                  {
                    required: true,
                    message: "Please input the title of collection!"
                  }
                ]
              })(<Input />)}
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  }
);

class TeacherForm extends React.Component {
  state = {
    loading: false
  };

  handleCreate = () => {
    const { form } = this.formRef.props;
    this.setState({ loading: true });
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      let route;
      if (this.props.host !== "MASTER") route = "sync";
      else route = "async";

      fetch(`${apiEndpoint}/${route}/teacher`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: localStorage.getItem("AuthToken")
        },
        body: JSON.stringify({
          host: this.props.host,
          name: values.name,
          contact: values.contact,
          email: values.email,
          city: values.city,
          district: values.district,
          desc: values.desc
        })
      })
        .then(res => res.json())
        .then(payload => {
          this.setState({ loading: false });
          this.props.close();
          form.resetFields();
          this.props.sentSignal();

          notification.success({
            message: "Success",
            description: payload.message
          });
        })
        .catch(err => {
          alert(err);
          this.setState({ loading: false });
        });
    });
  };

  saveFormRef = formRef => {
    this.formRef = formRef;
  };

  render() {
    return (
      <div>
        <CollectionCreateForm
          wrappedComponentRef={this.saveFormRef}
          visible={this.props.visible}
          onCancel={this.props.close}
          onCreate={this.handleCreate}
          loading={this.state.loading}
        />
      </div>
    );
  }
}

export default TeacherForm;
