import Joi from "joi";
import apiError from "../../../../helper/apiError";
import responseMessage from "../../../../../assets/responseMessage";
import response from "../../../../../assets/response";
import commonFunction from "../../../../helper/util";
import userType from "../../../../enums/userType";
import doctorServices from "../../services/doctor";
const { findUser, findHospital, createDoctor } = doctorServices;

export class doctorController {
  async addDoctor(req, res, next) {
    const validationSchema = Joi.object({
      doctorName: Joi.string().trim().required(),
      specialization: Joi.string().trim().required(),
      qualification: Joi.string().trim().required(),
      hospitalId: Joi.string().trim().required(),
      doctorImage: Joi.string().required(),
      doctorAge: Joi.number().required(),
      experience:Joi.number().required()
    });
    const validatedBody = await validationSchema.validateAsync(req.body);
    const {
      hospitalId,
      doctorName,
      specialization,
      qualification,
      doctorImage,
      doctorAge,
      experience
    } = validatedBody;
    const admin = await findUser({
      $and: [{ _id: req.userId }, { userType: userType.ADMIN }],
    });
    console.log(admin);
    if (!admin) {
      throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
    }
    const hospital = await findHospital({ _id: hospitalId });
    console.log(hospital);
    if (!hospital) {
      throw apiError.notFound(responseMessage.NOT_FOUND);
    }
    const file = req.body.doctorImage;
    const uploadimage = await commonFunction.getSecureUrl(file);
    const obj = {
      doctorName: validatedBody.doctorName,
      specialization: validatedBody.specialization,
      hospitalId: validatedBody.hospitalId,
      qualification: validatedBody.qualification,
      doctorAge: validatedBody.doctorAge,
      doctorImage: uploadimage,
      experience: validatedBody.experience
    };
    const result = await createDoctor(obj);
    return res.json(new response(result, responseMessage.CREATE));
  }
}
export default new doctorController();
