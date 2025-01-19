const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  SECRET_KEY,
  GMAIL_PASSWORD,
  GMAIL_USER,
  MONGODB_URI,
  PORT,
} = require("../utils/config");
const nodemailer = require("nodemailer");
const authController = {
  // register
  register: async (request, response) => {
    try {
      const { name, email, password } = request.body;
      const user = await User.findOne({ email }); // find user by email already exists or not
      if (user) {
        return response.status(400).json({ message: "User already exists" }); // if user exists then return message
      }
      const hashedPassword = await bcrypt.hash(password, 10); // password encryption

      newUser = new User({ name, email, password: hashedPassword }); // if user not exists then create new user
      await newUser.save();
      response.status(201).json({ message: "User created successfully" });
    } catch (error) {
      response.status(500).json({ message: error.message });
    }
  },

  // login

  login: async (request, response) => {
    try {
      const { email, password } = request.body;
      const user = await User.findOne({ email });
      if (!user) {
        return response.status(404).json({ message: "user not found" });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return response.status(401).json({ message: "invalid password" });
      }
      const token = jwt.sign({ userId: user._id }, SECRET_KEY, {
        expiresIn: "1h",
      });
      response.status(200).json({ token });
    } catch (error) {
      response.status(500).json({ message: error.message });
    }
  },
  // logout
  logout: async (request, response) => {
    try {
      response.status(200).json({ message: "logout successfully" });
    } catch (error) {
      response.status(500).json({ message: error.message });
    }
  },
  // forget password
  resetPassword: async (request, response) => {
    try {
      const { email } = request.body;
      const user = await User.findOne({ email });
      if (!user) {
        return response
          .status(404)
          .json({ message: "No account found with this email" });
      }

      const crypto = require("crypto");
      const token = crypto.randomBytes(20).toString("hex");
      user.resetPassword = token;
      user.resetPasswordExpires = Date.now() + 3600000;
      await user.save();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER, 
          pass: process.env.GMAIL_PASSWORD ,
        },
      });

      const message = {
        from: "",
        to: user.email,
        subject: "Password Reset",
        text: `Reset your password using the following token: ${token}`,
      };

      transporter.sendMail(message, (err) => {
        if (err) {
          return response
            .status(500)
            .json({ message: "Failed to send reset email",error:err });
        }
        response.status(200).json({ message: "Password reset email sent" });
      });
    } catch (error) {
      response.status(500).json({ message: error.message });
    }
  },
  // changepassword
  changePassword: async (request, response) => {
    try {
      const { code, password } = request.body;
      const user = await User.findOne({
        resetPassword: code,
        resetPasswordExpires: { $gt: Date.now() },
      });
      if (!user) {
        return response
          .status(404)
          .json({ message: "Invalid or expired reset code" });
      }
      const hashPassword = await bcrypt.hash(password, 10);
      user.password = hashPassword;
      user.resetPassword = null;
      user.resetPasswordExpires = null;
      await user.save();
      response
        .status(200)
        .json({ message: "Password has been successfully reset" });
    } catch (error) {
      console.error("Error during password reset:", error.message);
      response.status(500).json({ message: "Internal server error" });
    }
  },
};
module.exports = authController;
