import {
  insertAll,
  deleteAll,
  selectAll,
  getInsertMeta
} from "../../Database/invite";

export const inviteInsert = async (req, res) => {
  const state = await insertAll(req.body);
  if (typeof state === "object") {
    const { isDuplicate } = state;
    if (isDuplicate) {
      return res.status(500).json({
        message: `Duplication error, record already present.`,
        auth_status: true,
        query_status: true,
        isDuplicate: true
      });
    }
  }

  if (state !== true)
    return res
      .status(500)
      .json({ message: `Error in Invite Sync insertion : ${state}` });

  console.log("POST /sync/invite 200");
  return res.json({
    message: "Successfully inserted the Invite record synchronously."
  });
};

export const inviteDelete = async (req, res) => {
  const { host, id } = req.body;
  const state = await deleteAll(host, id);

  if (state !== true)
    return res.status(500).json({
      message: `Error in Invite Sync deletion : ${state}`
    });

  console.log("DELETE /sync/invite 200");
  return res.status(200).json({
    message: `Successfully deleted the Invite record: ${id} synchoronusly.`
  });
};

export const inviteRead = async (req, res) => {
  let { unit, page } = req.params;
  const { host } = req.query;

  if (!unit) unit = 10;
  if (!page) page = 1;

  const offset = (Number(page) - 1) * unit;
  const payload = await selectAll(host, offset, unit);

  if (payload === false)
    return res
      .status(500)
      .json({ message: `Failed to fetch Invites for host: ${host}` });

  console.log("GET /sync/invite 200");
  return res.status(200).json(payload);
};

export const getMeta = async (req, res) => {
  const { host } = req.query;
  const payload = await getInsertMeta(host);

  if (payload === false)
    return res.status(500).json({
      message: `Failed to fetch ${host} meta-deta for Invite Insertion.`
    });
  console.log("GET /sync/invite/meta 200");
  return res.status(200).json(payload);
};
