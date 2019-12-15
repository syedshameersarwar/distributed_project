import React, { useState } from "react";
import Data from "../Containers/Data";
import { Affix, Button, Tooltip, Typography, Select } from "antd";
const { Option } = Select;
const { Title } = Typography;

const Home = ({ host, logout, history }) => {
  const [table, setTable] = useState("student");
  const handleChange = value => setTable(value);

  return (
    <div>
      <br />
      <br />
      <div className='nav-bar'>
        <Affix offsetTop={60}>
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
        </Select>
      </div>

      <Data host={host} table={table} />
    </div>
  );
};

export default Home;
