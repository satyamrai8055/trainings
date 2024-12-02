const express = require("express");
const router = express.Router();
router.use(express.json());
const controller = require("../controller/Control");
router.post("/signup",controller.signup);
router.post("/login",controller.login);
router.get("/getUser/:id",controller.getUser);
router.put("/updateData/:id",controller.updateData);
router.delete("/deleteData/:id",controller.deleteData);
router.get("/nodemailer",controller.nodemailer); 
router.get("/getdata",controller.getdata);
router.get("/paginate",controller.paginate);
router.post("/otpverify",controller.otpverify);
router.get("/findname",controller.findname);
router.get("/token",controller.token);
module.exports=router