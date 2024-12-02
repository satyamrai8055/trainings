import  Express   from "express";
import controller from "./controller";
import auth from '../../../../helper/auth';
 
export default Express.Router()

.post('/createProduct',auth.verifyToken,controller.createProduct)
.delete('/deleteProduct/:_id',auth.verifyToken,controller.deleteProduct)
.put('/updateProduct/:_id',auth.verifyToken,controller.updateProduct)
.get('/getProduct/:_id',auth.verifyToken,controller.getProduct) 
.get('/productList',auth.verifyToken,controller.productList)
.get('/productlists',controller.productlists)
.get('/productlistAgg',controller.productlistAgg) 
.get('/product',controller.product)
.get('/paginate',controller.paginate)  
.put('/productLikeDislike',auth.verifyToken,controller.productLikeDislike)
.put('/Productlisting',auth.verifyToken,controller.Productlisting) 