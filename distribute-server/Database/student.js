import {
  master_connection,
  slave_a_connection,
  slave_b_connection
} from "./connection";
import { getCurrentHost, getConnectionOrder, promisify } from "../util";

const query =
  "INSERT INTO `student_details`(name, contact, email, host, orig_id) \
             VALUES(?, ?, ?, ?, ?)";

export const insertAll = async (dataObj, master = true) => {
  try {
    const { name, contact, email, host } = dataObj;
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
      orig_id = dataObj.std_id;
    }

    payload = await promisify(first_db, query, [
      name,
      contact,
      email,
      transaction_source || "LOCAL",
      orig_id || "null"
    ]);
    if (payload.isError) return payload.err;
    source_id = payload.result.insertId;

    payload = await promisify(second_db, query, [
      name,
      contact,
      email,
      transaction_source || host,
      orig_id || String(source_id)
    ]);
    if (payload.isError) return payload.err;

    if (third_db) {
      payload = await promisify(third_db, query, [
        name,
        contact,
        email,
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
    const { name, contact, email } = dataObj;

    const current_host = getCurrentHost(
      master_connection,
      slave_a_connection,
      slave_b_connection
    );
    const payload = await promisify(current_host, query, [
      name,
      contact,
      email,
      "local",
      "null"
    ]);

    if (payload.isError) return payload.err;
    return payload.result.insertId;
  } catch (err) {
    console.log(err);
    return err;
  }
};
