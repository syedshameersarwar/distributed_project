import { generateToken } from "../util";

const auth = (req, res) => {
  const { user, pass } = req.body;
  const { token, valid, isMaster } = generateToken(user, pass);
  if (valid) return res.json({ token, isMaster, source: user.toUpperCase() });

  console.log("POST /login 200");
  return res.json({ message: "Invalid Credentials." });
};

export default auth;
