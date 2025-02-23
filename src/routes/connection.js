const express = require("express");
const connectionRouter = express.Router();
const User = require('../models/user');
const authUser = require("../middlewares/auth");
const logger = require("../utils/logger");

//to fetch user profile based JWT token
connectionRouter.post("/sendConnectionRequest", authUser, async (req, res) => {
  const user = req.user;

  res.send(`${user.firstName} is sending connection request`);
});

module.exports = connectionRouter;