module.exports = (app, io) => {
    const usersController = require("../../controllers/userController");
    var routes = require("express").Router();

    routes.get("/contactes/:user_id", usersController.friends);
    routes.get("/contactes2/:user_id", usersController.friends2);
    routes.get("/suggestion-amis/:user_id", usersController.listsUsers);
    routes.get("/lists-invitations-friend/:user_id", usersController.listsDemande);
    routes.post("/add-new-friend/:sent_by/:received_by", usersController.addNewFriend);
    routes.delete('/cancel-demande/:sent_by/:received_by',usersController.cancelDemande);
    routes.put("/accept-a-invitation/:received_by/:invitation_id", usersController.acceptAInvitation);
    routes.delete('/cancel-a-invitation/:received_by/:invitation_id',usersController.cancelInvitation);

    app.use("/api/users", routes);
};
