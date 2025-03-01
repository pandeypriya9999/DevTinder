const express = require("express");
const connectionRouter = express.Router();
const User = require('../models/user');
const authUser = require("../middlewares/auth");
const logger = require("../utils/logger");
const ConnectionRequest = require("../models/connectionRequest");

connectionRouter.post("/request/send/:status/:toUserId", authUser, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;

    const allowedStatusType = ["interested", "ignored"];
    if (!allowedStatusType.includes(status)) {
      return res.status(400).json(`${status} : Status type is invalid`);
    }

    const checkToUser = await User.findById(toUserId);

    if (!checkToUser) {
      return res.status(400).json({ message: "User not found" });
    }

    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId }
      ]
    });

    if (existingConnectionRequest) return res.status(400).json({ message: "Connection request already exists" });

    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status
    });

    const data = await connectionRequest.save();
    res.json({
      message: "Connection request sent",
      data
    })
  } catch (error) {
    res.send(error.message);
  }
});

connectionRouter.post("/request/review/:status/:requestId", authUser, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const requestId = req.params.requestId;
    const status = req.params.status;

    const allowedStatusType = ["accepted", "rejected"];
    if (!allowedStatusType.includes(status)) {
      return res.status(400).json(`${status} : Status type is invalid`);
    }

    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: loggedInUser._id,
      status: "interested"
    });

    if (!connectionRequest) {
      return res.status(404).json({ message: `No connection request ${status} ` });
    }

    connectionRequest.status = status;
    const data = await connectionRequest.save();
    res.json({
      message: `Connection request ${status} `,
      data
    })
  } catch (err) {
    res.send(err.message);
  }
});
module.exports = connectionRouter;

