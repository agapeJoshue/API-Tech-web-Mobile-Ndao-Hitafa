module.exports = (app , io) => {
    const chatsController = require("../../controllers/chatsController");
    var routes = require("express").Router();
    
  
    app.use("/api/chats", routes);
  };
  