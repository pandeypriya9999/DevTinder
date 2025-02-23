const express = require("express");
const bcrypt = require("bcrypt");
const { validateData } = require("../utils/validate");
const User = require('../models/user');
const authRouter = express.Router();

const cookieParser = require("cookie-parser");
const logger = require("../utils/logger");

//To register user
authRouter.post("/signUp", async (req, res) => {

  try {
    const { firstName, lastName, emailId, password, age, gender } = req.body;

    //validating rquest first
    validateData(req);

    //bcrypt password
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await new User({ firstName, lastName, emailId, password: passwordHash, age, gender });
    await user.save();
    res.status(200).json({ message: "User added successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//To get user logged in
authRouter.post("/login", async (req, res) => {

  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });

    if (!user) throw new Error("User is not registered");

    const isPasswordValidated = await user.passwordValidated(password);

    if (isPasswordValidated) {
      const token = await user.getJWT();
      res.cookie("token", token, { expires: new Date(Date.now() + 12 * 3600000) });

      res.send("User logged in successfully");
    } else {
      res.send("User provided password is not valid");
    }
  } catch (err) {
    res.send(`${err.message} + Login failed`);
  }
});

//To get user logged out
authRouter.post("/logout", async (req, res) => { });

module.exports = authRouter;