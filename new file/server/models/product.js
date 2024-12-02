import mongoose from "mongoose";
import Mongoose, { Schema, model } from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
import mongoosePaginate from "mongoose-paginate-v2";
const productModel = new Schema(
  {
    productName: {
      type: String,
    },

    price: {
      type: Number,
      required: true,
    },
    categoryId: {
      type: mongoose.Types.ObjectId,
      ref: "categorys",
    },
    productImage: {
      type: String,
      required: true,
    },
    productlike:[{
      
        type: mongoose.Types.ObjectId,
        ref: "User",
    
    }],
    
  },
  { timestamps: true }
);
productModel.plugin(aggregatePaginate);
productModel.plugin(mongoosePaginate);
module.exports = Mongoose.model("products", productModel);
