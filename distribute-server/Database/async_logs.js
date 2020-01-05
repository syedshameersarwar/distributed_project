import { master_connection } from "./connection";
import { promisify } from "../util";
import mysql from "mysql2";

export const insert = async (desc = "None") => {
  const query = "INSERT INTO `async_logs` SET `desc` = " + mysql.escape(desc);
  const payload = await promisify(master_connection, query);
  if (payload.isError) return payload.err;
  return true;
};

export const dlt = async id => {
  const query = "DELETE FROM `async_logs` WHERE transaction_id = ?";
  const payload = await promisify(master_connection, query, id);
  if (payload.isError) return payload.err;
  return true;
};

export const update = async (id, desc) => {
  const query = "UPDATE `async_logs` SET `desc` = ? WHERE transaction_id = ?";
  const payload = await promisify(master_connection, query, [desc, id]);
  if (payload.isError) return payload.err;
  return true;
};

export const select = async (start, rows) => {
  try {
    const query = "SELECT * FROM `async_logs` LIMIT ?,?";
    const lengthQuery = "SELECT COUNT(*) AS TOTAL FROM `async_logs`";

    let payload = await promisify(master_connection, query, [
      Number(start),
      Number(rows)
    ]);
    if (payload.isError) return payload.err;

    const response = {};
    response.data = payload.result;

    payload = await promisify(master_connection, lengthQuery);
    if (payload.isError) return payload.err;
    response.length = payload.result[0]["TOTAL"];
    return response;
  } catch (err) {
    console.log(err);
    return false;
  }
};
