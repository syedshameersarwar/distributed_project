import React, { useState } from "react";
import { Affix, Button, Spin, Icon, notification } from "antd";
import axios from "axios";
import { apiEndpoint } from "../util";

axios.defaults.headers.common["Authorization"] = localStorage.getItem(
  "AuthToken"
);

const Control = ({ host, logout, history }) => {
  const [loading, setLoading] = useState(false);

  const handleTransaction = () => {
    setLoading(true);
    axios
      .put(`${apiEndpoint}api/async`, {
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        }
      })
      .then(payload => {
        setLoading(false);
        if (payload.status === 200 && payload.data.query_status === true)
          notification.success({
            message: "Success",
            description: payload.data.message
          });
      })
      .catch(err => {
        setLoading(false);
        console.error("Error in Transaction: ", err);
        notification.success({
          message: "Failed",
          description: err.response
        });
      });
  };

  const antIcon = <Icon type='loading' style={{ fontSize: 75 }} spin />;

  return (
    <div>
      <div className='back'>
        <Button
          type='primary'
          style={{
            position: "relative",
            width: "60px",
            top: 50,
            left: 100,
            zIndex: 5,
            display: "flex",
            background: "white",
            border: "none"
          }}
          onClick={() => history.push("/")}
        >
          <Icon
            type='arrow-left'
            style={{ fontSize: "30px", color: "rgba(0, 0, 0, 0.93)" }}
          />
        </Button>
      </div>
      <div className='centered'>
        <Affix offsetTop={50}>
          <Button type='primary' icon='poweroff' onClick={() => logout()}>
            Logout
          </Button>
        </Affix>
      </div>
      <div className='centered'>
        <Affix offsetTop={80}>
          <Button
            type='primary'
            icon='interaction'
            size='large'
            style={{ background: "rgba(1, 0, 0, 0.81)", border: "black" }}
            disabled={loading}
            onClick={handleTransaction}
          >
            Start Transaction
          </Button>
        </Affix>
      </div>

      <div className='centered'>
        <Spin indicator={antIcon} spinning={loading} />
      </div>
    </div>
  );
};

export default Control;
