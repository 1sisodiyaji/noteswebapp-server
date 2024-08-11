const bcrypt = require("bcryptjs");
const User = require("../models/User.model"); 
const jwt = require("jsonwebtoken"); 
const sendEmail = require("../utils/mail");
const  mailValidator = require("../utils/mailValidator");  
const slugify = require('slugify');

exports.getUserData = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; 
    if (!token) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json({ status: "error", message: "Token verification failed" });
      } 

      const { id } = decoded;

      const user = await User.findById(id).select("-password");
      if (!user) {
        return res
          .status(404)
          .json({ status: "error", message: "User not found" });
      }

      res.status(200).json({ status: "success", user: user });
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

exports.register = async (req, res) => {
    const { name, email, password } = req.body;  

    if( !email || !password  || !name){
        return res.status(400).json({ status: "error", message: "All fields are required" });
    } 

    const isValidEmail = mailValidator(email);

    if(!isValidEmail){
        return res.status(400).json({ status: "error", message: "Invalid email" });
    }

    try {

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ status: "error", message: "User already exists . please login .." });
      }

      // Hash the password
      const hashPassword = await bcrypt.hash(password, 10);

      // Create a username
      const formattedName = name.replace(/\s+/g, "_").toLowerCase();
      const randomNumber = Math.floor(Math.random() * 90) + 10;
      const username = `${formattedName}@${randomNumber}`;

      // Generate verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000);
      const slug = slugify(name, { lower: true, strict: true });
      // Create the new user
      const newUser = new User({
        name,
        slug,
        email,
        password: hashPassword,
        username,
        loginCount: 1,
        otp: verificationCode,
      });

      const savedUser = await newUser.save().catch((error) => {
        console.error("Error saving user to database:", error);
        throw error;
      });

     await sendEmail(email, "VERIFY", verificationCode);

       

      // Create JWT token
      const token = jwt.sign(
        { id : savedUser._id },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "30d",
        }
      );

      // Set the token in a cookie
      res.cookie("token", token, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });

      return res.json({
        status: "success",
        message:
          "Account created successfully. Please check your email for the verification code.",
        token,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ status: "error", message: "Account creation failed." });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if(!email || !password) {
        return res.status(400).json({ status: "error", message: "All fields are required" });
    }

     const validEmail = mailValidator(email);
     if(!validEmail){
        return res.status(400).json({ status: "error", message: "Invalid email" });
    }

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.json({
          status: "error",
          message: "Account does not exist.",
        });
      }

      // Check if user is verified
      if (!user.isVerify) {
        return res.json({
          status: "error",
          message: "Please verify your account.",
        });
      }

      // Validate password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.json({ status: "error", message: "Invalid password." });
      }

      // Update login count
      user.loginCount++;
      const saved = await user.save();

      if(!saved) { 
        return res.json({ status: "error", message: "Failed to update login count." });
      }

      // Generate JWT token
      const token = jwt.sign({ id : user._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: "30d",
      });

      // Set the token in a cookie
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        status: "success",
        message: "Login successful.",
        token,
      });
    } catch (error) {
      console.error("Error during login:", error);
      return res.json({ status: "error", message: "Login failed." });
    }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("token", { path: "/" });
    res
      .status(200)
      .json({ status: "success", message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Logout failed" });
  }
};

exports.saveuserData = async (req, res) => {
  const { email, name, username, image } = req.body;
  if (!email || !name || !username || !image) {
    return res.json({ status: "400" }, { message: "Please Fill the data" });
  }

  try {
    const existingUser = await User.findOne({ email });

    const createToken = (user) => {
      return jwt.sign({ id : user._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: "30d",
      });
    };

    if (existingUser) {
      const token = createToken(existingUser);
      const isVerifiedUser = existingUser.isVerify;
      if (!isVerifiedUser) {
        return res.json(
          { status: 401 },
          { message: "please verify your account" }
        );
      }

      existingUser.loginCount++;
      await existingUser.save();

      res.cookie("token", token, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });

      return res.json({
        status: "success",
        message: "Login successful.",
        token,
      });
    } else {
      // Generate username from email
      const randomNumber = Math.floor(Math.random() * 90) + 10;
      const usernameDB = `${username}@${randomNumber}`;
      const slug = slugify(name, { lower: true, strict: true });
      const newUser = new User({
        name: name,
        slug:slug,
        email: email,
        username: usernameDB,
        image: image,
        isVerify: true,
        loginCount: 1,
      });

      const savedUser = await newUser.save();
      if (savedUser) {
        const token = createToken(savedUser);

        // Set the token in a cookie
        res.cookie("token", token, {
          maxAge: 30 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        });

        return res.json({
          status: "success",
          message: "Account created and logged in successfully.",
          token,
        });
      } else {
        return res.json({ status: "error", message: "Login Failed." });
      }
    }
  } catch (error) {
    console.error("Error saving user data:", error);
    return res.json({ status: "error", message: "Internal Server Error" });
  }
};

exports.updatePassword = async (req, res) => {
  const { password, email } = req.body; 
  if (!password || !email) {
    return res.json({ status: "error", message: "Please fill the password." });
  }
  const validEmail = mailValidator(email);
  if(!validEmail) {
    return res.json({ status: "error", message: "Invalid email" });
  }

  try {
    hashedPssword = await bcrypt.hash(password, 10);
    const user = await User.findOneAndUpdate(
      { email },
      { password: hashedPssword },
      { new: true }
    );

    if (!user) {
      return res.json({ status: "error", message: "User not found." });
    }
    return res.json({
      status: "success",
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Error updating password:", error.message);
    return res.json({ status: "error", message: "Internal Server Error" });
  }
};

exports.deleteUser = async (req, res) => {
    const id = req.params.id ;
    if(!id) {
        return res.status(400).json({ message: "Invalid user id" });
    }

  try {
    const deleteUser = await User.findByIdAndDelete(id);

    if (!deleteUser) {
      return res.status(404).json({ message: "User not found" });
    } else { 
      return res.status(200).json({ message: "User deleted successfully" });
    }
  } catch (err) {
    console.error("Failed to delete User:", err.message);
    return res.status(500).json({ message: "Failed to delete User" });
  }
};

exports.getUserByUsername = async (req, res) => {
  const username = req.params.username;  
  if(!username){
    return res.status(400).json({ message: "Invalid user id" });
  } 
  try {
    const user = await User.findOne({ username: username }).select("-password -otp -loginCount -isAdmin");
    
    if (!user) {
      return res.status(404).json({ message: "username not found" });
    }  
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Error fetching user" });
  }
}