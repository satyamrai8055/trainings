import Joi from "joi";
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import responseMessage from "../../../../../assets/responseMessage";
import status from "../../../../enums/status";
import userType from "../../../../enums/userType";
import commonFunction from "../../../../helper/util";
import bcrypt from "bcrypt";
import CronJob from "cron";
import userServices from "../../services/user";
import model from "../../../../models/user";
import jwt, { verify } from "jsonwebtoken";
import qrCode from "qrcode";
import speakeasy from "speakeasy";


const {
  checkUserExists,
  createUser,
  findUser,
  updateUser,
  updateUserById,
  findById,
  aggregatePaginate
} = userServices;

export class userController {
  /**
   * @swagger
   * /api/v1/user/userSignUp:
   *   post:
   *     summary: User SignUp
   *     tags:
   *       - USER
   *     description: user SignUp
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: firstName
   *         description: firstName
   *         in: formData
   *         required: true
   *       - name: lastName
   *         description: lastName
   *         in: formData
   *         required: true
   *       - name: countryCode
   *         description: countryCode
   *         in: formData
   *         required: true
   *       - name: mobileNumber
   *         description: mobileNumber
   *         in: formData
   *         required: true
   *       - name: dateOfBirth
   *         description: dateOfBirth
   *         in: formData
   *         required: true
   *       - name: email
   *         description: email
   *         in: formData
   *         required: true
   *       - name: password
   *         description: password
   *         in: formData
   *         required: true
   *       - name: confirmPassword
   *         description: confirmPassword
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   *       409:
   *         description: Mobile number already exist 
   *       501:
   *         description: Something went wrong!
   */

  async userSignUp(req, res, next) {
    const validationSchema = Joi.object({
      firstName: Joi.string().alphanum().min(3).max(10).trim().required(),
      lastName: Joi.string().alphanum().min(3).max(10).trim().required(),
      countryCode: Joi.string().trim().required(),
      mobileNumber: Joi.string().length(10).pattern(/[6-9]{1}[0-9]{9}/).trim().required(),
      dateOfBirth: Joi.string().trim().required(),
      email: Joi.string().trim().required().email(),
      password: Joi.string().min(3).max(10).trim().required(),
      confirmPassword: Joi.string().min(3).max(10).trim().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      const {
        firstName,
        lastName,
        countryCode,
        mobileNumber,
        dateOfBirth,
        email,
        password,
        confirmPassword,
        otp,
        otpExpirationTime,
      } = validatedBody;
      const user = await checkUserExists(email, mobileNumber);
      if (user) {
        if (user.status === "BLOCKED") {
          throw apiError.unauthorized(responseMessage.BLOCK_USER);
        }
        if (user.mobileNumber == validatedBody.mobileNumber) {
          throw apiError.conflict(responseMessage.MOBILE_ALREADY_EXIST);
        } else if (user.email == validatedBody.email) {
          throw apiError.conflict(responseMessage.EMAIL_ALREADY_EXIST);
        } else {
          throw apiError.conflict(responseMessage.USER_ALREADY_EXIST);
        }
      }
      validatedBody.otp = commonFunction.getOTP();
      validatedBody.otpExpirationTime = Date.now() + 3 * 60 * 1000;
      validatedBody.password = bcrypt.hashSync(validatedBody.password, 10);
      commonFunction.sendMail(email, validatedBody.otp);

      const result = await createUser(validatedBody);
      return res.json(new response(result, responseMessage.OTP_VERIFY));
    } catch (error) {
      console.log("Error", error);
      return next(error);
    }
  }
  /**
     * @swagger
     * /api/v1/user/verifyOTP:
     *   post:
     *     summary: Verify OTP
     *     tags:
     *       - USER
     *     description: verifyOTP
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: email
     *         description: email
     *         in: formData
     *         required: true
     *       - name: otp
     *         description: otp
     *         in: formData
     *         required: true
     *         schema:
     *           $ref: '#/definitions/verifyOTP'
     *     responses:
     *       200:
     *         description: Returns success message
     */
  async verifyOTP(req, res, next) {
    const validationSchema = Joi.object({
      email: Joi.string().required(),
      otp: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      const { email, otp } = validatedBody;
      const user = await findUser({ email: email });
      if (!user) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      } else {
        if (user.isVerified == true) {
          throw apiError.conflict(responseMessage.OTP_ALREADY_VERIFIED);
        }
        if (Date.now > user.otpExpirationTime) {
          throw apiError.badRequest(responseMessage.OTP_EXPIRED);
        }
        if (user.otp != otp) {
          throw apiError.invalid(responseMessage.INVALID_OTP);
        }
        const result = await updateUser(
          { email: req.body.email },
          { $set: { isVerified: true, otp: "" } },
          { new: true }
        );
        res.json(new response(result, responseMessage.OTP_VERIFY));
      }
    } catch (error) {
      console.log("Error", error);
      return next(error);
    }
  }
  /**
   * @swagger
   * /api/v1/user/resendOTP:
   *   post:
   *     summary: Resend OTP
   *     tags:
   *       - USER
   *     description: resendOTP
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: email
   *         in: formData
   *         required: true
   *         schema:
   *           $ref: '#/definitions/resendOTP'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async resendOTP(req, res, next) {
    const validationSchema = Joi.object({
      email: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);

      const user = await findUser({ email: validatedBody.email });
      if (!user) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      } else {
        if (user.isVerified == true) {
          throw apiError.conflict(responseMessage.OTP_ALREADY_VERIFIED);
        }
        const otp = await commonFunction.getOTP();
        const otpExpirationTime = Date.now() + 3 * 60 * 1000;
        commonFunction.sendMail(validatedBody.email, otp);
        const result = await updateUser(
          { email: req.body.email },
          {
            $set: {
              otp: otp,
              otpExpirationTime: otpExpirationTime,
              isVerified: false,
            },
          },
          { new: true }
        );
        res.json(new response(result, responseMessage.OTP_RESEND));
      }
    } catch (error) {
      console.log("Error", error);
      return next(error);
    }
  }
  async forgetPassword(req, res, next) {
    const validationSchema = Joi.object({
      email: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      const { email } = validatedBody;
      const user = await findUser({ email: email });
      if (!user) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      const otp = await commonFunction.getOTP();
      const otpExpirationTime = Date.now() + 3 * 60 * 1000;
      if (user.email == email) {
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
  async updatePassword(req, res, next) {
    const validationSchema = Joi.object({
      email: Joi.string().required(),
      newPassword: Joi.string().required(),
      confirmPassword: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      const { email, newPassword, confirmPassword } = validatedBody;
      const user = await findUser({ email: email });
      if (!user) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      } else {
        if (newPassword !== confirmPassword) {
          throw apiError.badRequest(
            responseMessage.PASSWORD_AND_CONFIRMPASSWORD_DOES_NOT_MATCH
          );
        }
        if (otp !== user.otp || Date.now() > user.otpExpirationTime) {
          throw apiError.badRequest(responseMessage.INVALID_OTP);
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.isVerified = true;
        const result = await updateUser(
          { _id: user._id },
          { password: user.password, isVerified: user.isVerified },
          { new: true }
        );
        await commonFunction.sendMail(user.email, otp);
        res.json(new response(result, responseMessage.PASSWORD_UPDATE));
      }
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  /**
 * @swagger
 * /api/v1/user/resetPassword:
 *   post:
 *     summary: Reset Password
 *     tags:
 *       - USER
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
  async resetPassword(req, res, next) {
    const validationSchema = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
      newPassword: Joi.string().required(),
      confirmPassword: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      const { email, password, newPassword, confirmPassword } = validatedBody;
      const user = await findUser({ email: email });
      if (!user) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw apiError.badRequest(responseMessage.PASSWORD_NOT_MATCH);
      }
      if (newPassword !== confirmPassword) {
        throw apiError.badRequest(responseMessage.PASSWORD_NOT_MATCH);
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      const result = await updateUser(
        { _id: user._id },
        { password: user.password }
      );
      const otp = await commonFunction.getOTP();
      await commonFunction.sendMail(email, otp);
      res.json(new response(result, responseMessage.PASSWORD_UPDATE));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  /**
 * @swagger
 * /api/v1/user/userlogin:
 *   post:
 *     summary: User Login
 *     tags:
 *       - USER
 *     description: user login
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
  async userlogin(req, res, next) {
    const validationSchema = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      const { email, password } = validatedBody;
      const user = await findUser({ email: email });
      console.log(user);
      if (!user) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      } else {
        if (user.isVerified != true) {
          throw apiError.badRequest(responseMessage.OTP_NOT_VERIFY);
        }
        const result = bcrypt.compareSync(password, user.password);
        if (result == true) {
          const token = await commonFunction.getToken({ _id: user._id });
          res.json(new response(token, responseMessage.LOGIN_SUCCESS));
        } else {
          throw apiError.invalid(responseMessage.INVALID_PASSWORD);
        }
      }
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  /**
      * @swagger
      * /api/v1/user/getProfile:
      *   get:
      *     summary: Get profile
      *     tags:
      *       - USER
      *     description: getProfile
      *     produces:
      *       - application/json
      *     parameters:
      *       - name: authorization
      *         description: authorization
      *         in: header
      *         required: true
      *     responses:
      *       200:
      *         description: Details found successfully.
      *       404:
      *         description: User not found.
      */
  async getProfile(req, res, next) {
    try {
      const user = await findUser({ _id: req.userId });
      if (!user) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      res.json(new response(user, responseMessage.USER_DETAILS));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  async editUserProfile(req, res, next) {
    try {
      const { email, mobileNumber, password } = req.body;
      const userdata = await findUser({
        _id: req.userId,
        userType: userType.USER,
      });
      if (!userdata) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      if (password) {
        password = bcrypt.hashSync(password, 10);
      }
      if (email && !mobileNumber) {
        const user = await findUser({
          $and: [
            { email: req.body.email },
            { _id: { $ne: req.userId } },
            { status: { $ne: status.DELETE } },
          ],
        });
        if (user) {
          throw apiError.conflict(responseMessage.EMAIL_ALREADY_EXIST);
        }
        const update = await updateUserById(
          { _id: userdata._id },
          { $set: req.body },
          { new: true }
        );
        res.json(new response(update, responseMessage.VERIFY_YOUR_EMAIL));
      } else if (!email && mobileNumber) {
        const query = await findUser({
          $and: [
            { mobileNumber: req.body.mobileNumber },
            { _id: { $ne: req.userId } },
            { status: { $ne: status.DELETE } },
          ],
        });
        if (query) {
          throw apiError.conflict(responseMessage.MOBILE_ALREADY_EXIST);
        }
        const updateResult = await updateUserById(
          { _id: userdata._id },
          { $set: req.body },
          { new: true }
        );
        res.json(
          new response(updateResult, responseMessage.SUCCESSFULLY_UPDATE)
        );
      } else if (email && mobileNumber) {
        const result = await findUser({
          $and: [
            {
              $and: [
                { email: req.body.email },
                { mobileNumber: req.body.mobileNumber },
              ],
            },
            { _id: { $ne: req.userId } },
            { status: { $ne: status.DELETE } },
          ],
        });
        if (result) {
          if (result.email === email) {
            throw apiError.conflict(responseMessage.EMAIL_ALREADY_EXIST);
          } else {
            throw apiError.conflict(responseMessage.MOBILE_ALREADY_EXIST);
          }
        }
        const updatedResult = await updateUserById(
          { _id: userdata._id },
          { $set: req.body },
          { new: true }
        );
        res.json(
          new response(updatedResult, responseMessage.SUCCESSFULLY_UPDATE)
        );
      }
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  // async imageUpload(req, res, next) {
  //   try {
  //     const user = await findById({ _id: req.userId });
  //     if (!user) {
  //       throw apiError.notFound(responseMessage.USER_NOT_FOUND);
  //     }
  //     await commonFunction.getSecureUrl();
  //     const file = req.body.imageData;
  //     cloudinary.uploader.upload(file, { resource_type: "auto" });
  //   } catch (error) {}
  // }

  async generateQR(req, res, next) {
    qrCode.toDataURL("I am a pony!", function (err, url) {
      console.log(url);
      return next(url);
    });
  }

  async generate2FA(req, res, next) {
    try {
      // Generate a new secret key
      const secret = speakeasy.generateSecret({ length: 10 });
      qrCode.toDataURL(secret.otpauth_url, (err, data_url) => {
        if (err) {
          throw apiError.internal(responseMessage.FAILED_TO_GENERATE_QRCODE);
        } else {
          res.json(
            new response({ data_url, secret }, responseMessage.TWO_FA_GENERATED)
          );
        }
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  async verify2FA(req, res, next) {
    try {
      const { secret, code } = req.body;
      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: "base32",
        token: code,
      });
      if (verified) {
        res.json(
          new response(true, responseMessage.TWO_FA_VERIFICATION_SUCCESSFULY)
        );
      } else {
        throw apiError.invalid(false, responseMessage.INVALID_TWO_FA);
      }
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  async aggregatePaginate(req, res, next) {
    try {
      const { page, limit, search, sort } = req.query;
      const data = { userType: userType.USER, status: status.ACTIVE };
      if (search) {
        data.$or = [
          { email: { $regex: search, $options: "i" } },
          { mobile: { $regex: search, $options: "i" } }
        ];
      }
      const options = {
        limit: limit || 0,
        page: page || 0,
        sort: { reated_at: -2 }
      };
      const result = await aggregatePaginate(data, options);
      res.json(new response(result, responseMessage.SUCCESS))
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  async CronJob(req, res, next) {
    const validationSchema = Joi.object({
      email: Joi.string().trim().required()
    });
    const validatedBody = await validationSchema.validateAsync(req.body);
    const { email } = validatedBody;
    const user = await findUser({ email });
    if (!user) {
      throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      if (user.otp === req.body.otp) {
        throw apiError
      }
    }

  }

}
export default new userController();
