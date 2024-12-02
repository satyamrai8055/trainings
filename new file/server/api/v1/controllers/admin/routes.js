import  Express   from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";



export default Express.Router()

.post('/adminlogin',controller.adminlogin)
.post('/adminforgetPassword',controller.adminforgetPassword)
.get('/adminGetdata',auth.verifyToken,controller.adminGetdata)
.post('/adminresetPassword',controller.adminresetPassword)