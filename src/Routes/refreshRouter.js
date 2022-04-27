import Express from "express";
import { handleRefreshToken } from "../Controllers/authController.js";

const refresh = Express.Router()

refresh.get('/', handleRefreshToken)

export default refresh;