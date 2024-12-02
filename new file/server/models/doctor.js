import mongoose, { Schema } from "mongoose";
mongoose.pluralize(null);
const doctorModel = new Schema(
  {
    hospitalId: {
      type: mongoose.Types.ObjectId,
      ref: "hospital",
    },
    doctorName: {
      type: String,
    },
    doctorAge: {
      type: Number,
    },
    specialization: {
      type: String,
    },
    qualification: [
      {
        type: String,
      },
    ],
    experience: {
      type: Number,
    },
    doctorImage: {
      type: String,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("doctor", doctorModel);
