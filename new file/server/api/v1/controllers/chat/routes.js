import  Express   from "express";
import controller from "./controller";
import auth from '../../../../helper/auth'


export default Express.Router()
.post('/oneToOneChat',auth.verifyToken,controller.oneToOneChat)