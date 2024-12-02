import { string } from "joi";
import Mongoose, { Schema, model } from "mongoose";

var shopModel = new Schema(
  {
    shopName: {
      type: String,
    },
    location: {
      type: { type: String },

      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },

    city: {
      type: String,
      require: true,
    },
    shopImage: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);
shopModel.index({ location: "2dsphere" });  
module.exports = Mongoose.model("shops", shopModel);
