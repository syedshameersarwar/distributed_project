import React from "react";
import "antd/dist/antd.css";
import "../index.css";
import {
  Table,
  Input,
  InputNumber,
  Popconfirm,
  Form,
  message as msg
} from "antd";
import { apiEndpoint } from "../util";

const EditableContext = React.createContext();

class EditableCell extends React.Component {
  getInput = () => {
    if (this.props.inputType === "number") {
      return <InputNumber />;
    }
    return <Input />;
  };

  renderCell = ({ getFieldDecorator }) => {
    const {
      editing,
      dataIndex,
      title,
      inputType,
      record,
      index,
      children,
      ...restProps
    } = this.props;

    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item style={{ margin: 0 }}>
            {getFieldDecorator(dataIndex, {
              rules: [
                {
                  required: true,
                  message: `Please Input ${title}!`
                }
              ],
              initialValue: record[dataIndex]
            })(this.getInput())}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  render() {
    return (
      <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
    );
  }
}

class InviteTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      editingKey: "",
      page: 1,
      unit: 5,
      length: 0,
      loading: true
    };
    this.columns = [
      {
        title: "ID",
        dataIndex: "invite_id",
        width: "5%",
        editable: false
      },
      {
        title: "Student ID",
        dataIndex: "std_id",
        width: "12%",
        editable: false
      },
      {
        title: "Teacher ID",
        dataIndex: "teacher_id",
        width: "12%",
        editable: false
      },
      {
        title: "Timestamp",
        dataIndex: "invite_timestamp",
        width: "8%",
        editable: false
      },
      {
        title: "Host",
        dataIndex: "host",
        width: "7%",
        editable: false
      },
      {
        title: "Orig_id",
        dataIndex: "orig_id",
        width: "7%",
        editable: false
      },
      {
        title: "Operation",
        dataIndex: "operation",
        width: "10%",
        render: (text, record) => {
          const { editingKey } = this.state;
          const editable = this.isEditing(record);

          return editable ? (
            <span>
              <EditableContext.Consumer>
                {form => (
                  <a
                    href='#!'
                    onClick={() => this.save(form, record.key)}
                    style={{ marginRight: 8 }}
                  >
                    Save
                  </a>
                )}
              </EditableContext.Consumer>
              <Popconfirm
                title='Sure to cancel?'
                onConfirm={() => this.cancel(record.key)}
              >
                <a href='#!'>Cancel</a>
              </Popconfirm>
            </span>
          ) : (
            <>
              <Popconfirm
                title='Sure to delete?'
                onConfirm={() => this.delete(record)}
              >
                <a
                  disabled={editingKey !== "" || record.host !== "LOCAL"}
                  href='#!'
                >
                  Delete
                </a>
              </Popconfirm>{" "}
            </>
          );
        }
      }
    ];
  }

  componentDidMount = () => {
    fetch(
      `${apiEndpoint}/sync/invite/${this.state.page}/${this.state.unit}?host=${this.props.host}`
    )
      .then(res => res.json())
      .then(payload => {
        const { length, data } = payload;
        const indexedData = this.getIndex(data);
        this.setState({ length, data: indexedData, loading: false });
      })
      .catch(err => alert(err));
  };

  componentDidUpdate = () => {
    if (this.props.signal === true) {
      fetch(
        `${apiEndpoint}/sync/invite/${this.state.page}/${this.state.unit}?host=${this.props.host}`
      )
        .then(res => res.json())
        .then(payload => {
          const { length, data } = payload;
          const indexedData = this.getIndex(data);
          this.props.resetSignal();
          this.setState({ length, data: indexedData, loading: false });
        })
        .catch(err => alert(err));
    }
  };

  getIndex = data => {
    return data.map((d, i) => ({ key: i.toString(), ...d }));
  };

  isEditing = record => record.key === this.state.editingKey;

  cancel = () => {
    this.setState({ editingKey: "" });
  };

  delete = record => {
    const newLength = this.state.length - 1;
    const newData = [...this.state.data];
    const index = newData.findIndex(item => record.key === item.key);
    newData.splice(index, 1);

    fetch(`${apiEndpoint}/sync/invite`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        id: record.invite_id,
        host: this.props.host
      })
    })
      .then(res => res.json())
      .then(payload => {
        this.setState({
          data: this.getIndex(newData),
          editingKey: "",
          length: newLength
        });
        const { message } = payload;
        if (message) {
          msg.info(message);
          return;
        }
      })
      .catch(err => alert(err));
  };

  paginate = (page, unit) => {
    this.setState({ page, unit: 5, loading: true });
    this.cancel();
    fetch(
      `${apiEndpoint}/sync/invite/${this.state.page}/5?host=${this.props.host}`
    )
      .then(res => res.json())
      .then(payload => {
        const { length, data } = payload;
        const indexedData = this.getIndex(data);
        this.setState({ length, data: indexedData, loading: false });
      })
      .catch(err => alert(err));
  };

  render() {
    const components = {
      body: {
        cell: EditableCell
      }
    };

    const columns = this.columns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          inputType:
            col.dataIndex === "id" || col.dataIndex === "orig_id"
              ? "number"
              : "text",
          dataIndex: col.dataIndex,
          title: col.title,
          editing: this.isEditing(record)
        })
      };
    });

    return (
      <div id='container' style={{ padding: "24px" }}>
        <EditableContext.Provider value={this.props.form}>
          <Table
            components={components}
            bordered
            dataSource={this.state.data || []}
            columns={columns}
            rowClassName='editable-row'
            loading={this.state.loading}
            pagination={{
              onChange: this.paginate,
              total: this.state.length,
              simple: true,
              pageSize: this.state.unit
            }}
          />
        </EditableContext.Provider>
      </div>
    );
  }
}

export default Form.create()(InviteTable);
