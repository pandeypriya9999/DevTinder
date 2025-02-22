const mongoose = require("mongoose");

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
  passwrd: {
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

module.exports = mongoose.model("User", userSchema);