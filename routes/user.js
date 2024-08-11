const express = require("express");
const router = express.Router();    
const {VerifyUser , contactemail , sendemail , verifyOtp} = require("../controller/mail.controller");
const {register, getUserData, login, logout, saveuserData, updatePassword, deleteUser, getUserByUsername} = require("../controller/user.controller"); 


router.post("/getuser", getUserData);
router.get("/userbyName/:username", getUserByUsername);
router.post("/register",register );
router.post("/signin", login);
router.post('/verify-user',VerifyUser);
router.post("/logout",logout);
router.post("/saveuserData",saveuserData);
router.post("/contactemail", contactemail);
router.post("/sendemail", sendemail);
router.post("/verifyOtp",verifyOtp);
router.post("/updatePassword",updatePassword); 
router.delete("/delete/:id",deleteUser);


module.exports = router;
