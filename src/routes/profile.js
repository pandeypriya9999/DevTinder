const express = require("express");
const profileRouter = express.Router();
const User = require('../models/user');
const logger = require("../utils/logger");
const authUser = require("../middlewares/auth");

//to fetch user profile based JWT token
profileRouter.get("/profile", authUser, async (req, res) => {

  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    logger.info(error);
    res.send(error.message);
  }
});

module.exports = profileRouter;