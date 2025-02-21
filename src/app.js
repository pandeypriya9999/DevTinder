require('dotenv').config()
const express = require('express');
const app = express();
const connectDB = require('./config/database');
const User = require('./models/user');

const PORT = process.env.PORT || 4000;

app.use(express.json());

app.post("/signUp", async (req, res) => {
  console.log(req.body);
  const { firstName, lastName, emailId, password, age, gender } = req.body;
  const user = new User({ firstName, lastName, emailId, password, age, gender });

  try {
    user.save();
    res.status(200).json({ message: "User added successfully!" });
  } catch (error) {
    res.status(err.statuCode).json({ message: error.message });
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

app.get("/feed", async (req, res) => {
  try {
    const userFeedData = await User.find({});
    res.send(userFeedData).json({ message: "All users fetched for feed" });
  } catch (error) {
    res.send(error.message).json({ message: "No users found for feed" });
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