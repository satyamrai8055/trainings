import Joi from "joi";
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import responseMessage from "../../../../../assets/responseMessage";
import commonFunction from "../../../../helper/util";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import status from "../../../../enums/status";
import userType from "../../../../enums/userType";
import services from "../../services/user";
const { findUser,updateUser } = services;

export class adminController {
  /**
   * @swagger
   * /api/v1/admin/adminlogin:
   *   post:
   *     summary: Admin Login
   *     tags:
   *       - ADMIN
   *     description: admin login
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: email
   *         in: formData
   *         required: true
   *       - name: password
   *         description: password
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
  async adminlogin(req, res, next) {
    const validationSchema = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      const { email, password } = validatedBody;
      const admin = await findUser({$and:[{email:email},{userType:userType.ADMIN}]});
      console.log(admin);
      console.log(admin.password);
      
      if (!admin) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      } 
      const result =  bcrypt.compareSync(password,admin.password); 
      if (result == true) {
        const token = await commonFunction.getToken({ _id: admin._id });
        res.json(new response(token, responseMessage.LOGIN_SUCCESS));
      }else {
        throw apiError.invalid(responseMessage.INVALID_PASSWORD);
      }
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  /**
   * @swagger
   * /api/v1/admin/adminforgetPassword:
   *   put:
   *     summary: Forgot Password
   *     tags:
   *       - ADMIN
   *     description: Forgot Password
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: email
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async adminforgetPassword(req, res, next){
    const validationSchema = Joi.object({
      email: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      const { email } = validatedBody;
      const admin = await findUser({ $and:[{email:email},{userType:userType.ADMIN}]});
      if (!admin) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      const otp = await commonFunction.getOTP();
      const otpExpirationTime = Date.now() + 3 * 60 * 1000;
      if (admin.email == email) {
        await commonFunction.sendMail(email, otp);
      }
      const result = await updateUser(
        { _id: user._id },
        { otp: otp, otpExpirationTime: otpExpirationTime },
        { isVerified: false },
        { new: true }
      );
      res.json(new response(result, responseMessage.OTP_SEND));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
   /**
   * @swagger
   * /api/v1/admin/adminresetPassword:
   *   post:
   *     summary: Reset Password
   *     tags:
   *       - ADMIN
   *     description: Reset Password
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: email
   *         in: formData
   *         required: true
   *       - name: password
   *         description: password
   *         in: formData
   *         required: true
   *       - name: newPassword
   *         description: newPassword
   *         in: formData
   *         required: true
   *       - name: confirmPassword
   *         description: confirmPassword
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   *       404:
   *         description: User not found || Data not found.
   *       501:
   *         description: Something went wrong!
   */
  async adminresetPassword(req, res, next){
    const validationSchema = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
      newPassword: Joi.string().required(),
      confirmPassword: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      const { email, password, newPassword, confirmPassword } = validatedBody;
      const admin = await findUser({ $and:[{email:email},{userType:userType.ADMIN}]});
      if (!admin) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        throw apiError.badRequest(responseMessage.PASSWORD_NOT_MATCH);
      }
      if (newPassword !== confirmPassword) { 
        throw apiError.badRequest(responseMessage.PASSWORD_NOT_MATCH);
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      admin.password = hashedPassword;
      const result = await updateUser({ _id: user._id },{password:admin.password});
      const otp = await commonFunction.getOTP();
      await commonFunction.sendMail(email, otp);
      res.json(new response(result, responseMessage.PASSWORD_UPDATE));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  async adminGetdata(req, res, next){
    try {
      const user = await findUser({ _id: req.userId });
      if (!user) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }
      res.json(new response(user, responseMessage.ADMIN_FOUND_DATA));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  
}
export default new adminController();
