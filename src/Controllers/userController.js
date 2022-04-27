import { driver } from "../../index.js";
import Dotenv from "dotenv/config";
import { nanoid } from "nanoid";
import moment from "moment";
import { checkExist } from "../helpers.js";
import CryptoJS from "crypto-js";

export const getAll = async (req, res) => {
  try {
    const database = process.env.database;
    const getAllSession = driver.session({ database });
    const allDoctors = await getAllSession
      .readTransaction((tx) => tx.run(`match (p:${req.params.role}) return p`))
      .finally(() => getAllSession.close());
    res.status(200).json({
      prec: allDoctors.records.map((record) => record.get("p").properties),
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const mostVisited = async (req, res) => {
  try {
    const database = process.env.database;
    const mostVisitedSession = driver.session({ database });
    const allDoctors = await mostVisitedSession
      .readTransaction((tx) =>
        tx.run(
          `match (p:${req.params.role}) return p order by p.patientsNumber desc limit 20`
        )
      )
      .finally(() => mostVisitedSession.close());
    res.status(200).json({
      prec: allDoctors.records.map((record) => record.get("p").properties),
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const mostRated = async (req, res) => {
  try {
    const database = process.env.database;
    const mostVisitedSession = driver.session({ database });
    const allDoctors = await mostVisitedSession
      .readTransaction((tx) =>
        tx.run(
          `match (p:${req.params.role}) return p order by p.rate desc limit 20`
        )
      )
      .finally(() => mostVisitedSession.close());
    res.status(200).json({
      prec: allDoctors.records.map((record) => record.get("p").properties),
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const takeAppointement = async (req, res) => {
  try {
    const database = process.env.database;
    const takeAppointmentSession = driver.session({ database });
    let now = new Date();
    await takeAppointmentSession
      .writeTransaction((tx) =>
        tx.run(
          "match (u {id: $id})" +
            " match (p {id: $pracId})" +
            ` create (u)-[:tookAppointment {id: $AppointmentId, time: $time, date: $date, status: 'pending', createdAt: '${moment(
              now
            )}'}]->(p)`,
          {
            id: req.params.id,
            pracId: req.body.pracId,
            time: req.body.time,
            date: req.body.date,
            AppointmentId: nanoid(12),
          }
        )
      )
      .finally(() => takeAppointmentSession.close());
  } catch (error) {
    res.status(500).json(error.message);
    console.log(error);
  }
};

export const editProfil = async (req, res) => {
  try {
    const database = process.env.database;
    const UpdateInfosSession = driver.session({ database });
    let exist = await checkExist(req.params.id, req.params.role);
    if (!exist)
      return res
        .status(400)
        .json({ message: `this ${req.params.role} doesn't exist` });
    if (req.params.role.includes("doctor")) {
      if (
        !req.body.firstName ||
        !req.body.lastName ||
        !req.body.email ||
        !req.body.tel ||
        !req.body.city ||
        !req.body.office ||
        !req.body.categories
      )
        return res.status(400).json({
          message: "you should provide all of the requiered inputs",
        });
      await UpdateInfosSession.writeTransaction((tx) =>
        tx.run(
          `match (p:${req.params.role} {id: $id}) set p.firstName = $firstName, p.lastName = $lastName,  p.tel = $tel, p.city = $city, p.office = $office, p.categories = $categories`,
          {
            categories: req.body.categories,
            id: req.params.id,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            tel: req.body.tel,
            city: req.body.city,
            office: req.body.office,
          }
        )
      ).then(() => UpdateInfosSession.close());
      res
        .status(200)
        .json({ message: "doctor's informations were updated with success" });
    } else if (req.params.role.includes("laboratory")) {
      if (
        !req.body.name ||
        !req.body.email ||
        !req.body.tel ||
        !req.body.city ||
        !req.body.office
      )
        return res.status(400).json({
          message: "you should provide all of the requiered inputs",
        });
      await UpdateInfosSession.writeTransaction((tx) =>
        tx.run(
          `match (p:${req.params.role} {id: $id}) set p.name = $name, p.tel = $tel, p.city = $city, p.office = $office`,
          {
            id: req.params.id,
            name: req.body.name,
            email: req.body.email,
            tel: req.body.tel,
            city: req.body.city,
            office: req.body.office,
          }
        )
      ).then(() => UpdateInfosSession.close());
      console.log("yo");
      res.status(200).json({
        message: "laboratory's informations were updated with success",
      });
    } else if (req.params.role.includes("pharmacy")) {
      if (
        !req.body.name ||
        !req.body.email ||
        !req.body.tel ||
        !req.body.address
      )
        return res.status(400).json({
          message: "you should provide all of the requiered inputs",
        });
      await Registersession.writeTransaction((tx) =>
        tx.run(
          `match (p:${req.params.role} {id: $id}) set p.name: $name, p.tel: $tel, p.address = $address`,
          {
            id: req.params.id,
            name: req.params.name,
            email: req.params.email,
            tel: req.params.tel,
            city: req.params.city,
            address: req.params.address,
          }
        )
      ).then(() => UpdateInfosSession.close());
    } else if (req.params.role.includes("user")) {
      if (
        !req.body.firstName ||
        !req.body.lastName ||
        !req.body.email ||
        !req.body.tel
      )
        return res.status(400).json({
          message: "you should provide all of the requiered inputs",
        });
      await UpdateInfosSession.writeTransaction((tx) =>
        tx.run(
          `match (u:${req.params.role} {id: $id}) set u.firstName = $firstName, u.lastName = $lastName, u.tel = $tel`,
          {
            id: req.params.id,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            tel: req.body.tel,
          }
        )
      ).then(() => UpdateInfosSession.close());
      res.status(200).json({
        message: "user's informations were updated with success",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const database = process.env.database;
    const changePasswordSession = driver.session({ database });
    const checkSession = driver.session({ database });
    const cred = await checkSession
      .readTransaction((tx) =>
        tx.run("MATCH (n {email: $email}) return n limit 1", {
          email: req.body.email,
        })
      )
      .finally(() => checkSession.close());
    if (cred.records.length == 0)
      return res.status(400).json({ message: "this email doesn't exist" });
    if (
      CryptoJS.AES.decrypt(
        cred.records[0].get("n").properties.password,
        process.env.secretKey
      ).toString(CryptoJS.enc.Utf8) != req.body.password
    )
      return res.status(401).json({ mesage: "the password is incorrect" });
    let encrypted = CryptoJS.AES.encrypt(
      req.body.newPassword,
      process.env.secretKey
    );
    await changePasswordSession
      .writeTransaction((tx) =>
        tx.run("MATCH (p {email: $email}) set p.password = $newPassword", {
          newPassword: encrypted.toString(),
          email: req.body.email,
        })
      )
      .finally(() => changePasswordSession.close());
    res.status(200).json({ message: "password updated with success" });
  } catch (error) {
    res.status(409).json(error.message);
    console.log(error);
  }
};
