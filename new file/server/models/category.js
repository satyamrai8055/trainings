import mongoose from "mongoose";
import Mongoose, { Schema, model } from "mongoose";

const categoryModel = new Schema(
    {
        categoryName:{
            type: String,
        },
        shopId:{
            type:mongoose.Types.ObjectId,
            ref:"shops"
        },
        categoryImage: {
            type: String,
            require: true,
          },
    },
    { timestamps: true }
)
module.exports = Mongoose.model("categorys", categoryModel);