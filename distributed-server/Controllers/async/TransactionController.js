import { extractToken } from "../../util";
import { transaction, eject } from "../../Database/tmp";
import { insert } from "../../Database/async_logs";

const transactionController = async (req, res) => {
  try {
    const token = extractToken(req);

    if (!token)
      return res.json({ message: "Not authorized", auth_status: false });
    if (token !== "SomeMasterToken")
      return res.json({ message: "Invalid Token", auth_status: false });

    const { tables, desc } = req.body;

    let transactionStatus = false;
    await transaction(tables, () => (transactionStatus = true));
    if (transactionStatus !== true)
      return res.status(500).json({
        message: "Failed to perform transaction.",
        auth_status: true,
        error: transactionStatus,
        query_status: false
      });

    const ejectStatus = await eject();
    if (ejectStatus !== true)
      return res.status(500).json({
        message: "Failed to perform transaction(eject).",
        auth_status: true,
        error: ejectStatus,
        query_status: false
      });

    const logStatus = await insert(desc);
    if (logStatus !== true)
      return res.status(500).json({
        message: "Failed to perform transaction(logging).",
        auth_status: true,
        error: logStatus,
        query_status: false
      });

    console.log("PUT /async 200");
    return res.json({
      message: `Transaction performed Successfully, ${Date()} `,
      auth_status: true,
      query_status: true
    });
  } catch (err) {
    console.log("Error ", err);
    res.status(500).json(err);
  }
};

export default transactionController;
