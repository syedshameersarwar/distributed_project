import { insertOne } from "../../Database/teacher";
import { insert } from "../../Database/tmp";
import { extractToken } from "../../util";

const teacherController = async (req, res) => {
  try {
    const token = extractToken(req);

    if (!token)
      return res
        .status(400)
        .json({ message: "Not authorized", auth_status: false });

    if (token !== "SomeMasterToken")
      return res
        .status(400)
        .json({ message: "Invalid Token", auth_status: false });

    const insertion_status = await insertOne(req.body);
    if (typeof insertion_status !== "number")
      return res.status(500).json({
        message: `Error in Teacher(Master) insertion : ${insertion_status}`,
        auth_status: true,
        query_status: false
      });

    const tmp_insertion = await insert(insertion_status, 1);
    if (tmp_insertion !== true) {
      return res.status(500).json({
        message: `Error in Teacher(Master) insertion, from /tmp/ : ${insertion_status}`,
        auth_status: true,
        query_status: false
      });
    }

    console.log('POST /async/teacher 200');
    return res.json({
      message: `Successfully inserted Teacher(Master) record: ${insertion_status}`,
      auth_status: true,
      query_status: true
    });
  } catch (err) {
    console.log("Error ", err);
    res.status(500).json(err);
  }
};

export default teacherController;
