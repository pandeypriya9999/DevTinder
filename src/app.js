require('dotenv').config()
const express = require('express');
const app = express();
const connectDB = require('./config/database');
const User = require('./models/user');
const { validateData } = require("./utils/validate");
const bcrypt = require("bcrypt");

const PORT = process.env.PORT || 4000;

app.use(express.json());

//To register user
app.post("/signUp", async (req, res) => {

  try {
    const { firstName, lastName, emailId, password, age, gender } = req.body;

    //validating rquest first
    validateData(req);

    //bcrypt password
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await new User({ firstName, lastName, emailId, password: passwordHash, age, gender });
    await user.save();
    res.status(200).json({ message: "User added successfully!" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//To get user logged in
app.post("/login", async (req, res) => {

  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });

    if (!user) throw new Error("User is not registered");

    const isPasswordValidated = await bcrypt.compare(password, user.password);
    if (isPasswordValidated) {
      res.send("User logged in successfully");
    } else {
      res.send("User provided password is not valid");
    }
  } catch (err) {
    res.send(`${err.message} + Login failed`);
  }
});

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
    console.log(error);
    res.send(`${userId} cannot be deleted from User collection`);
  }
});

//To connect with MongoDB
connectDB().then(() => {
  console.log("Database connection established..");
  app.listen(PORT, () => {
    console.log(`Server running successfully on ${PORT}`);
  });
}).catch((err) => {
  console.log("Database connection not established..");
});