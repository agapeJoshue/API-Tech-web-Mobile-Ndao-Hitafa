module.exports = (app, io) => {
    const chatsController = require("../../controllers/chatsController.js");
    var routes = require("express").Router();

    router.post("/new", chatsController.initMessage(io));
    router.get("/list-messages", chat.chatsController(io));

    app.use("/api/chats", routes);
};
