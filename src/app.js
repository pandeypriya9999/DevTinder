require('dotenv').config()
const express = require('express');
const app = express();
const connectDB = require('./config/database');
const User = require('./models/user');
const validateData = require("./utils/validate");
const bcrypt = require("bcrypt");

const PORT = process.env.PORT || 4000;

app.use(express.json());

app.post("/signUp", async (req, res) => {

  try {
    const { firstName, lastName, emailId, password, age, gender } = req.body;

    //validating rquest first
    validateData(req);

    //bcrypt password
    const passwordHash = bcrypt.hash(password, 10);

    const user = new User({ firstName, lastName, emailId, password: passwordHash, age, gender });
    user.save();
    res.status(200).json({ message: "User added successfully!" });
  } catch (error) {
    res.status(err.statuCode).json({ message: error.message });
  }
});

app.post("/login", async (req, res) => {

  try {
    const { emailId, password } = req.body;

    const user = User.findOne({ emailId: emailId });

    if (!user) throw new Error("User is not registered");

    const isPasswordValidated = bcrypt.compare(password, user.password);
    if (isPasswordValidated) {
      res.send("User logged in successfully");
    } else {
      res.send("User provided password is not valid");
    }
  } catch (err) {
    res.send(`${err.message} + Login failed`);
  }
});

app.get("/feed", async (req, res) => {
  try {
    const userFeedData = await User.find({});
    res.send(userFeedData).json({ message: "All users fetched for feed" });
  } catch (error) {
    res.send(error.message).json({ message: "No users found for feed" });
  }
});

app.get("/user", async (req, res) => {
  const userEmail = req.body.emailId;

  try {
    const userData = await User.findOne({ emailId: userEmail });
    res.send(userData).json({ message: "User details fetched" });
  } catch (error) {
    res.send(error.message).json({ message: "User details not fetched" });
  }
});

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

    const updatedResponse = User.findByIdAndUpdate({ _id: userId }, data, {
      returnDocument: 'after',
      runValidators: true
    });
    res.send(updatedResponse);
  } catch (error) {
    res.send(error.message).json({ message: "User details not updated" });
  }
});

app.delete("/user", async (req, res) => {
  const userEmail = req.body.emailId;
  try {
    await User.findByIdAndUpdate({ emailId: userEmail });
    res.send(`${userEmail} deleted successfully from User collection`);
  } catch (error) {
    res.send(`${userEmail} cannot be deleted from User collection`);
  }
});

connectDB().then(() => {
  console.log("Database connection established..");
  app.listen(PORT, () => {
    console.log(`Server running successfully on ${PORT}`);
  });
}).catch((err) => {
  console.log("Database connection not established..");
});