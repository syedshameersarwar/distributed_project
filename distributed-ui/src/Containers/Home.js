import React, { useState } from "react";
import { Affix, Button, Tooltip, Typography, Select } from "antd";
import StudentTable from "./StudentTable";
import TeacherTable from "./TeacherTable";
import InviteTable from "./InviteTable";
import StudentForm from "./StudentForm";
import TeacherForm from "./TeacherForm";
import InviteForm from "./InviteForm";
const { Option } = Select;
const { Title } = Typography;

const Home = ({ host, logout, history }) => {
  const [table, setTable] = useState("student");
  const [signal, setSignal] = useState(false);
  const [visible, setVisible] = useState(false);
  const [affixEnable] = useState(60);
  const handleChange = value => {
    setTable(value);
    setVisible(false);
  };

  const resetSignal = () => {
    setSignal(false);
  };
  const sentSignal = () => {
    setSignal(true);
  };
  const showModal = () => setVisible(true);
  const close = () => setVisible(false);

  return (
    <div>
      <br />
      <br />
      <div className='nav-bar'>
        {affixEnable && (
          <Affix offsetTop={affixEnable} style={{ position: "relative" }}>
            <div>
              <div className='nav-bar-right'>
                <Tooltip
                  title={
                    host && host === "MASTER"
                      ? "Perform Transaction"
                      : "Only Master can Access"
                  }
                >
                  <Button
                    type='primary'
                    disabled={host && host === "MASTER" ? false : true}
                    onClick={() => history.push("/control")}
                    icon='control'
                  >
                    Control Panel
                  </Button>
                </Tooltip>
              </div>
              <div className='nav-bar-left'>
                <Button type='primary' icon='poweroff' onClick={() => logout()}>
                  Logout
                </Button>
              </div>
            </div>
          </Affix>
        )}
      </div>
      <div className='center-host'>
        <Title level={2} style={{ color: "rgba(0, 0, 0, 0.75)" }}>
          Status: {host}
        </Title>
      </div>
      <div className='form'>
        <Select
          defaultValue={table}
          style={{ width: 120 }}
          onChange={handleChange}
          size='large'
          autoFocus
        >
          <Option value='student'>Student</Option>
          <Option value='teacher'>Teacher</Option>
          <Option value='invite'>Invite</Option>
        </Select>
        {"   "}
        <Button
          type='primary'
          shape='circle'
          icon='plus'
          onClick={showModal}
          size='large'
        />
      </div>

      {table === "student" ? (
        <StudentForm
          visible={visible}
          host={host}
          sentSignal={sentSignal}
          close={close}
        />
      ) : table === "teacher" ? (
        <TeacherForm
          visible={visible}
          host={host}
          sentSignal={sentSignal}
          close={close}
        />
      ) : (
        <InviteForm
          visible={visible}
          host={host}
          sentSignal={sentSignal}
          close={close}
        />
      )}
      <br />
      {table === "student" ? (
        <StudentTable host={host} signal={signal} resetSignal={resetSignal} />
      ) : table === "teacher" ? (
        <TeacherTable host={host} signal={signal} resetSignal={resetSignal} />
      ) : (
        <InviteTable host={host} signal={signal} resetSignal={resetSignal} />
      )}
      <br />
    </div>
  );
};

export default Home;
