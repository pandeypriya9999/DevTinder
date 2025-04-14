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
    const savedUser = await user.save();
    const token = await savedUser.getJWT();
    res.cookie("token", token, { expires: new Date(Date.now() + 12 * 3600000) });
    res.json({ message: "User added successfully", data: savedUser });
    console.log(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//To get user logged in
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ emailId: emailId });

    if (!user) {
      // User not found
      return res.status(404).json({ message: "User is not registered" });
    }

    // Validate the password
    const isPasswordValidated = await user.passwordValidated(password);

    if (isPasswordValidated) {
      // Generate JWT token
      const token = await user.getJWT();
      res.cookie("token", token, { expires: new Date(Date.now() + 12 * 3600000) });

      // Send success response
      return res.status(200).json(user);
    } else {
      // Invalid password
      return res.status(401).json({ message: "User provided password is not valid" });
    }
  } catch (err) {
    // Internal server error
    return res.status(500).json({ message: `Login failed: ${err.message}` });
  }
});

//To get user logged out
authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now())
  })
  res.send("Logout successfull");
});

module.exports = authRouter;