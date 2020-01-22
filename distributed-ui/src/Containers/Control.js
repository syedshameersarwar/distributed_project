import React, { useState } from "react";
import { Affix, Button, Spin, Icon, notification } from "antd";
import { apiEndpoint } from "../util";

const Control = ({ host, logout, history }) => {
  const [loading, setLoading] = useState(false);

  const handleTransaction = () => {
    setLoading(true);

    fetch(`${apiEndpoint}/async`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: localStorage.getItem("AuthToken")
      }
    })
      .then(res => res.json())
      .then(payload => {
        setLoading(false);

        if (payload.status === 200 || payload.query_status === true)
          notification.success({
            message: "Success",
            description: payload.message
          });
      })
      .catch(err => {
        setLoading(false);
        console.error("Error in Transaction: ", err);
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
