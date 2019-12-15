import { master_connection } from "./connection";
import { promisify } from "../util";

export const insert = async () => {
  const query = "INSERT INTO `async_logs` VALUES()";
  const payload = await promisify(master_connection, query);
  if (payload.isError) return payload.err;
  return true;
};
