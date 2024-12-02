import userModel from "../../../models/user";
import hospitalModel from "../../../models/hospital";
import doctorModel from "../../../models/doctor";
import status from "../../../enums/status";
import userType from "../../../enums/userType";

const doctorServices = {
  findUser: async (query) => {
    return await userModel.findOne(query);
  },
  findHospital: async (query) => {
    return await hospitalModel.findOne(query);
  },
  createDoctor: async (insertObj) => {
    return await doctorModel.create(insertObj);
  },
};
module.exports = doctorServices;
