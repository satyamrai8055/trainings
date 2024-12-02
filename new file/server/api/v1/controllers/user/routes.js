import  Express   from "express";
import controller from "./controller";
import auth from "../../../../helper/auth"

export default Express.Router()
.post('/userSignUp',controller.userSignUp)
.post('/verifyOTP',controller.verifyOTP)
.post('/resendOTP',controller.resendOTP)

.post('/forgetPassword',controller.forgetPassword)
.post('/updatePassword',controller.updatePassword)
.post('/resetPassword',controller.resetPassword)
.post('/userlogin',controller.userlogin)

.get('/getProfile',auth.verifyToken,controller.getProfile)
.put('/editUserProfile',auth.verifyToken,controller.editUserProfile)
.get('/generateQR',controller.generateQR)
.get('/generate2FA',controller.generate2FA)
.post('/verify2FA',controller.verify2FA)
.get('/aggregatePaginate',controller.aggregatePaginate) 