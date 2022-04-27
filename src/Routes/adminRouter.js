import Express from "express";
import { getCertificates, activateAccount } from "../Controllers/adminController.js";
import { verifyJWTs } from "../Middlewares/verfiJWTs.js";
import { verifyRoles } from "../Middlewares/verifyRole.js";

const admin = Express.Router();

admin.get('/certificates/:role', verifyJWTs, verifyRoles('admin'), getCertificates)
admin.get('/activateAccount/:id/:role',  activateAccount)

export default admin