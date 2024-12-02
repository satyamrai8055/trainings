import shopModel from '../../../models/shopModel';
import usermodel from '../../../models/user';
import status from '../../../enums/status';
import userType from '../../../enums/userType';


const shopServices ={

    findUser: async(query) =>{
        return await usermodel.findOne(query);
      },
      createUser: async (insertObj) => {
        return await shopModel.create(insertObj);
      },
      deleteShop: async (query) => {
        return await shopModel.deleteOne(query)
    },
    findUsers: async(query) =>{
      return await shopModel.findOne(query)
    },
    updateUserById: async (query, updateObj) => {
      return await shopModel.findByIdAndUpdate(query, updateObj, { new: true });
    },
    findUserList: async () => {
      return await shopModel.find({});
  },
  geonear:async(query)=>{
    const result = await shopModel.aggregate(query);
    console.log(result);
    return result;
  }


}

module.exports = shopServices ;