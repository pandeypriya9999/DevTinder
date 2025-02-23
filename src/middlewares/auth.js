require('dotenv').config();
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const User = require('../models/user');
const JWT_KEY = process.env.JWT_KEY;

const authUser = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) throw new Error("Token is not valid");

    const decodedData = await jwt.verify(token, JWT_KEY);

    const { _id } = decodedData;

    const user = await User.findById({ _id: _id });
    if (!user) throw new Error("User not found");

    req.user = user;
    next();
  } catch (error) {
    res.status(400).send({ "message": error.message });
  }
}

module.exports = authUser;