import mongoose, { Schema } from "mongoose";
mongoose.pluralize(null);

const hospitalModel = new Schema(
  {
    hospitalName: {
      type: String,
    },
    location: {
      type: {
        type: String,
        default: "point",
      },
      corrdinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    city: {
      type: String,
    },
    hospitalImage: {
      type: String,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("hospital", hospitalModel);
