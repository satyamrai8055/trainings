import productModel from "../../../models/product";
import categoryModel from "../../../models/category";
import shopModel from "../../../models/shopModel";
import usermodel from "../../../models/user";
import status from "../../../enums/status";
import userType from "../../../enums/userType";

const productServices = {
  findUser: async (query) => {
    return await usermodel.findOne(query);
  },
  findUsers: async (query) => {
    return await categoryModel.findOne(query);
  },
  createUser: async (insertObj) => {
    return await productModel.create(insertObj);
  },
  saveproduct: async (insertObj) => {
    return await productModel.save(insertObj);
  },
  findUserlist: async (query) => {
    return await productModel.findOne(query);
  },
  deleteProduct: async (query) => {
    return await productModel.deleteOne(query);
  },
  updateUserById: async (query, updateObj) => {
    return await productModel.findByIdAndUpdate(query, updateObj, {
      new: true,
    });
  },

  findUserdetails: async (query) => {
    return await productModel.find(query).populate({
      path: "categoryId",
      select: "-createdAt -updatedAt",
      populate: { path: "shopId", select: "-createdAt -updatedAt" },
    });
  },

  aggregatePaginate: async (query) => {
    const data = [
      // { $match: { productName: { $regex: `[^\\d\\s]*${query}` } } },
      { $match: { productName: query } },

      {
        $lookup: {
          from: "categorys",
          localField: " categoryId",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $lookup: {
          from: "shops",
          localField: " shopId",
          foreignField: "_id",
          as: "shopDetails",
        },
      },
      {
        $unwind: {
          path: "$categoryDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          createdAt: 0,
          updated: 0,
          "categoryDetails.createdAt": 0,
          "categoryDetails.updatedAt": 0,
        },
      },
    ];
    let option = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 5,
      sort: { _id: -1 },
      populate: [{ path: "categoryDetails" }, { path: "shopDetails" }],
    };
    return await productModel.aggregatePaginate(data, option);
  },
  aggregate: async (query) => {
    const data = [
      { $match: { productName: { $regex: `[^\\d\\s]*${query}` } } },

      {
        $lookup: {
          from: "categorys",
          localField: "categoryId",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $lookup: {
          from: "shops",
          localField: "categoryDetails.shopId",
          foreignField: "_id",
          as: "shopDetails",
        },
      },

      {
        $unwind: {
          path: "$categoryDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          createdAt: 0,
          updated: 0,
          "categoryDetails.createdAt": 0,
          "categoryDetails.updatedAt": 0,
        },
      },
    ];
    return await productModel.aggregate(data);
  },
  paginate: async () => {
    const page = parseInt() || 1;
    const limit = parseInt() || 5;
    const result = await productModel.paginate(
      {},
      { page, limit, sort: { length: -1 } }
    );
    return result;
  },
  findproductById: async (query) => {
    return await productModel.findById(query);
  },
  findProduct: async (query) => {
    return await productModel.findOne(query);
  },
  findByIdAndUpdate: async (query, updateObj) => {
    return await productModel.findByIdAndUpdate(query, updateObj, {
      new: true,
    });
  },
  addToSet: async (productId, userId) => {
    const like = await productModel.findByIdAndUpdate(
      { _id: productId },
      { $addToSet: { productlike: userId } },
      { new: true }
    );
    return like;
  },
  popProduct: async (productId, userId) => {
    const dislike = await productModel.findByIdAndUpdate(
      { _id: productId },
      { $pull: { productlike: userId } },
      { new: true }
    );
    return dislike;
  },
  addFieldProduct: async (userId) => {
    console.log(userId);
    const data = [
      // { $match: { productlike: req.userId } },
      {
        $addFields: {
          productlike: {
            $cond: {
              if: { $in: [userId, { $ifNull: ["$productlike", []] }] },
              then: true,
              else: false,
            },
          },
        },
      },
    ];
    return await productModel.aggregate(data);
  },
};
module.exports = productServices;
