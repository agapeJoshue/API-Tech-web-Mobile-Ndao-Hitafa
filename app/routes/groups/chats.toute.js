module.exports = (app, io) => {
    const chatsController = require("../../controllers/chatsController.js");
    var routes = require("express").Router();

    routes.post("/new", chatsController.initMessage(io));
    routes.post('/new-message', chatsController.nouveauMessage(io));
    routes.get("/list-messages/:user_id", chatsController.messageLists);
    routes.get("/list-discussions/:channel_uuid/:user_id", chatsController.getDiscussionLists);

    app.use("/api/chats", routes);
};
