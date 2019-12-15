import { createPool, createConnection } from "mysql2";
require("dotenv").config();

export let master_connection, slave_a_connection, slave_b_connection;
const getConnections = () => {
  master_connection = createPool({
    host: process.env.master_host,
    user: process.env.master_user,
    password: process.env.master_pass,
    database: process.env.DATABASE
  });

  slave_a_connection = createPool({
    host: process.env.slave_a_host,
    user: process.env.slave_a_user,
    password: process.env.slave_a_pass,
    database: process.env.DATABASE
  });

  slave_b_connection = createPool({
    host: process.env.slave_b_host,
    user: process.env.slave_b_user,
    password: process.env.slave_b_pass,
    database: process.env.DATABASE,
    port: 8889
  });
};

getConnections();
master_connection.on("error", getConnections);
slave_a_connection.on("error", getConnections);
slave_b_connection.on("error", getConnections);
