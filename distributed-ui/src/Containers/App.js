import React, { useState } from "react";
import { Route } from "react-router-dom";
import Home from "../Components/Home";
import Control from "./Control";
import UnAuthorized from "../extra/UnAuth";
import Login from "./Login";

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [host, setHost] = useState(null);

  const authorizer = payload => {
    const { token, source } = payload;
    setHost(source);
    setAuthenticated(true);
    localStorage.setItem("AuthToken", `Bearer ${token}`);
  };

  const logoutHandler = () => {
    setHost(null);
    setAuthenticated(false);
    localStorage.removeItem("AuthToken");
  };

  return (
    <div>
      <Route
        exact
        path='/'
        render={({ history }) =>
          authenticated ? (
            <Home host={host} logout={logoutHandler} history={history} />
          ) : (
            <Login authorizer={authorizer} />
          )
        }
      />

      <Route
        path='/control'
        render={props =>
          authenticated ? (
            host === "MASTER" ? (
              <Control
                host={host}
                logout={logoutHandler}
                history={props.history}
              />
            ) : (
              <UnAuthorized host={host} history={props.history} />
            )
          ) : (
            props.history.push("/")
          )
        }
      />
    </div>
  );
};

export default App;
