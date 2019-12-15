import { master_connection } from "./connection";
import { insertAll as insertAllStudent } from "./student";
import { insertAll as insertAllTeacher } from "./teacher";
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

export const transaction = async () => {
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
