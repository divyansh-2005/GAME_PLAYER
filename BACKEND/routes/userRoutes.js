const express = require("express");
const Router = express.Router();
const UserController = require("../controllers/userController");
const auth = require("../middleware/auth");

Router.post("/user/register", UserController.registerUser);
Router.post("/user/fetch", UserController.fetchUser);
Router.get(
  "/user/dashboard",
  auth.verifyUser,
  UserController.authorizeDashboard
);
Router.post("/user/logout", UserController.logoutUser);

// using telegram id
// Router.post("/user/save", UserController.saveUser);
// Router.get("/user/fetch", UserController.fetchUser);

module.exports = Router;
