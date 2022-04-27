import { driver } from "../../index.js";
import Dotenv from "dotenv/config";
import { nanoid } from "nanoid";
import moment from "moment";
import { registerValidation } from "../validation.js";
import certificate from "../Models/certificate.js";
import images from "../Models/images.js";
import appointment from "../Models/appointement.js";

export const addCertificate = async (req, res) => {
  if (
    !req.params.id ||
    !req.body.name ||
    !req.body.description ||
    req.body.images
  )
    return res.status(400).json({
      message: "you should provide all of the requiered inputs",
    });
  try {
    const database = process.env.database;
    const certificateSession = driver.session({ database });
    const newCertificate = new certificate(
      nanoid(12),
      req.body.name,
      req.body.description
    );
    const newImages = new images(nanoid(12), req.body.images);
    await certificateSession
      .writeTransaction((tx) =>
        tx.run(
          `match (p:${req.params.role} {id: $pracId}) ` +
            `create (c:certificate {id: $cerId, name: $name, description: $description}) ` +
            `create (i:images {id: $imgId, images: $images})` +
            "create (p)-[:got {year: $year}]->(c)-[:has]->(i) ",
          {
            pracId: req.params.id,
            cerId: newCertificate.id,
            name: newCertificate.name,
            description: newCertificate.description,
            year: req.body.year,
            images: newImages.images,
            imgId: nanoid(12),
          }
        )
      )
      .then(() => certificateSession.close());
    res.status(201).json({ message: "certificate created with success" });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const setschedule = async (req, res) => {
  if (!req.body.morning || !req.body.evening)
    return res
      .status(400)
      .json({ message: "you should provide the needed inputs" });
  try {
    const database = process.env.database;
    const setAppointementSession = driver.session({ database });
    const newAppointment = new appointment(
      nanoid(12),
      req.body.morning,
      req.body.evening
    );
    await setAppointementSession
      .writeTransaction((tx) =>
        tx.run(
          "match (p {id: $id})" +
            "create (a:appointment {id: $appointmentId, morning: $morning, evening: $evening})" +
            "create (p)-[:sat]->(a)",
          {
            id: req.params.id,
            morning: newAppointment.morning,
            evening: newAppointment.evening,
            appointmentId: newAppointment.id,
          }
        )
      )
      .finally(() => setAppointementSession.close());
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export const changeSchedule = async (req, res) => {
  if (!req.body.morning || !req.body.evening)
    return res
      .status(400)
      .json({ message: "you should provide the needed inputs" });
  try {
    const database = process.env.database;
    const changeScheduleSession = driver.session({ database });
    const newAppointment = new appointment(
      nanoid(12),
      req.body.morning,
      req.body.evening
    );
    await changeScheduleSession.writeTransaction((tx) =>
      tx.run(
        "match (p {id: $id})-[:sat]->(a:appointment) set a.morning = $morning, a.evening = $evening",
        {
          id: req.params.id,
          morning: newAppointment.morning,
          evening: newAppointment.evening,
        }
      )
    );
  } catch (error) {
    res.status(500).json(error.message);
  }
};
