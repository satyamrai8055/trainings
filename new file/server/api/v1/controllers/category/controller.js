import Joi from "joi";
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import responseMessage from "../../../../../assets/responseMessage";
import commonFunction from "../../../../helper/util";
import status from "../../../../enums/status";
import userType from "../../../../enums/userType";
import categoryServices from "../../services/category";
const {
  findUser,
  findUsers,
  createUser,
  findUserlist,
  deleteShop,
  updateUserById,
} = categoryServices;

export class categoryController {
  async createCategory(req, res, next) {
    const validationSchema = Joi.object({
      categoryName: Joi.string().trim().required(),
      shopId: Joi.string().trim().required(),
      categoryImage: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      const { categoryName, shopId, categoryImage } = validatedBody;
      const user = await findUser({
        $and: [{ _id: req.userId }, { userType: userType.ADMIN }],
      });
      if (!user) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }
      const Category = await findUsers({ _id: shopId });
      if (!Category) {
        throw apiError.notFound(responseMessage.NOT_FOUND);
      }
      const file = req.body.categoryImage;
      const uploadimage = await commonFunction.getSecureUrl(file);
      validatedBody.categoryImage = uploadimage;
      const obj = {
        categoryName: validatedBody.categoryName,
        shopId: validatedBody.shopId,
        categoryImage: uploadimage,
      };
      const result = await createUser(obj);
      res.json(new response(result, responseMessage.CREATE));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  async deleteCategory(req, res, next) {
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
      const category = await findUserlist({ _id: req.params._id });
      if (!category) {
        throw apiError.invalid(responseMessage.NOT_FOUND);
      }
      const result = await deleteShop(category);
      res.json(new response(result, responseMessage.DELETED));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  async updateCategory(req, res, next) {
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
      const category = await findUserlist({ _id: req.params._id });
      if (!category) {
        throw apiError.invalid(responseMessage.NOT_FOUND);
      }
      const { categoryName, categoryImage } = req.body;
      const result = await updateUserById(category, {
        $set: { categoryName, categoryImage },
      });
      res.json(new response(result, responseMessage.UPDATE));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  async getCategory(req, res, next) {
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
      const category = await findUserlist({ _id: req.params._id });
      if (!category) {
        throw apiError.invalid(responseMessage.NOT_FOUND);
      }
      const result = await findUserlist(category);
      res.json(new response(result,responseMessage.SUCCESS));

    } catch (error) {
        console.log(error);
        return next(error);
    }
  }
}
export default new categoryController();
