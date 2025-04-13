const express = require('express');
const User = require('../models/user');
const ConnectionRequest = require('../models/connectionRequest');
const authUser = require('../middlewares/auth');
const userRouter = express.Router();

const USER_DATA = 'firstName lastName age gender photoUrl about skills';

userRouter.get("/user/requests/received", authUser, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested"
    }).populate(
      'fromUserId', USER_DATA);

    if (!connectionRequests) return res.status(404).json({ message: "There are no requests for you.." });

    res.json({
      message: "Data fetched succssefully",
      connectionRequests
    });
  } catch (err) {
    res.send(err.message);
  }
});


userRouter.get("/user/connections", authUser, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connections = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" }
      ],
    }).populate("fromUserId", USER_DATA)
      .populate("toUserId", USER_DATA);

    const data = await connections.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId
      }
      return row.fromUserId
    });

    if (!data) return res.status(404).json({ message: "You have no connections. Try finding one.." });

    res.json({
      message: "Connections fetched succssefully",
      data
    });
  } catch (error) {
    res.send(error.message);
  }
});

userRouter.get("/feed", authUser, async (req, res) => {
  try {
    const loggedInUser = req.user;

    // /feed?limit=2 or /feed?page=1&limit=2
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    //find all the connection requests( sent + recieved)
    const connectionRequest = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }
      ]
    }).select("fromUserId toUserId");

    const hideUsersFromFeed = new Set();
    connectionRequest.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    console.log(hideUsersFromFeed);

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } }
      ]
    }).select(USER_DATA)
      .skip(skip)
      .limit(limit);

    res.json({ data: users });

  } catch (err) {
    res.send(err.message);
  }
});

module.exports = userRouter;