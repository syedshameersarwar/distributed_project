import React from "react";
import {
  Modal,
  Form,
  Select,
  Typography,
  notification,
  message as msg
} from "antd";
import { apiEndpoint } from "../util";

const { Text } = Typography;
const { Option } = Select;

const CollectionCreateForm = Form.create({ name: "form_in_modal" })(
  class Form extends React.Component {
    state = {
      studentName: "",
      teacherName: "",
      value: "disabled"
    };

    handleStudentChange = value => {
      const [student] = this.props.data.studentMeta.filter(s => s.id === value);
      this.setState({ studentName: student.name, value });
    };

    handleTeacherChange = value => {
      const [teacher] = this.props.data.teacherMeta.filter(t => t.id === value);
      this.setState({ teacherName: teacher.name, value });
    };
    render() {
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator } = form;
      return (
        <Modal
          visible={visible}
          title='Insert an Invite.'
          okText='Push'
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout='vertical'>
            <Form.Item label='Student ID'>
              {getFieldDecorator("std_id", {
                rules: [
                  {
                    required: true,
                    message: "Please input the ID of student!"
                  }
                ]
              })(
                <Select
                  value={this.state.value}
                  style={{ width: 120 }}
                  onChange={this.handleStudentChange}
                >
                  <Option value='disabled' disabled>
                    Disabled
                  </Option>
                  {this.props.data.studentMeta.length > 0 &&
                    this.props.data.studentMeta.map((s, i) => (
                      <Option key={i} value={s.id}>
                        {s.id}
                      </Option>
                    ))}
                </Select>
              )}
              {"  "}
              <p> </p>
              <Text strong>{`   ${this.state.studentName}`}</Text>
            </Form.Item>

            <Form.Item label='Teacher ID'>
              {getFieldDecorator("teacher_id", {
                rules: [
                  {
                    required: true,
                    message: "Please input the ID of teacher!"
                  }
                ]
              })(
                <Select
                  value={this.state.value}
                  style={{ width: 120 }}
                  onChange={this.handleTeacherChange}
                >
                  <Option value='disabled' disabled>
                    Disabled
                  </Option>
                  {this.props.data.teacherMeta.length > 0 &&
                    this.props.data.teacherMeta.map((t, i) => (
                      <Option key={i} value={t.id}>
                        {t.id}
                      </Option>
                    ))}
                </Select>
              )}
              <p> </p>
              <Text strong>{`   ${this.state.teacherName}`}</Text>
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  }
);

class InviteForm extends React.Component {
  state = {
    sending: false,
    data: null,
    loading: true
  };

  fetchData = req_mode => {
    fetch(`${apiEndpoint}/sync/invite/meta?host=${this.props.host}`)
      .then(res => res.json())
      .then(payload => {
        const data = { ...payload };

        if (!this.checkData(data)) {
          this.setState({ data });
          if (req_mode === "mount") this.setState({ loading: false });
        }
      })
      .catch(err => {
        console.log(err);
        alert(err);
      });
  };

  checkData = data => {
    let changed = false;
    let BreakException = { error: "stop it" };

    if (!this.state.data) return false;
    const { studentMeta, teacherMeta } = data;
    const oldStdMeta = this.state.data.studentMeta;
    const oldTeacherMeta = this.state.data.teacherMeta;
    if (
      oldStdMeta.length !== studentMeta.length ||
      teacherMeta.length !== oldTeacherMeta.length
    )
      return false;
    try {
      studentMeta.forEach((s, i) => {
        if (oldStdMeta[i].id !== s.id) {
          changed = true;
          throw BreakException;
        }
      });
    } catch (err) {
      if (err !== BreakException) throw err;
      if (changed) return false;
    }
    try {
      teacherMeta.forEach((t, i) => {
        if (oldTeacherMeta[i].id !== t.id) {
          changed = true;
          throw BreakException;
        }
      });
    } catch (err) {
      if (err !== BreakException) throw err;
      if (changed) return false;
    }
    return true;
  };

  componentDidMount = () => {
    this.fetchData("mount");
  };

  componentDidUpdate = () => {
    this.fetchData("update");
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

      let response;
      fetch(`${apiEndpoint}/${route}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: localStorage.getItem("AuthToken")
        },
        body: JSON.stringify({
          host: this.props.host,
          std_id: values.std_id,
          teacher_id: values.teacher_id
        })
      })
        .then(res => {
          response = res;
          return res.json();
        })
        .then(json => {
          return response.ok ? json : Promise.reject(json);
        })
        .then(payload => {
          this.setState({ loading: false, sending: true });
          this.props.close();
          form.resetFields();

          this.props.sentSignal();
          notification.success({
            message: "Success",
            description: payload.message
          });

          this.setState({ sending: false });
        })
        .catch(err => {
          if (err.isDuplicate) msg.error(err.message);
          else alert(err);
          console.log(err);
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
        {!this.state.loading &&
          !this.state.sending &&
          (this.state.data.studentMeta.length === 0 ||
          this.state.data.teacherMeta.length === 0 ? (
            <Text className='center-host' type='danger'>
              Can't add an Invite: Insufficient Data.
            </Text>
          ) : (
            <CollectionCreateForm
              wrappedComponentRef={this.saveFormRef}
              visible={this.props.visible}
              onCancel={this.props.close}
              onCreate={this.handleCreate}
              loading={this.state.loading}
              data={this.state.data}
            />
          ))}
      </div>
    );
  }
}

export default InviteForm;
