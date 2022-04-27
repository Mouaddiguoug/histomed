import Express from "express";
import {
  addCertificate,
  changeSchedule,
  setschedule,
} from "../Controllers/practioerCotroller.js";

const practioner = Express.Router();

practioner.post("/certificate/:id/:role", addCertificate);
practioner.post("/schedule/:id", setschedule);
practioner.put("/schedule/:id", changeSchedule);

export default practioner;
