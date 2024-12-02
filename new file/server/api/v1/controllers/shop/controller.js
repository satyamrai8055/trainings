import Joi from "joi";
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import bcrypt from "bcrypt";
import responseMessage from "../../../../../assets/responseMessage";
import commonFunction from "../../../../helper/util";
import jwt from "jsonwebtoken";
import status from "../../../../enums/status";
import userType from "../../../../enums/userType";
// *******************************services***********************************
import shopServices from "../../services/shop";
const {
  findUser,
  createUser,
  deleteShop,
  findUsers,
  updateUserById,
  findUserList,
  geonear
} = shopServices;
// ****************************************************************************
export class shopController {
  async adminLogin(req, res, next) {
    const validationSchema = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      const { email, password } = validatedBody;
      const admin = await findUser({
        $and: [{ email: email }, { userType: userType.ADMIN }],
      });
      console.log(admin);
      console.log(admin.password);

      if (!admin) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }
      const result = bcrypt.compareSync(password, admin.password);
      if (result == true) {
        const token = await commonFunction.getToken({ _id: admin._id });
        res.json(new response(token, responseMessage.LOGIN_SUCCESS));
      } else {
        throw apiError.invalid(responseMessage.INVALID_PASSWORD);
      }
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  async createShop(req, res, next) {
    const validationSchema = Joi.object({
      shopName: Joi.string().trim().required(),
      city: Joi.string().trim().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      shopImage: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      const { shopName, city, longitude, latitude, shopImage } = validatedBody;
      const user = await findUser({
        $and: [{ _id: req.userId }, { userType: userType.ADMIN }],
      });
      if (!user) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }
      const file = req.body.shopImage;
      const uploadimage = await commonFunction.getSecureUrl(file); 
      validatedBody.shopImage = uploadimage;
      const obj = {
        email: validatedBody.email,
        shopName: validatedBody.shopName,
        city: validatedBody.city,
        location: {
          type: "Point",
          coordinates: [
            parseFloat(validatedBody.longitude),
            parseFloat(validatedBody.latitude),
            
          ],
        },
        shopImage: uploadimage,
      };
      const result = await createUser(obj);
      res.json(new response(result, responseMessage.CREATE));
    } catch (error) {
      // console.log(error);
      return next(error);
    }
  }
  async deleteShop(req, res, next) { 
    try {
      const admin = await findUser({
        $and: [{ _id: req.userId }, { userType: userType.ADMIN }],
      });
      if (!admin) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }
      const { _id } = req.params;
      if (!_id) {
        throw apiError.invalid(responseMessage.INVALID);
      }
      const shop = await findUsers({ _id: req.params._id });
      if (!shop) {
        throw apiError.invalid(responseMessage.NOT_FOUND);
      }
      const result = await deleteShop(shop);
      res.json(new response(result, responseMessage.DELETED));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  async updateShop(req, res, next) {
    try {
      const admin = await findUser({
        $and: [{ _id: req.userId }, { userType: userType.ADMIN }],
      });
      if (!admin) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }
      const { _id } = req.params;
      if (!_id) {
        throw apiError.invalid(responseMessage.INVALID);
      }
      const shop = await findUsers({ _id: req.params._id });
      if (!shop) {
        throw apiError.invalid(responseMessage.NOT_FOUND);
      }
      const { shopName, city, longitude, latitude } = req.body;
      const result = await updateUserById(shop, {
        $set: {
          shopName,
          city,
          "coordinates.latitude": latitude,
          "coordinates.longitude": longitude,
        },
      });
      res.json(new response(result, responseMessage.SHOP_UPDATE));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  async getShope(req, res, next) {
    try {
      const admin = await findUser({
        $and: [{ _id: req.userId }, { userType: userType.ADMIN }],
      });
      if (!admin) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }

      const shop = await findUserList();
      if (!shop) {
        throw apiError.invalid(responseMessage.NOT_FOUND);
      }
      const result = await findUserList(shop);
      res.json(new response(result, responseMessage.SUCCESS));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  async getShop(req, res, next) { 
    try {
      const admin = await findUser({
        $and: [{ _id: req.userId }, { userType: userType.ADMIN }],
      });
      if (!admin) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }
      const { _id } = req.params;
      if (!_id) {
        throw apiError.invalid(responseMessage.INVALID);
      }
      const shop = await findUsers({ _id: req.params._id });
      if (!shop) {
        throw apiError.invalid(responseMessage.NOT_FOUND);
      }
      const result = await findUsers(shop);
      res.json(new response(result, responseMessage.SUCCESS));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  async geonearShop(req, res, next) {
    const validationSchema = Joi.object({
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      maxDistance:Joi.number().required()

      
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      const{latitude,longitude,maxDistance}= validatedBody;
      const admin = await findUser({
        $and: [{ _id: req.userId }, { userType: userType.ADMIN }],
      });
      if (!admin) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }
      const result = await geonear([ 
        {
          $geoNear:{
            near:{
              type: "point",
              coordinates:[parseFloat(longitude),parseFloat(latitude)],
            },
            distanceField: "distance",
            maxDistance:maxDistance * 1000,
            spherical:  true,
          } 
        }
      ])
      if(result.length === 0){
        throw apiError.notFound(responseMessage.NOT_FOUND);
      }
      res.json(new response(result, responseMessage.SUCCESS));
    } catch (error) {
      console.log(error);
      return next(error);
    } 
  }
}

export default new shopController();
