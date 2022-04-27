import Express from "express";
import { register, login, logOut } from "../Controllers/authController.js";
import {
  getAll,
  mostRated,
  mostVisited,
  editProfil,
  changePassword,
  takeAppointement,
} from "../Controllers/userController.js";

const user = Express.Router();

user.post("/register/:role", register);
user.post("/login", login);
user.post("/logout", logOut);
user.get("/getAll/:role", getAll);
user.get("/mostVisited/:role", mostVisited);
user.get("/mostRated/:role", mostRated);
user.put("/:id/:role", editProfil);
user.post("/changePassword", changePassword);
user.post("/takeAppointment/:id", takeAppointement);

export default user;
