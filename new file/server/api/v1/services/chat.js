import userModel from "../../../models/user";
import chatModel from "../../../models/chat";
import userType from "../../../enums/userType";
import status from "../../../enums/status";

const chatServices = {
  findUserById: async (_id) => {
    return await userModel.findById({ _id: _id });
  },
  createChat: async (insertObj) => {
    return await chatModel.create(insertObj);
  },
  findChat: async (query) => {
    return await chatModel.findOne(query);
  },

  saveChat: async (query) => {
    return await chatModel.save(query);
  },
  findUser: async (query) => {
    return await userModel.findOne(query);
  },

  updateChat: async (query, updateObj) => {
    return await chatModel.findOneAndUpdate(query, updateObj, { new: true });
  },
};
module.exports = chatServices;
