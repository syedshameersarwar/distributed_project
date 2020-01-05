import {
  insertAll,
  deleteAll,
  selectAll,
  updateAll
} from "../../Database/teacher";

export const teacherInsert = async (req, res) => {
  const state = await insertAll(req.body);

  if (state !== true)
    return res
      .status(500)
      .json({ message: `Error in Teacher Sync insertion : ${state}` });

  console.log("POST /sync/teacher 200");
  return res.json({
    message: "Successfully inserted the Teacher record synchronously."
  });
};

export const teacherDelete = async (req, res) => {
  const { host, id } = req.body;
  const state = await deleteAll(host, id);

  if (state !== true)
    return res.status(500).json({
      message: `Error in Teacher Sync deletion : ${state}`
    });

  console.log("DELETE /sync/teacher 200");
  return res.status(200).json({
    message: `Successfully deleted the Teacher record: ${id} synchoronusly.`
  });
};

export const teacherRead = async (req, res) => {
  let { unit, page } = req.params;
  const { host } = req.body;

  if (!unit) unit = 10;
  if (!page) page = 1;

  const offset = (Number(page) - 1) * unit;
  const payload = await selectAll(host, offset, unit);

  if (payload === false)
    return res
      .status(500)
      .json({ message: `Failed to fetch Teachers for host: ${host}` });

  console.log("GET /sync/teacher 200");
  return res.status(200).json(payload);
};

export const teacherUpdate = async (req, res) => {
  const { host, id, data } = req.body;

  const state = await updateAll(host, id, data);
  if (state !== true)
    return res.status(200).json({ message: `Error in Teacher Sync update.` });

  console.log("PUT /sync/teacher 200");
  return res.status(200).json({
    message: `Succesfully update Teacher record: ${id} synchronously.`
  });
};
