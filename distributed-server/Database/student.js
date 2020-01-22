import {
  master_connection,
  slave_a_connection,
  slave_b_connection
} from "./connection";
import { getHostConnection, getConnectionOrder, promisify } from "../util";

export const insertAll = async (dataObj, master = true) => {
  try {
    const insertQuery =
      "INSERT INTO `student`(name, contact, email, grade,\
            city, district, address, host, orig_id)\
             VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)";

    const {
      name,
      contact,
      email,
      grade,
      city,
      district,
      address,
      host
    } = dataObj;
    let transaction_source, orig_id, payload, source_id;

    const [first_db, second_db, third_db] = getConnectionOrder(
      master_connection,
      slave_a_connection,
      slave_b_connection,
      host,
      master
    );

    if (!master) {
      transaction_source = "MASTER";
      orig_id = dataObj.id;
    }

    payload = await promisify(first_db, insertQuery, [
      name,
      contact,
      email,
      grade,
      city,
      district,
      address,
      transaction_source || "LOCAL",
      orig_id || "null"
    ]);
    if (payload.isError) return payload.err;
    source_id = payload.result.insertId;

    payload = await promisify(second_db, insertQuery, [
      name,
      contact,
      email,
      grade,
      city,
      district,
      address,
      transaction_source || host,
      orig_id || String(source_id)
    ]);
    if (payload.isError) return payload.err;

    if (third_db) {
      payload = await promisify(third_db, insertQuery, [
        name,
        contact,
        email,
        grade,
        city,
        district,
        address,
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
      "INSERT INTO `student`(name, contact, email, grade, \
            city, district, address, host, orig_id) \
             VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)";

    const {
      name,
      contact,
      email,
      grade,
      city,
      district,
      address,
      host
    } = dataObj;

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
      grade,
      city,
      district,
      address,
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
  try {
    const selectQuery = "SELECT * FROM `student` LIMIT ?, ?";
    const lengthQuery = "SELECT COUNT(*) AS TOTAL FROM `student`";

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
  try {
    const deleteSourceQuery = "DELETE FROM `student` WHERE id = ?";
    const deleteDestQuery = "DELETE FROM `student` WHERE orig_id = ?";
    const deleteTmp =
      "DELETE FROM `tmp` WHERE record_id = ? AND record_type = 0";

    const [first_db, second_db, third_db] = getConnectionOrder(
      master_connection,
      slave_a_connection,
      slave_b_connection,
      host,
      true
    );

    let payload;

    payload = await promisify(first_db, deleteSourceQuery, id.toString());
    if (payload.isError) return payload.err;

    if (payload.result.affectedRows !== 1) return false;

    payload = await promisify(master_connection, deleteTmp, id.toString());
    if (payload.isError) return payload.err;

    if (payload.result.affectedRows === 1) return true;

    payload = await promisify(second_db, deleteDestQuery, id.toString());
    if (payload.isError) return payload.err;

    if (payload.result.affectedRows !== 1) return false;

    payload = await promisify(third_db, deleteDestQuery, id.toString());
    if (payload.isError) return payload.err;

    if (payload.result.affectedRows !== 1) return false;

    return true;
  } catch (err) {
    console.log(err);
    return err;
  }
};

export const updateAll = async (host, id, dataObj) => {
  try {
    const updateSourceQuery =
      "UPDATE `student` SET name = ?, contact = ?, email = ?, grade = ?, \
   city = ?, district = ?, address = ? WHERE id = ?";
    const updateDestQuery =
      "UPDATE `student` SET name = ?, contact = ?, email = ?, grade = ?, \
   city = ?, district = ?, address = ? WHERE orig_id = ?";

    const { name, contact, email, grade, city, district, address } = dataObj;
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
      grade,
      city,
      district,
      address,
      id.toString()
    ]);
    if (payload.isError) return payload.err;

    if (payload.result.affectedRows !== 1) return false;

    payload = await promisify(second_db, updateDestQuery, [
      name,
      contact,
      email,
      grade,
      city,
      district,
      address,
      id.toString()
    ]);
    if (payload.isError) return payload.err;

    if (payload.result.affectedRows !== 1) return false;

    payload = await promisify(third_db, updateDestQuery, [
      name,
      contact,
      email,
      grade,
      city,
      district,
      address,
      id.toString()
    ]);
    if (payload.isError) return payload.err;

    if (payload.result.affectedRows !== 1) return false;
    return true;
  } catch (err) {
    console.log(err);
    return err;
  }
};
