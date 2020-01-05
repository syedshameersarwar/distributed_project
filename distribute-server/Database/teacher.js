import { getConnectionOrder, getHostConnection, promisify } from "../util";
import {
  master_connection,
  slave_a_connection,
  slave_b_connection
} from "./connection";
import mysql from "mysql2";

export const insertAll = async (dataObj, master = true) => {
  try {
    const insertQuery =
      "INSERT INTO `teacher`(name, contact, email, city,\
            district, `desc`, host, orig_id)\
             VALUES(?, ?, ?, ?, ?, ?, ?, ?)";

    const { name, contact, email, city, district, desc, host } = dataObj;
    let transaction_source, orig_id, payload, source_id;

    const [first_db, second_db, third_db] = getConnectionOrder(
      master_connection,
      slave_a_connection,
      slave_b_connection,
      host,
      master
    );
    console.log(name, contact, email, city, district, desc, host);
    if (!master) {
      transaction_source = "MASTER";
      orig_id = dataObj.id;
    }
    console.log(email);
    payload = await promisify(first_db, insertQuery, [
      name,
      contact,
      email,
      city,
      district,
      desc,
      transaction_source || "LOCAL",
      orig_id || "null"
    ]);
    if (payload.isError) return payload.err;
    source_id = payload.result.insertId;
    console.log("first");
    payload = await promisify(second_db, insertQuery, [
      name,
      contact,
      email,
      city,
      district,
      desc,
      transaction_source || host,
      orig_id || String(source_id)
    ]);
    if (payload.isError) return payload.err;

    if (third_db) {
      payload = await promisify(third_db, insertQuery, [
        name,
        contact,
        email,
        city,
        district,
        desc,
        host,
        String(source_id)
      ]);
      if (payload.isError) return payload.err;
    }
    return true;
  } catch (err) {
    console.log(err);
    return err;
  }
};

export const insertOne = async dataObj => {
  try {
    const insertQuery =
      "INSERT INTO `teacher`(name, contact, email,\
            city, district, `desc`,host, orig_id) \
             VALUES(?, ?, ?, ?, ?, ?, ?, ?)";

    const { name, contact, email, city, district, desc, host } = dataObj;

    const target_host = getHostConnection(
      host,
      master_connection,
      slave_a_connection,
      slave_b_connection
    );
    const payload = await promisify(target_host, insertQuery, [
      name,
      contact,
      email,
      city,
      district,
      desc,
      "LOCAL",
      "null"
    ]);

    if (payload.isError) return payload.err;
    return payload.result.insertId;
  } catch (err) {
    console.log(err);
    return err;
  }
};

export const selectAll = async (host, start, rows) => {
  //start,rows: num
  try {
    const selectQuery = "SELECT * FROM `teacher` LIMIT ?, ?";
    const lengthQuery = "SELECT COUNT(*) AS TOTAL FROM `teacher`";

    const target_host = getHostConnection(
      host,
      master_connection,
      slave_a_connection,
      slave_b_connection
    );

    let payload = await promisify(target_host, selectQuery, [
      Number(start),
      Number(rows)
    ]);

    if (payload.isError) return payload.err;

    const response = {};
    response.data = payload.result;

    payload = await promisify(target_host, lengthQuery);
    if (payload.isError) return payload.err;
    response.length = payload.result[0]["TOTAL"];
    return response;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export const deleteAll = async (host, id) => {
  //expects host and id from route,(frontend)
  try {
    const deleteSourceQuery = "DELETE FROM `teacher` WHERE id = ?";
    const deleteDestQuery = "DELETE FROM `teacher` WHERE orig_id = ?";
    const deleteTmp =
      "DELETE FROM `tmp` WHERE record_id = ? AND record_type = 1";

    const [first_db, second_db, third_db] = getConnectionOrder(
      master_connection,
      slave_a_connection,
      slave_b_connection,
      host,
      true
    );

    let payload;

    payload = await promisify(first_db, deleteSourceQuery, id);
    if (payload.isError) return payload.err;

    if (payload.result.affectedRows !== 1) return false;

    payload = await promisify(master_connection, deleteTmp, id);
    if (payload.isError) return payload.err;

    if (payload.result.affectedRows === 1) return true;

    payload = await promisify(second_db, deleteDestQuery, id);
    if (payload.isError) return payload.err;

    if (payload.result.affectedRows !== 1) return false;

    payload = await promisify(third_db, deleteDestQuery, id);
    if (payload.isError) return payload.err;

    if (payload.result.affectedRows !== 1) return false;
    return true;
  } catch (err) {
    console.log(err);
    return err;
  }
};

export const updateAll = async (host, id, dataObj) => {
  //expects host from route, dataObj(frontend)
  try {
    const updateSourceQuery =
      "UPDATE `teacher` SET name = ?, contact = ?, email = ?, \
   city = ?, district = ? , `desc` = ? WHERE id = ?";
    const updateDestQuery =
      "UPDATE `teacher` SET name = ?, contact = ?, email = ?, \
   city = ?, district = ?, `desc` = ? WHERE orig_id = ?";

    const { name, contact, email, city, district, desc } = dataObj;
    console.log(name, contact, email, city, district, desc);
    const [first_db, second_db, third_db] = getConnectionOrder(
      master_connection,
      slave_a_connection,
      slave_b_connection,
      host,
      true
    );
    let payload;

    payload = await promisify(first_db, updateSourceQuery, [
      name,
      contact,
      email,
      city,
      district,
      desc,
      id
    ]);
    if (payload.isError) return payload.err;

    if (payload.result.affectedRows !== 1) return false;

    payload = await promisify(second_db, updateDestQuery, [
      name,
      contact,
      email,
      city,
      district,
      desc,
      id
    ]);
    if (payload.isError) return payload.err;

    if (payload.result.affectedRows !== 1) return false;

    payload = await promisify(third_db, updateDestQuery, [
      name,
      contact,
      email,
      city,
      district,
      desc,
      id
    ]);
    if (payload.isError) return payload.err;

    if (payload.result.affectedRows !== 1) return false;
    return true;
  } catch (err) {
    console.log(err);
    return err;
  }
};

// const data = {
//   name:"teacher bhai"
//   contact:"098989899",
//   email:"67556675gfgh@gmail.com"
//   city:"Karachi"
//   district:
//   desc
// };
