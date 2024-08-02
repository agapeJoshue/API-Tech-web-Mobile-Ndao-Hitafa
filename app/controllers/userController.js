const Sequelize = require('sequelize');
const { successResponse, errorResponse, } = require("../services/response.service");
const { getAllFriend,
    getAllFriend2, getAllNoFriends,
    getAllInvitations, addFriend, annulerDemande,
    acceptInvitation, annulerInvitation
} = require("../services/users.service");

const { verifyUserHasDiscu } = require('../services/chat.service');

/**
 * Get all user 
 * @param {*} req
 * @param {*} res
 */
exports.getAllUsers = async (req, res) => {
    try {
        const UserLists = await Users.findAll();
        res.status(200).send(successResponse(UserLists));
    } catch (err) {
        res.status(500).send(errorResponse({ message: err.message }));
    }
};


/**
 * Listes des contacts / amis
 * @param {*} req
 * @param {*} res
 */
exports.friends = async (req, res) => {
    try {
        const { user_id } = req.params;
        const condition = { where: { [Sequelize.Op.or]: [{ user_id1: user_id }, { user_id2: user_id }] } };
        const friends = await getAllFriend(user_id, condition);
        return res.status(200).send(friends);
    } catch (err) {
        return res.status(500).send(errorResponse({ message: err.message }));
    }
}


/**
 * Listes des contacts / amis
 * @param {*} req
 * @param {*} res
 */
exports.friends2 = async (req, res) => {
    try {
        const { user_id } = req.params;
        const condition = { where: { [Sequelize.Op.or]: [{ user_id1: user_id }, { user_id2: user_id }] } };
        const friends = await getAllFriend2(user_id, condition);
        if (!friends) {
            return res.send(friends);
        }
        let responses = [];
        for (const friend of friends) {
            const response = await verifyUserHasDiscu(user_id, friend.user_id);
            const data = {
                user_id: friend.user_id,
                username: friend.username,
                email: friend.email,
                profile_url: friend.profile_url,
                status: friend.status,
                channelUUID: response ? response :  "initialMessage"
            }
            responses.push(data);
        }

        return res.status(200).send(responses);
    } catch (err) {
        return res.status(500).send(errorResponse({ message: err.message }));
    }
}


/**
 * Listes des utilisateur qui ne sont pas encore amis avec l'utilisateur connecté
 * @param {*} req
 * @param {*} res
 */
exports.listsUsers = async (req, res) => {
    try {
        const { user_id } = req.params;
        const response = await getAllNoFriends(user_id);
        return res.status(200).send(response);
    } catch (err) {
        return res.status(500).send(errorResponse({ message: err.message }));
    }
}


/**
 * Listes des demandes d'ajout
 * @param {*} req
 * @param {*} res
 */
exports.listsDemande = async (req, res) => {
    try {
        const { user_id } = req.params;
        const received_by = user_id;
        const condition = { where: { received_by, is_accepted: null } };
        const invitations = await getAllInvitations(condition);
        return res.send(invitations);
    } catch (err) {
        return res.status(500).send(errorResponse({ message: err.message }));
    }
}


/**
 * Ajouter un ami / envoyé un demande d'etre ami
 * @param {*} req
 * @param {*} res
 */
exports.addNewFriend = async (req, res) => {
    try {
        const { sent_by, received_by } = req.params;
        const invitation = { sent_by, received_by };
        await addFriend(invitation);
        return res.send({ message: "Demande envoyé" });
    } catch (err) {
        return res.status(500).send({ message: err.message })
    }
}


/**
 * Ajouter un ami / envoyé un demande d'etre ami
 * @param {*} req
 * @param {*} res
 */
exports.cancelDemande = async (req, res) => {
    try {
        const { sent_by, received_by } = req.params;
        const condition = { where: { sent_by, received_by } };
        const response = await annulerDemande(condition);
        return res.send({ message: "Demande envoyé" });
    } catch (err) {
        return res.status(500).send({ message: err.message })
    }
}


/**
 * Ajouter un ami / accepter un demande de devenir ami
 * @param {*} req
 * @param {*} res
 */
exports.acceptAInvitation = async (req, res) => {
    try {
        const { received_by, invitation_id } = req.params;
        const response = await acceptInvitation(invitation_id, received_by);

        if (!response) {
            return res.send(errorResponse({ message: "Invitation n'est plus disponible" }));
        }

        return res.status(200).send({ message: "Demande accepté" });
    } catch (err) {
        return res.status(500).send(errorResponse({ message: err.message }));
    }
}


/**
 * Ajouter un ami / accepter un demande de devenir ami
 * @param {*} req
 * @param {*} res
 */
exports.cancelInvitation = async (req, res) => {
    try {
        const { received_by, invitation_id } = req.params;
        const response = await annulerInvitation(invitation_id, received_by);

        if (!response) {
            return res.send({ message: "Invitation n'est plus disponible" });
        }

        return res.status(200).send({ message: "Demande annuler" });
    } catch (err) {
        return res.status(500).send(errorResponse({ message: err.message }));
    }
}
