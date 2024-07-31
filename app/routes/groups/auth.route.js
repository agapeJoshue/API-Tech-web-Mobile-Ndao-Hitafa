module.exports = (app , io) => {
    const authController = require("../../controllers/authController");
    var routes = require("express").Router();
   
    routes.post("/login", authController.signIn);
    routes.post("/register", authController.signUp);
  
    app.use("/api/auth", routes);
  };
  