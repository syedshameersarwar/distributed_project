import { master_connection } from "./connection";
import { insertAll as insertAllStudent } from "./student";
import { insertAll as insertAllTeacher } from "./teacher";
import { insertAll as insertAllInvite } from "./invite";
import { promisify } from "../util";

export const insert = async (recordId, recordType) => {
  try {
    const query = "INSERT INTO `tmp`(record_id, record_type) VALUES(?, ?)";

    const payload = await promisify(master_connection, query, [
      recordId,
      recordType
    ]);
    if (payload.isError) return payload.err;
    return true;
  } catch (err) {
    console.log(err);
    return err;
  }
};

export const transaction = async (
  tables = ["student", "teacher", "invite"],
  cb
) => {
  try {
    const meta = {
      student: {
        get_ids: "SELECT * FROM `tmp` WHERE `record_type` = 0",
        get_each: "SELECT * FROM `student` WHERE id = ?",
        insertAll: insertAllStudent
      },
      teacher: {
        get_ids: "SELECT * FROM `tmp` WHERE `record_type` = 1",
        get_each: "SELECT * FROM `teacher` WHERE id = ?",
        insertAll: insertAllTeacher
      },
      invite: {
        get_ids: "SELECT * FROM `tmp` WHERE `record_type` = 2",
        get_each: "SELECT * FROM `invite` WHERE invite_id = ?",
        insertAll: insertAllInvite
      }
    };

    let payload;
    const processTable = async table => {
      payload = await promisify(master_connection, meta[table].get_ids);
      if (payload.isError) return payload.err;

      const entites = Object.assign([], payload.result);
      console.log(entites);
      const processEntities = async entity => {
        console.log(entity, table);
        try {
          const entityPayload = await promisify(
            master_connection,
            meta[table].get_each,
            Number(entity.record_id)
          );
          if (entityPayload.isError) return entityPayload.err;
          console.log("ep:", entityPayload);
          const entityInsertion = await meta[table].insertAll(
            entityPayload.result[0],
            false
          );
          console.log("ei:", entityInsertion);

          if (entityInsertion.isError) {
            console.log(
              `Error in inserting ${table} record asynchronously: `,
              entityPayload.result[0]
            );
            return entityInsertion.err;
          }
          return true;
        } catch (err) {
          console.log(err);
          return err;
        }
      };
      for (let entity of entites) {
        console.log("entity:", entity);
        await processEntities(entity);
        // if (state !== true) return false;
        // return true;
      }
    };
    for (let table of tables) {
      await processTable(table);
      // if (state !== true) return false;
      // return true;
    }
    cb();
    //return true;
  } catch (err) {
    console.log(err);
    return false;
  }

  /*
  try {
    const student_query = "SELECT * FROM `tmp` WHERE `record_type` = 0";
    const teacher_query = "SELECT * FROM `tmp` WHERE `record_type` = 1";
    let payload;

    payload = await promisify(master_connection, student_query);
    if (payload.isError) return payload.err;

    const students = Object.assign([], payload.result);
    await students.forEach(async rec => {
      try {
        const getStudentQuery =
          "SELECT * FROM `student_details` WHERE std_id = ?";
        const studentPayload = await promisify(
          master_connection,
          getStudentQuery,
          rec.record_id
        );
        if (studentPayload.isError) return studentPayload.err;

        payload = await insertAllStudent(studentPayload.result[0], false);
        if (payload.isError) {
          console.log(
            "Error in inserting student record asynchronously: ",
            studentPayload.result
          );
        }
      } catch (err) {
        console.log(err);
        return err;
      }
    });

    payload = await promisify(master_connection, teacher_query);
    if (payload.isError) return payload.err;

    const teachers = Object.assign([], payload.result);
    await teachers.forEach(async rec => {
      try {
        const getTeacherQuery =
          "SELECT * FROM `teacher_details` WHERE teacher_id = ?";
        const teacherPayload = await promisify(
          master_connection,
          getTeacherQuery,
          rec.record_id
        );
        if (teacherPayload.isError) return teacherPayload.err;
        payload = await insertAllTeacher(teacherPayload.result[0], false);
        if (payload.isError) {
          console.log(
            "Error in inserting teacher record asynchronously: ",
            teacherPayload.result
          );
        }
      } catch (err) {
        console.log(err);
        return err;
      }
    });
    return true;
  } catch (err) {
    console.log(err);
    return err;
  }
  */
};

export const eject = async () => {
  try {
    const query = "DELETE FROM `tmp`";

    const payload = await promisify(master_connection, query);
    if (payload.isError) return payload.err;
    return true;
  } catch (err) {
    console.log(err);
    return err;
  }
};

export const select = async (start, rows) => {
  try {
    const query = "SELECT * FROM `tmp` LIMIT ?,?";
    const lengthQuery = "SELECT COUNT(*) AS TOTAL FROM `tmp`";

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
  /*
  try {
    const query = "SELECT * FROM `tmp` LIMIT ?, ?";

    const payload = await promisify(master_connection, query, [start, rows]);
    if (payload.isError) return payload.err;
    return payload.result;
  } catch (err) {
    console.log(err);
    return err;
  }*/
};
