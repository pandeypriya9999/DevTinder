const mongoose = require("mongoose");


const connectionRequestSchema = new mongoose.Schema({

  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ["ignored", "interested", "accepted", "rejected"],
      messages: `{VALUE} is incorrect status type`
    }
  }
}, {
  timestamps: true
});

// connectionRequestSchema.pre(function (next) {
//   const connectionRequest = this;

//   if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
//     throw new Error("You cannot send request to yourself");
//   }

//   next();
// })

//Created connection request model
const ConnectionRequestModel = new mongoose.model("Connections", connectionRequestSchema);
module.exports = ConnectionRequestModel;