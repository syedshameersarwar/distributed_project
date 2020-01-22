import { getConnectionOrder, getHostConnection, promisify } from "../util";
import {
  master_connection,
  slave_a_connection,
  slave_b_connection
} from "./connection";

export const insertAll = async (dataObj, master = true) => {
  try {
    const insertQuery =
      "INSERT INTO `invite`(std_id, teacher_id, invite_timestamp, host,  \
    orig_id) VALUES(?, ?, NOW(), ? , ?)";
    const origQuery =
      "SELECT `student`.id FROM `student` WHERE orig_id = ?  \
      AND host = ? UNION ALL SELECT `teacher`.id FROM `teacher` \
      WHERE orig_id = ? AND host = ?";
    const { std_id, teacher_id, host } = dataObj;

    let transaction_source, orig_id, payload, source_id, origStd, origTeach;

    const [first_db, second_db, third_db] = getConnectionOrder(
      master_connection,
      slave_a_connection,
      slave_b_connection,
      host,
      master
    );

    if (!master) {
      payload = await promisify(first_db, origQuery, [
        std_id,
        "MASTER",
        teacher_id,
        "MASTER"
      ]);

      origStd = payload.result[0].id;
      origTeach = payload.result[1].id;
      transaction_source = "MASTER";
      orig_id = dataObj.invite_id;
    }

    payload = await promisify(first_db, insertQuery, [
      origStd || std_id,
      origTeach || teacher_id,
      transaction_source || "LOCAL",
      orig_id || "null"
    ]);
    if (payload.isError) return payload.err;
    source_id = payload.result.insertId;

    payload = await promisify(second_db, origQuery, [
      std_id,
      master ? host : "MASTER",
      teacher_id,
      master ? host : "MASTER"
    ]);
    if (payload.isError) return payload.err;

    origStd = payload.result[0].id;
    origTeach = payload.result[1].id;

    payload = await promisify(second_db, insertQuery, [
      origStd,
      origTeach,
      transaction_source || host,
      orig_id || String(source_id)
    ]);
    if (payload.isError) return payload.err;

    if (third_db) {
      payload = await promisify(third_db, origQuery, [
        std_id,
        host,
        teacher_id,
        host
      ]);
      if (payload.isError) return payload.err;

      origStd = payload.result[0].id;
      origTeach = payload.result[1].id;

      payload = await promisify(third_db, insertQuery, [
        origStd,
        origTeach,
        host,
        String(source_id)
      ]);
      if (payload.isError) return payload.err;
    }
    return true;
  } catch (err) {
    if (err.err.code === "ER_DUP_ENTRY") return { isDuplicate: true };
    else return err;
  }
};

export const insertOne = async dataObj => {
  try {
    const insertQuery =
      "INSERT INTO `invite`(std_id, teacher_id, invite_timestamp, host,  \
    orig_id) VALUES(?, ?, NOW(), ? , ?)";
    const { std_id, teacher_id, host } = dataObj;

    const target_host = getHostConnection(
      host,
      master_connection,
      slave_a_connection,
      slave_b_connection
    );
    const payload = await promisify(target_host, insertQuery, [
      std_id,
      teacher_id,
      "LOCAL",
      "null"
    ]);

    if (payload.isError) return payload.err;
    return payload.result.insertId;
  } catch (err) {
    if (err.err.code === "ER_DUP_ENTRY") return { isDuplicate: true };
    else return err;
  }
};

export const selectAll = async (host, start, rows) => {
  try {
    const selectQuery = "SELECT * FROM `invite` LIMIT ?, ?";
    const lengthQuery = "SELECT COUNT(*) AS TOTAL FROM `invite`";

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
    const deleteSourceQuery = "DELETE FROM `invite` WHERE invite_id = ?";
    const deleteDestQuery = "DELETE FROM `invite` WHERE orig_id = ?";
    const deleteTmp =
      "DELETE FROM `tmp` WHERE record_id = ? AND record_type = 2";

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

export const getInsertMeta = async host => {
  try {
    const studentQuery =
      "SELECT id, name, email FROM `student` WHERE host = 'LOCAL'";
    const teacherQuery =
      "SELECT id, name, email FROM `teacher` WHERE host = 'LOCAL'";

    const target_host = getHostConnection(
      host,
      master_connection,
      slave_a_connection,
      slave_b_connection
    );

    let payload = await promisify(target_host, studentQuery);
    if (payload.isError) return payload.err;

    const response = {};
    response.studentMeta = payload.result;

    payload = await promisify(target_host, teacherQuery);
    if (payload.isError) return payload.err;

    response.teacherMeta = payload.result;
    return response;
  } catch (err) {
    console.log(err);
    return false;
  }
};
