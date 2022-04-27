import { driver } from "../../index.js";
import Dotenv from "dotenv/config";
import { nanoid } from "nanoid";
import CryptoJS from "crypto-js";
import moment from "moment";
import { registerValidation } from "../validation.js";
import jwt from "jsonwebtoken";
import doctor from "../Models/doctor.js";
import laboratory from "../Models/laboratory.js";
import pharmacy from "../Models/pharmacy.js";
import user from "../Models/user.js";

export const register = async (req, res) => {
  try {
    const database = process.env.database;
    const Registersession = driver.session({ database });
    const exist = await Registersession.readTransaction((tx) =>
      tx.run("MATCH (n {email: $email}) return n limit 1", {
        email: req.body.email,
      })
    );

    if (exist.records.length != 0)
      return res
        .status(400)
        .json({ message: "a user with the same email does exist already" });
    if (registerValidation(req).hasOwnProperty("error"))
      return res.status(400).json(registerValidation(req).error.message);
    let encrypted = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.secretKey
    );
    let now = new Date();
    if (req.params.role.includes("doctor")) {
      if (
        !req.body.firstName ||
        !req.body.lastName ||
        !req.body.email ||
        !req.body.tel ||
        !req.body.city ||
        !req.body.office ||
        !req.body.image ||
        !req.body.categories
      )
        return res.status(400).json({
          message: "you should provide all of the requiered inputs",
        });
      const newDoctor = new doctor(
        nanoid(12),
        req.body.firstName,
        req.body.lastName,
        req.body.email,
        req.body.tel,
        encrypted,
        req.body.city,
        false,
        req.body.office,
        req.params.role,
        req.body.image,
        0,
        0,
        req.body.categories,
        moment(now)
      );
      const Registersession = driver.session({ database });
      const accessToken = jwt.sign(
        {
          userInfo: {
            id: newDoctor.id,
            email: newDoctor.email,
            role: newDoctor.role,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );
      const refreshToken = jwt.sign(
        {
          userInfo: {
            id: newDoctor.id,
            email: newDoctor.email,
            role: newDoctor.role,
          },
        },
        process.env.REFRESH_TOKEN_SECRET
      );
      await Registersession.writeTransaction((tx) =>
        tx.run(
          `CREATE (:${newDoctor.role} {id: $id, firstName: $firstName, lastName: $lastName, email: $email, tel: $tel, password: '${newDoctor.password}', city: $city, valid: '${newDoctor.valid}', office: $office, image: '${newDoctor.image}', rate: $rate, patientsNumber: $patientsNumber, categories: $categories,createdAt: '${newDoctor.createdAt}', refreshToken: $refreshToken})`,
          {
            categories: req.body.categories,
            id: newDoctor.id,
            firstName: newDoctor.firstName,
            lastName: newDoctor.lastName,
            email: newDoctor.email,
            tel: newDoctor.tel,
            city: newDoctor.city,
            office: newDoctor.office,
            refreshToken: refreshToken,
            rate: newDoctor.rate,
            patientsNumber: newDoctor.patientsNumber,
          }
        )
      )
        .then(() =>
          Registersession.writeTransaction((tx) =>
            tx.run(
              `CREATE CONSTRAINT IF NOT EXISTS FOR (d:${newDoctor.role}) REQUIRE d.email IS UNIQUE`
            )
          )
        )
        .then(() => Registersession.close);
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "none",
      });
      res.status(201).json({
        message: `a ${newDoctor.role} was created with success`,
        accessToken: accessToken,
      });
    } else if (req.params.role.includes("laboratory")) {
      if (
        !req.body.name ||
        !req.body.email ||
        !req.body.tel ||
        !req.body.city ||
        !req.body.office ||
        !req.body.image
      )
        return res.status(400).json({
          message: "you should provide all of the requiered inputs",
        });
      const newLaboratory = new laboratory(
        nanoid(12),
        req.body.name,
        req.body.email,
        req.body.tel,
        encrypted,
        req.body.city,
        false,
        req.body.office,
        req.params.role,
        req.body.image,
        moment(now)
      );
      const Registersession = driver.session({ database });
      const accessToken = jwt.sign(
        {
          userInfo: {
            id: newLaboratory.id,
            email: newLaboratory.email,
            role: newLaboratory.role,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );
      const refreshToken = jwt.sign(
        {
          userInfo: {
            id: newLaboratory.id,
            email: newLaboratory.email,
            role: newLaboratory.role,
          },
        },
        process.env.REFRESH_TOKEN_SECRET
      );
      await Registersession.writeTransaction((tx) =>
        tx.run(
          `CREATE (:${newLaboratory.role} {id: $id, name: $name ,email: $email, tel: $tel, password: '${newLaboratory.password}', city: $city, valid: '${newLaboratory.valid}', office: $office, image: '${newLaboratory.image}', createdAt: '${newLaboratory.createdAt}', refreshToken: $refreshToken})`,
          {
            id: newLaboratory.id,
            name: newLaboratory.name,
            email: newLaboratory.email,
            tel: newLaboratory.tel,
            city: newLaboratory.city,
            office: newLaboratory.office,
            refreshToken: refreshToken,
          }
        )
      )
        .then(() =>
          Registersession.writeTransaction((tx) =>
            tx.run(
              `CREATE CONSTRAINT IF NOT EXISTS FOR (l:${newLaboratory.role}) REQUIRE l.email IS UNIQUE`
            )
          )
        )
        .then(() => Registersession.close);
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "none",
      });
      res.status(201).json({
        message: `a ${newLaboratory.role} was created with success`,
        accessToken: accessToken,
      });
    } else if (req.params.role.includes("pharmacy")) {
      if (
        !req.body.name ||
        !req.body.email ||
        !req.body.tel ||
        !req.body.address ||
        !req.body.image
      )
        return res.status(400).json({
          message: "you should provide all of the requiered inputs",
        });
      const newPharmacy = new pharmacy(
        nanoid(12),
        req.body.name,
        req.body.email,
        req.body.tel,
        encrypted,
        false,
        req.body.address,
        req.params.role,
        req.body.image,
        moment(now)
      );
      const Registersession = driver.session({ database });
      const accessToken = jwt.sign(
        {
          userInfo: {
            id: newPharmacy.id,
            email: newPharmacy.email,
            role: newPharmacy.role,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );
      const refreshToken = jwt.sign(
        {
          userInfo: {
            id: newPharmacy.id,
            email: newPharmacy.email,
            role: newPharmacy.role,
          },
        },
        process.env.REFRESH_TOKEN_SECRET
      );
      await Registersession.writeTransaction((tx) =>
        tx.run(
          `CREATE (:${newPharmacy.role} {id: $id , name: $name, email: $email, tel: $tel, password: '${newPharmacy.password}', valid: '${newPharmacy.valid}', image: '${newPharmacy.image}', createdAt: '${newPharmacy.createdAt}', address: $address, refreshToken: $refreshToken})`,
          {
            id: newPharmacy.id,
            name: newPharmacy.name,
            email: newPharmacy.email,
            tel: newPharmacy.tel,
            city: newPharmacy.city,
            address: newPharmacy.address,
            refreshToken: refreshToken,
          }
        )
      )
        .then(() =>
          Registersession.writeTransaction((tx) =>
            tx.run(
              `CREATE CONSTRAINT IF NOT EXISTS FOR (l:${newPharmacy.role}) REQUIRE l.email IS UNIQUE`
            )
          )
        )
        .then(() => Registersession.close);
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "none",
      });
      res.status(200).json({
        message: `a ${newPharmacy.role} was created with success`,
        accessToken: accessToken,
      });
    } else if (req.params.role.includes("user")) {
      if (
        !req.body.firstName ||
        !req.body.lastName ||
        !req.body.email ||
        !req.body.tel ||
        !req.body.image
      )
        return res.status(400).json({
          message: "you should provide all of the requiered inputs",
        });
      const newUser = new user(
        nanoid(12),
        req.body.firstName,
        req.body.lastName,
        req.body.email,
        req.body.tel,
        encrypted,
        req.params.role,
        req.body.image,
        moment(now)
      );
      const Registersession = driver.session({ database });
      const accessToken = jwt.sign(
        {
          userInfo: {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );
      const refreshToken = jwt.sign(
        {
          userInfo: {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
          },
        },
        process.env.REFRESH_TOKEN_SECRET
      );
      await Registersession.writeTransaction((tx) =>
        tx.run(
          `CREATE (:${newUser.role} {id: $id, firstName: $firstName, lastName: $lastName ,email: $email, tel: $tel, password: '${newUser.password}', image: '${newUser.image}', createdAt: '${newUser.createdAt}', refreshToken: $refreshToken})`,
          {
            id: newUser.id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            tel: newUser.tel,
            refreshToken: refreshToken,
          }
        )
      )
        .then(() =>
          Registersession.writeTransaction((tx) =>
            tx.run(
              `CREATE CONSTRAINT IF NOT EXISTS FOR (u:${newUser.role}) REQUIRE u.email IS UNIQUE`
            )
          )
        )
        .then(() => Registersession.close);
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "none",
      });
      res.status(201).json({
        message: `a ${newUser.role} was created with success`,
        accessToken: accessToken,
      });
    }
  } catch (error) {
    res.status(409).json(error.message);
    console.log(error);
  }
};

export const login = async (req, res) => {
  if (!req.body.firstName || !req.body.password)
    return res.status(400).json({
      message: "you should provide all of the requiered inputs",
    });
  try {
    const database = process.env.database;
    const Loginsession = driver.session({ database });
    const cred = await Loginsession.readTransaction((tx) =>
      tx.run("MATCH (n {email: $email}) return n limit 1", {
        email: req.body.email,
      })
    );
    if (cred.records.length == 0)
      res.status(400).json({ message: "incorrect credentials" });
    else if (
      CryptoJS.AES.decrypt(
        cred.records[0].get("n").properties.password,
        process.env.secretKey
      ).toString(CryptoJS.enc.Utf8) != req.body.password
    )
      res.status(401).json({ mesage: "incorrect credentials" });
    else {
      const accessToken = jwt.sign(
        {
          userInfo: {
            id: cred.records[0].get("n").properties.id,
            email: cred.records[0].get("n").properties.email,
            role: cred.records[0].get("n").labels[0],
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );
      const refreshToken = jwt.sign(
        {
          userInfo: {
            id: cred.records[0].get("n").properties.id,
            email: cred.records[0].get("n").properties.email,
            role: cred.records[0].get("n").labels[0],
          },
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "30d" }
      );
      await Loginsession.writeTransaction((tx) =>
        tx.run("match (n {email: $email}) set n.refreshToken = $refreshToken", {
          email: cred.records[0].get("n").properties.email,
          refreshToken: refreshToken,
        })
      );
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
      res.status(200).json({ accessToken: accessToken });
    }
  } catch (error) {
    res.status(409).json(error.message);
    console.log(error);
  }
};

export const handleRefreshToken = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(401).json("access denied ");
    const refreshToken = cookies.jwt;

    const database = process.env.database;
    const RefreshSession = driver.session({ database });
    const user = await RefreshSession.readTransaction((tx) =>
      tx.run("match (n {refreshToken: $refreshToken}) return n", {
        refreshToken: refreshToken,
      })
    );
    if (user.records.length === 0) return res.status(403);
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (
          err ||
          user.records[0].get("n").properties.email !== decoded.userInfo.email
        )
          return res.status(403).json("forbidden");
        const accessToken = jwt.sign(
          {
            userInfo: {
              id: decoded.id,
              email: decoded.email,
              role: decoded.role,
            },
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "15m" }
        );
        res.status(200).json({ accessToken });
      }
    );
  } catch (error) {
    res.status(500).json(error.message);
    console.log(error);
  }
};

export const logOut = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204);
    const refreshToken = cookies.jwt;

    const database = process.env.database;
    const RefreshSession = driver.session({ database });
    const user = await RefreshSession.readTransaction((tx) =>
      tx.run("match (n {refreshToken: $refreshToken}) return n", {
        refreshToken: refreshToken,
      })
    );

    if (user.records.length === 0) {
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
      return res.sendStatus(204);
    }

    await RefreshSession.writeTransaction((tx) =>
      tx.run(
        "match (n {refreshToken: $refreshToken}) set n.refreshToken = ''",
        { refreshToken: refreshToken }
      )
    );

    res.clearCookie("jwt", { httpOnly: true });
    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};
