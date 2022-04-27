import { driver } from "../index.js";
import dotenv from "dotenv/config";

export const checkExist = async (id, role) => {
  const database = process.env.database;
  const checkExistSession = driver.session({ database });
  const fetchExist = await checkExistSession.readTransaction((tx) =>
    tx.run(`MATCH (p:${role} {id: $id}) return p limit 1`, {
      id: id,
    })
  );
  if (fetchExist.records.length == 0) return false;
  return true;
};
