const express = require("express");
const profileRouter = express.Router();
const bcrypt = require("bcrypt");
const User = require('../models/user');
const logger = require("../utils/logger");
const authUser = require("../middlewares/auth");

//to fetch user profile based JWT token
profileRouter.get("/profile/view", authUser, async (req, res) => {

  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    logger.info(error);
    res.send(error.message);
  }
});

//to update existed profile data
profileRouter.patch("/profile/edit", authUser, async (req, res) => {
  const userId = req.user?._id;
  const data = req.body;

  try {
    const UPDATES_ALLOWED = [
      "photoUrl",
      "about",
      "age",
      "skills",
      "gender"
    ]

    // Data sanitizing  started
    const isAllowed = Object.keys(data).every((k) =>
      UPDATES_ALLOWED.includes(k)
    );

    if (!isAllowed) {
      throw new Error("User Update is not allowed");
    }

    if (data.skills.length > 10) {
      throw new Error("Skills cannot be added more than 10");
    }
    // Data sanitizing  ended

    const updatedResponse = await User.findByIdAndUpdate({ _id: userId }, data, {
      returnDocument: 'after',
      runValidators: true
    });
    res.json({
      message: `${req.user.firstName} your profile got updated successfully`,
      data: updatedResponse
    });
  } catch (error) {
    res.send(error.message)
  }
});

//to update or create new password after forgot
profileRouter.patch("/profile/password", authUser, async (req, res) => {
  try {
    const newPasswordbyUser = req.body.password;
    const user = req.user;

    const isPasswordUnique = await user.passwordValidated(newPasswordbyUser);
    const hashNewPassword = await bcrypt.hash(newPasswordbyUser, 10);
    if (isPasswordUnique) {
      throw new Error("Password cannot be same as current one");
    } else {
      await User.findByIdAndUpdate({ _id: user._id }, { password: hashNewPassword }, {
        returnDocument: 'after',
        runValidators: true
      });
      res.send(`${user.firstName} your password got updated successfully`);
    }
  } catch (error) {
    res.send(error.message)
  }
});

module.exports = profileRouter;