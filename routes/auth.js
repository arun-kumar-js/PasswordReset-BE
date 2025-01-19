const express = require("express");
const auth = require("../middleware/auth");
const authController = require("../controllers/AuthController");
const authRouter = express.Router();
authRouter.post("/Register", authController.register);
authRouter.post("/Login", authController.login);
authRouter.post("/Logout", authController.logout);
authRouter.post("/Reset", authController.resetPassword);
authRouter.put("/Change", authController.changePassword);
module.exports = authRouter;
