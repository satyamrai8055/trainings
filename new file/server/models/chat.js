import mongoose from "mongoose";
import Mongoose, { Schema, model } from "mongoose";
mongoose.pluralize(null);
import status from "../enums/status";
import userType from "../enums/userType";
const chatModel = new Schema(
  {
    senderId: {
      type: mongoose.Types.ObjectId,
      ref: "users",
    },
    receiverId: {
      type: mongoose.Types.ObjectId,
      ref: "users",
    },
    messages: [
      {
        senderId: {
          type: mongoose.Types.ObjectId,
          ref: "users",
        },
        receiverId: {
          type: mongoose.Types.ObjectId,
          ref: "users",
        },
        mediaType: {
          type: String,
          enum: ["text", "image", "pdf"],
          default: "text",
        },
        message: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);
module.exports = Mongoose.model("chat", chatModel);
