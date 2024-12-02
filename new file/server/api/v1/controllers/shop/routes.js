import  Express   from "express";
import controller from "./controller";
import auth from '../../../../helper/auth'

export default Express.Router()

.post('/adminLogin',controller.adminLogin)
.post('/createShop',auth.verifyToken,controller.createShop)
.delete('/deleteShop/:_id',auth.verifyToken,controller.deleteShop)
.put('/updateShop/:_id',auth.verifyToken,controller.updateShop)
.get('/getShope',auth.verifyToken,controller.getShope)
.get('/getShop/:_id',auth.verifyToken,controller.getShop)
.post('/geonearShop',auth.verifyToken,controller.geonearShop) 
