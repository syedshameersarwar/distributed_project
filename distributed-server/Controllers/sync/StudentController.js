import {
  insertAll,
  deleteAll,
  selectAll,
  updateAll
} from "../../Database/student";

export const studentInsert = async (req, res) => {
  const state = await insertAll(req.body);

  if (state !== true)
    return res
      .status(500)
      .json({ message: `Error in Student Sync insertion : ${state}` });

  console.log("POST /sync/student 200");
  return res.json({
    message: "Successfully inserted the Student record synchronously."
  });
};

export const studentDelete = async (req, res) => {
  const { host, id } = req.body;
  const state = await deleteAll(host, id);

  if (state !== true)
    return res.status(500).json({
      message: `Error in Student Sync deletion : ${state}`
    });

  console.log("DELETE /sync/student 200");
  return res.status(200).json({
    message: `Successfully deleted the Student record: ${id} synchoronusly.`
  });
};

export const studentRead = async (req, res) => {
  let { unit, page } = req.params;
  const { host } = req.query;

  if (!unit) unit = 10;
  if (!page) page = 1;

  const offset = (Number(page) - 1) * unit;
  const payload = await selectAll(host, offset, unit);

  if (payload === false)
    return res
      .status(500)
      .json({ message: `Failed to fetch Students for host: ${host}` });

  console.log("GET /sync/student 200");
  return res.status(200).json(payload);
};

export const studentUpdate = async (req, res) => {
  const { host, id, data } = req.body;
  const state = await updateAll(host, id, data);
  if (state !== true)
    return res.status(200).json({ message: `Error in Student Sync update.` });

  console.log("PUT /sync/student 200");
  return res.status(200).json({
    message: `Succesfully update student record: ${id} synchronously.`
  });
};
