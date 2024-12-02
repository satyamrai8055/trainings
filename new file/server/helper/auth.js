import Config from "config";
import jwt from "jsonwebtoken";
import apiError from './apiError';
import responseMessage from "../../assets/responseMessage";
import userModel from "../models/user";
import status from "../enums/status";
import services from "../../server/api/v1/services/user"
const {  findUser  } =services;

module.exports ={
    verifyToken(req, res, next){
        try {
            const token = req.headers["authorization"];
            if(!token){
                throw apiError.notFound(responseMessage.NO_TOKEN);
            }
            jwt.verify(token, Config.get('secretKey'),async(err,result)=>{
                if(err){ 
                    if(err.name =="TokenExpiredError"){
                        throw apiError.badRequest(responseMessage.TOKEN_EXPIRED);
                    }else{
                        throw apiError.unauthorized(responseMessage.UNAUTHORIZED);
                    }
                }else{
                    const user =  await findUser({_id:result._id});
                    if(!user){
                        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
                    }else if(user.status == status.BLOCK){
                        throw apiError.unauthorized(responseMessage.BLOCK_BY_ADMIN);
                    }else{
                        req.userId = result._id;
                        next();
                    }

                }
            })
                
        } catch (error) {
            console.log(error);
            return next(error);
        }
    }
}
