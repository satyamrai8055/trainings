import Joi from "joi";
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import responseMessage from "../../../../../assets/responseMessage";
import commonFunction from "../../../../helper/util";
import userType from "../../../../enums/userType";
import hospitalServices from "../../services/hospital";
const { findUser, createHospital,findHospital,deleteHospital} = hospitalServices;

export class hospitalController {
  /**
   * @swagger
   * /api/v1/hospital/createHospital:
   *   post:
   *     summary: Hospital Create
   *     tags:
   *       - HOSPITAL
   *     description: createHospital
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: hospitalName
   *         description: hospitalName
   *         in: formData
   *         required: true
   *       - name: authorization
   *         description: authorization
   *         in: header
   *         required: true
   *       - name: city
   *         description: city
   *         in: formData
   *         required: true
   *       - name: hospitalImage
   *         description: hospitalImage
   *         in: formData
   *         required: true
   *       - name: longitude
   *         description: longitude
   *         in: formData
   *         required: true
   *       - name: latitude
   *         description: latitude
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   *       402:
   *         description: password does not match
   *       501:
   *         description: Something went wrong!
   */
  async createHospital(req, res, next) {
    const validationSchema = Joi.object({
      hospitalName: Joi.string().trim().required(),
      city: Joi.string().trim().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      hospitalImage: Joi.string().required(),
    });
    try {
        console.log(req.userId);
      const validatedBody = await validationSchema.validateAsync(req.body);
      const { hospitalName, city, latitude, longitude } = validatedBody;
      const admin = await findUser({
        $and: [{ _id: req.userId }, { userType: userType.ADMIN }], 
      });
      if (!admin) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }
      const file = req.body.hospitalImage;
      const uploadimage = await commonFunction.getSecureUrl(file);
      const obj = {
        hospitalName: validatedBody.hospitalName,
        city: validatedBody.city,
        location: {
          type: "Point",
          corrdinates: [
            parseFloat(validatedBody.longitude),
            parseFloat(validatedBody.latitude), 
          ],
        },
        hospitalImage: uploadimage,
      };
      const result = await createHospital(obj);
      return res.json(new response(result, responseMessage.SUCCESS));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  async deleteHospital(req, res, next){
     const admin = await findUser({$and:[{_id:req.userId},{userType:userType.ADMIN}]});
     if(!admin){
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
     }
     const hospital = await findHospital({_id: req.params._id});
     if(!hospital){
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND)
     }
     const result = await deleteHospital(hospital);
     return res.json(new response(result, responseMessage.DELETED))
  }
}
export default new hospitalController();
