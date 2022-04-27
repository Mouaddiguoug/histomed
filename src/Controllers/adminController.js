import { driver } from "../../index.js";
import Dotenv from "dotenv/config";

export const getCertificates = async (req, res) => {
  if (!req.params.role)
    return res.status(400).json({ message: "you should provide a role" });
  try {
    const database = process.env.database;
    const getCertificatesSession = driver.session({ database });
    const certificates = await getCertificatesSession.readTransaction((tx) =>
      tx.run(
        `match (p:${req.params.role} {valid: 'false'})-[g:got]->(c:certificate)-[h:has]->(i:images) return p, c, i`
      )
    );
    const docInfos = certificates.records.map((record) =>
      record._fields.map((node) => node.properties)
    );
    const newdocInfos = {};
    for (let i = 0; i < docInfos.length; i++) {
      for (let j = 0; j < docInfos[i].length; j++) {
        if (j == 0) newdocInfos.doctor = docInfos[i][j];
        else if (j == 1) newdocInfos.certificate = docInfos[i][j];
        else if (j == 2) newdocInfos.images = docInfos[i][j];
      }
    }
    res.status(200).json(newdocInfos);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const activateAccount = async (req, res) => {
  if (!req.params.id || !req.params.role)
    return res
      .status(400)
      .json({ message: "you should provide a role and a id" });
  try {
    const database = process.env.database;
    const ActivateAccountSession = driver.session({ database });
    await ActivateAccountSession.writeTransaction((tx) =>
      tx.run(
        `match (p:${req.params.role} {id: '${req.params.id}'}) set p.valid = 'true'`
      )
    ).then(() => ActivateAccountSession.close());
    res.status(200).json("updated with success");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
