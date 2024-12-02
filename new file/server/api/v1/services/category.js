import categoryModel from "../../../models/category";
import shopModel from "../../../models/shopModel";
import usermodel from "../../../models/user";
import status from "../../../enums/status";
import userType from "../../../enums/userType";

const categoryServices = {
  findUser: async (query) => {
    return await usermodel.findOne(query);
  },
  findUsers: async (query) => {
    return await shopModel.findOne(query);
  },
  createUser: async (insertObj) => {
    return await categoryModel.create(insertObj);
  },
  findUserlist: async (query) => {
    return await categoryModel.findOne(query);
  },
  deleteShop: async (query) => {
    return await categoryModel.deleteOne(query);
  },
  updateUserById: async (query, updateObj) => {
    return await categoryModel.findByIdAndUpdate(query, updateObj, {
      new: true,
    });
  },
};

module.exports = categoryServices;
