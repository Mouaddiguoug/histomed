import Express from "express";
import dotenv from "dotenv/config";
import neo4j from "neo4j-driver";
import bodyParser from "body-parser";
import cors from "cors";
import practionerRouter from "./src/Routes/practionerRouter.js";
import adminRouter from "./src/Routes/adminRouter.js";
import userRouter from "./src/Routes/userRouter.js";
import cookieParser from "cookie-parser";
import refreshRouter from "./src/Routes/refreshRouter.js";
import { credentials } from "./src/Middlewares/credentials.js";
import { corsOptions } from "./src/config/corsOptions.js";

const { database, db_username, password, url } = process.env;

export const driver = neo4j.driver(
  url,
  neo4j.auth.basic(db_username, password)
);

const session = driver.session({ database });

const app = Express();

app.use(credentials);

app.use(cors());

app.use(cookieParser());

app.use(bodyParser.json({ limit: "30mb", extended: true }));

app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

app.listen(process.env.PORT, () =>
  console.log("server runnning on: http://localhost:" + process.env.PORT)
);

app.use("/practioner", practionerRouter);
app.use("/admin", adminRouter);
app.use("/", userRouter);
app.use("/refresh", refreshRouter);
