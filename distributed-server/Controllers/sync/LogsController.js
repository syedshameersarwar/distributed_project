import { dlt, select, update } from "../../Database/async_logs";
import { extractToken } from "../../util";

export const getLogs = async (req, res) => {
  const token = extractToken(req);

  if (!token)
    return res
      .status(400)
      .json({ message: "Not authorized", auth_status: false });

  if (token !== "SomeMasterToken")
    return res
      .status(400)
      .json({ message: "Invalid Token", auth_status: false });

  let { unit, page } = req.params;

  if (!unit) unit = 10;
  if (!page) page = 1;

  const offset = (Number(page) - 1) * unit;
  const payload = await select(offset, unit);

  if (payload === false)
    return res
      .status(500)
      .json({ message: `Failed to fetch Transaction logs: MASTER` });

  console.log("GET /sync/logs 200");
  return res.status(200).json(payload);
};

export const deleteLogs = async (req, res) => {
  const token = extractToken(req);

  if (!token)
    return res
      .status(400)
      .json({ message: "Not authorized", auth_status: false });

  if (token !== "SomeMasterToken")
    return res
      .status(400)
      .json({ message: "Invalid Token", auth_status: false });

  const { id } = req.body;
  const status = await dlt(id);
  if (status !== true)
    return res
      .status(500)
      .json({ message: `Failed to delete Transaction log: ${id}` });

  console.log("DELETE /sync/logs 200");
  return res
    .status(200)
    .json({ message: `Succesfully deleted Transaction log: ${id}` });
};

export const updateLogs = async (req, res) => {
  const token = extractToken(req);

  if (!token)
    return res
      .status(400)
      .json({ message: "Not authorized", auth_status: false });

  if (token !== "SomeMasterToken")
    return res
      .status(400)
      .json({ message: "Invalid Token", auth_status: false });

  const { id, desc } = req.body;
  const status = await update(id, desc);

  if (status !== true)
    return res
      .status(500)
      .json({ message: `Failed to update Transaction log: ${id}` });

  console.log("PUT /sync/logs 200");
  return res
    .status(200)
    .json({ message: `Successfully update Transaction log: ${id}` });
};
