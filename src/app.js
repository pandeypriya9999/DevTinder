require('dotenv').config()
const express = require('express');
const app = express();
const connectDB = require('./config/database');
const cookieParser = require("cookie-parser");
const cors = require('cors');
const logger = require("./utils/logger");

const { PORT } = process.env;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
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

//To connect with MongoDB
connectDB().then(() => {
  logger.info("Database connection established");
  app.listen(PORT, () => {
    logger.info(`Server running successfully on ${PORT}`);
  });
}).catch((err) => {
  logger.info("Database connection not established");
});