require('dotenv').config()
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_KEY = process.env.JWT_KEY;

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 50
  },
  lastName: {
    type: String
  },
  emailId: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("EmailId is not valid.");
      }
    }
  },
  password: {
    type: String,
    required: true,
    validate(value) {
      if (!validator.isStrongPassword(value)) {
        throw new Error("Password is not strong.");
      }
    }
  },
  age: {
    type: Number,
    min: 18
  },
  gender: {
    type: String,
    validate(value) {
      if (!["male", "female", "others"].includes(value)) {
        throw new Error("Gender is not specified");
      }
    }
  },
  photoUrl: {
    type: String,
    default: "https://www.nicepng.com/png/detail/72-729987_big-image-user-clipart-png.png",
    validate(value) {
      if (!validator.isURL(value)) {
        throw new Error("PhotoURL is not valid.");
      }
    }
  },
  about: {
    type: String
  },
  skills: {
    type: [String]
  }
}, {
  timestamps: true
});

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, JWT_KEY, { expiresIn: "1d" });
  return token;
}

userSchema.methods.passwordValidated = async function (passwordInputByUser) {
  const passwordHash = this.password;
  const isPasswordValidated = await bcrypt.compare(passwordInputByUser, passwordHash);

  return isPasswordValidated;
}

module.exports = mongoose.model("User", userSchema);