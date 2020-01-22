import { select } from "../../Database/tmp";
import { extractToken } from "../../util";

const getTmp = async (req, res) => {
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
      .json({ message: `Failed to fetch Tmp record for host: MASTER` });

  console.log("GET /sync/logs 200");
  return res.status(200).json(payload);
};

export default getTmp;
