import { insertAll } from "../../Database/teacher";

const teacherController = async (req, res) => {
  const state = await insertAll(req.body);
  if (state !== true)
    return res
      .status(500)
      .json({ message: `Error in Teacher Sync insertion : ${state}` });

  console.log('POST /sync/teacher 200');
  return res.json({
    message: "Successfully inserted the Teacher record synchronously."
  });
};

export default teacherController;
