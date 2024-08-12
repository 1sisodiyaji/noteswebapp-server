const User = require("../models/User.model"); 
const mailValidator = require("../utils/mailValidator");
const sendEmail = require("../utils/mail");

exports.VerifyUser = async (req, res) => {
    const { email, code } = req.body; 
  
    if (!code || !email) {
      return res.status(401).json({ status: "error", message: "Please fill the data" });
    }
    const validmail = mailValidator(email);
  
    if (!validmail) {
      return res.status(400).json({ status: "error", message: "Invalid email" });
    }
  
    try {
  
      const user = await User.findOne({ email }); 
  
      if (!user) {
        return res.status(404).json({ status: "error", message: "User not found" });
      }
  
      if (user.otp !== code) {
        return res.status(400).json({ status: "error", message: "Invalid verification code" });
      }
  
      user.isVerify = true;
      user.otp = '';
  
      const saved = await user.save();
  
      if(!saved) {
          return res.status(500).json({ status: "error", message: "Failed to update user status" });
      }
  
      return res.status(200).json({ status: "success", message: "User verified successfully" });
    } catch (error) {
      console.error("Error verifying user:", error);
      return res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
};

exports.contactemail =  async (req, res) => {
    const { name, email, message } = req.body; 

    if (!name || !email || !message) {
      return res.json({ status: "error", message: "Incomplete data provided." });
    }
  
    const savedFeedback = await feedback.create({
      name: name,
      email: email,
      message: message,
    });
  
    if (savedFeedback) {
      try {
        const mailsended = await sendEmail(email, "FEEDBACK", message);
        if (!mailsended) {
          return res.json({ status: "error", message: "Mail not sended" });
        } else {
          return res.json({
            status: "success",
            message: "Your Feedback is submitted",
          });
        }
      } catch (error) {
        console.error("Error sending email:", error.message);
        return res.json({ status: "error", message: "Internal Server Error" });
      }
    } else {
      return res.json({ status: 500 }, { message: "Failed to save data" });
    }
};
  
exports.sendemail =  async (req, res) => {
    const { email } = req.body; 
    
    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email is required.",
      });
    }
    const isValidEmail = mailValidator(email);
    if(!isValidEmail) {
        return res.status(400).json({
          status: "error",
          message: "Invalid email format.",
        });
    }
  
    const otp = Math.floor(100000 + Math.random() * 900000);  
    try {
      const isValidUser = await User.findOne({ email: email });
  
      if (!isValidUser) {
        return res
          .status(404)
          .json({ status: "error", message: "User not found. Please create your account" });
      }
  
      const filter = { email: email };
      const update = { otp: otp };
      const options = {
        new: true,
        upsert: true,
      };
  
      const updatedUser = await User.findOneAndUpdate(filter, update, options);
  
      if (!updatedUser) {
        return res
          .status(500)
          .json({ status: "error", message: "Failed to update user with OTP." });
      }  
     const sended =  await sendEmail(email , "VERIFY" , otp);
  
       
      return res .status(200) .json({ status: "success", message: "OTP sent successfully." });
    } catch (error) {
      console.error("Error sending OTP email:", error.message);
      return res
        .status(500)
        .json({ status: "error", message: "Internal Server Error" });
    }
}
  
exports.verifyOtp =  async (req, res) => {
    const { otp } = req.body;
    const { email } = req.body;  
    if (!email || !otp) {
      return res.json({ status: "error", message: "Please fill the otp." });
    } else { 
      const otpCheck = await User.findOne({ email });  
      if (otpCheck) {
        console.log(otpCheck.otp);
        console.log(otp);
        if (otpCheck.otp == otp) {
          return res.json({
            status: "success",
            message: "OTP verified successfully.",
          });
        } else {
          return res.json({ status: "error", message: "OTP not verified." });
        }
      } else {
        return res.json({
          status: "error",
          message: " User does not exist , Please register.",
        });
      }
    }
}