import { insertAll } from "../../Database/student";

const studentController = async (req, res) => {
  const state = await insertAll(req.body);
  
  if (state !== true)
    return res
      .status(500)
      .json({ message: `Error in Student Sync insertion : ${state}` });

  console.log('POST /sync/student 200');
  return res.json({
    message: "Successfully inserted the Student record synchronously."
  });
};

export default studentController;
