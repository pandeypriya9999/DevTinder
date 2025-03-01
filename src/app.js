require('dotenv').config()
const express = require('express');
const app = express();
const connectDB = require('./config/database');
const cookieParser = require("cookie-parser");
const logger = require("./utils/logger");

const { PORT } = process.env;

app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const connectionRouter = require("./routes/connection");
const userRouter = require("./routes/user");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", connectionRouter);
app.use("/", userRouter);

/*
//to fetch all user data
app.get("/feed", async (req, res) => {
  try {
    const userFeedData = await User.find({});
    res.send(userFeedData);
  } catch (error) {
    res.send(error.message);
  }
});

//to get single user data
app.get("/user", async (req, res) => {
  const userEmail = req.body.emailId;

  try {
    const userData = await User.findOne({ emailId: userEmail });
    res.send(userData);
  } catch (error) {
    res.send(error.message)
  }
});

//To update existed user details
app.patch("/user/:userId", async (req, res) => {
  const userId = req.params?.userId;
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
    await res.send(updatedResponse);
  } catch (error) {
    res.send(error.message)
  }
});

//to delete user
app.delete("/user", async (req, res) => {
  const userId = req.body.userId;
  try {
    await User.findByIdAndDelete({ _id: userId });
    res.send(`${userId} deleted successfully from User collection`);
  } catch (error) {
    logger.info(error);
    res.send(`${userId} cannot be deleted from User collection`);
  }
});
*/

//To connect with MongoDB
connectDB().then(() => {
  logger.info("Database connection established");
  app.listen(PORT, () => {
    logger.info(`Server running successfully on ${PORT}`);
  });
}).catch((err) => {
  logger.info("Database connection not established");
});