import Joi from "joi";
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import responseMessage from "../../../../../assets/responseMessage";
import commonFunction from "../../../../helper/util";
import status from "../../../../enums/status";
import userType from "../../../../enums/userType";
import productModel from "../../../../models/product";
import productServices from "../../services/product";
import { query } from "express";
const {
  findUser,
  findUsers,
  createUser,
  findUserlist,
  deleteProduct,
  updateUserById,
  aggregatePaginate,
  findUserdetails,
  aggregate,
  paginate,
  findproductById,
  findByIdAndUpdate,
  findProduct,
  addToSet,
  popProduct,
  addFieldProduct,
} = productServices;

export class productController {
  async createProduct(req, res, next) {
    const validationSchema = Joi.object({
      productName: Joi.string().trim().required(),
      price: Joi.number().positive().greater(0).required(),
      categoryId: Joi.string().required(),
      productImage: Joi.string().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      const { productName, price, categoryId, productImage } = validatedBody;
      const admin = await findUser({
        $and: [{ _id: req.userId }, { userType: userType.ADMIN }],
      });
      if (!admin) {
        throw apiError.notFound(responseMessage.ADMIN_NOT_FOUND);
      }

      const product = await findUsers({ _id: categoryId });
      if (!product) {
        throw apiError.notFound(responseMessage.NOT_FOUND);
      }
      const file = req.body.productImage;
      const uploadimage = await commonFunction.getSecureUrl(file);
      validatedBody.productImage = uploadimage;
      const obj = {
        productName: validatedBody.productName,
        price: validatedBody.price,
        categoryId: validatedBody.categoryId,
        productImage: uploadimage,
      };
      const result = await createUser(obj);
      return res.json(new response(result, responseMessage.CREATE));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  async deleteProduct(req, res, next) {
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
      const product = await findUserlist({ _id: req.params._id });
      if (!product) {
        throw apiError.invalid(responseMessage.NOT_FOUND);
      }
      const result = await deleteProduct(product);
      return res.json(new response(result, responseMessage.DELETED));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  async updateProduct(req, res, next) {
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
      const product = await findUserlist({ _id: req.params._id });
      if (!product) {
        throw apiError.invalid(responseMessage.NOT_FOUND);
      }
      const { productName, price, productImage } = req.body;
      const result = await updateUserById(product, {
        $set: { productName, price, productImage },
      });
      return res.json(new response(result, responseMessage.UPDATE));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  async getProduct(req, res, next) {
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
      const product = await findUserlist({ _id: req.params._id });
      if (!product) {
        throw apiError.invalid(responseMessage.NOT_FOUND);
      }
      const result = await findUserlist(product);
      return res.json(new response(result, responseMessage.SUCCESS));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  // productlisting admin with populate
  async productList(req, res, next) {
    try {
      const admin = await findUser({
        $and: [{ _id: req.userId }, { userType: userType.ADMIN }],
      });
      if (admin) {
        throw apiError.notFound(responseMessage.NOT_FOUND);
      }
      const product = await findUserdetails();
      if (product) {
        return res.json(new response(product, responseMessage.SUCCESS));
      } else {
        throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
      }
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  // productlisting populate without admin
  async productlists(req, res, next) {
    try {
      const products = await findUserdetails();
      if (!products) {
        throw apiError.notFound(responseMessage.NOT_FOUND);
      }
      return res.json(new response(products, responseMessage.SUCCESS));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  // aggregatePaginate*************************
  async productlistAgg(req, res, next) {
    const validationSchema = Joi.object({
      productName: Joi.string().trim().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      const { productName } = validatedBody;
      if (!validatedBody) {
        throw apiError.notFound(responseMessage.NOT_FOUND);
      }
      const result = await aggregatePaginate(productName);
      return res.json(new response(result, responseMessage.SUCCESS));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  // aggregate******************************
  async product(req, res, next) {
    try {
      const validationSchema = Joi.object({
        productName: Joi.string().trim().required(),
      });
      const validatedBody = await validationSchema.validateAsync(req.body);
      const { productName } = validatedBody;
      if (!validatedBody) {
        throw apiError.notFound(responseMessage.NOT_FOUND);
      }
      const product = await aggregate(productName);
      if (!product || product.length === 0) {
        throw new apiError.NotFound(responseMessage.NOT_FOUND);
      }
      return res.json(new response(product, responseMessage.SUCCESS));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  async paginate(req, res, next) {
    try {
      const pagination = await paginate();
      res.json(new response(pagination, responseMessage.SUCCESS));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  // product like and dislike
  async productLikeDislike(req, res, next) {
    const validationSchema = Joi.object({
      productId: Joi.string().trim().required(),
      like: Joi.boolean().required(),
    });
    try {
      const validatedBody = await validationSchema.validateAsync(req.body);
      const { productId, like } = validatedBody;
      const userId = req.userId;
      const user = await findUser({ _id: userId });
      if (!user) {
        throw apiError.notFound(responseMessage.NOT_FOUND);
      }
      const product = await findProduct({ _id: productId });

      if (!product) {
        throw apiError.notFound(responseMessage.NOT_FOUND);
      }
      const result = await product.productlike.includes(req.userId);
      if (result) {
        const dislike = await popProduct(productId, req.userId);
        return res.json(new response(dislike, responseMessage.USER_DISLIKE));
      } else {
        const like = await addToSet(productId, req.userId);
        return res.json(new response(like, responseMessage.USER_LIKE));
      }
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
  async Productlisting(req, res, next) {
    try {
      const user = await findUser({ _id: req.userId });
      console.log(user);

      if (!user) {
        throw apiError.notFound(responseMessage.NOT_FOUND);
      }
      const product = await addFieldProduct(req.userId);
      // console.log(product);

      return res.json(new response(product, responseMessage.SUCCESS));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
}

export default new productController();
