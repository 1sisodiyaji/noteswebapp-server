const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    trim: true 
  },
  slug: { 
    type: String, 
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    trim: true 
  },
  password: { 
    type: String, 
    trim: true 
  },
  username: { 
    type: String, 
    required: [true, 'Username is required'], 
    trim: true 
  }, 
  image: { 
    type: String, 
    trim: true 
  },
  otp: { 
    type: String, 
    trim: true 
  },
  isVerify: { 
    type: Boolean, 
    default: false 
  },
  isAdmin: { 
    type: Boolean, 
    default: false 
  },
  loginCount:{
    type: Number,
    default:0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
