import  Express   from "express";
import controller from './controller';
import auth from '../../../../helper/auth'


export default Express.Router()

.post('/createCategory',auth.verifyToken,controller.createCategory)
.delete('/deleteCategory/:_id',auth.verifyToken,controller.deleteCategory)
.put('/updateCategory/:_id',auth.verifyToken,controller.updateCategory)
.get('/getCategory/:_id',auth.verifyToken,controller.getCategory)