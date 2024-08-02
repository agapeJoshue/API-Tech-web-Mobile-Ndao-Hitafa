const Sequelize = require('sequelize');
const { successResponse, errorResponse, } = require("../services/response.service");
const { getAllFriend, find_on_user,
    getAllFriend2, getAllNoFriends,
    getAllInvitations, addFriend, annulerDemande,
    acceptInvitation, annulerInvitation, update_user,destroy_user
} = require("../services/users.service");

const bcrypt = require("bcrypt");
const config = require("../config/config.auth");

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
                channelUUID: response ? response : "initialMessage"
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


/**
 * Suppression compte utilisateur
 * @param {*} req
 * @param {*} res
 */
exports.deleteAccount = async (req, res) => {
    try {
        const { user_id } = req.params;
        const response = await destroy_user(user_id);

        return res.status(200).send({ message: "Votre compte a été supprimer" });
    } catch (err) {
        return res.status(500).send(errorResponse({ message: err.message }));
    }
}


/**
 * Suppression compte utilisateur
 * @param {*} req
 * @param {*} res
 */
exports.updateUsername = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { username, password } = req.body;
        const condition = { where: { id: user_id } };

        const user = await find_on_user(condition);
        if (!user) {
            return res.send(errorResponse({ message: "L'utilisateur n'a pas été trouvé ou n'existe pas." }));
        }

        const verify = await bcrypt.compare(password, user.password);
        if (!verify) {
            return res.status(200).send(errorResponse({ message: "Le mot de passe que vous avez saisi est incorrect." }));
        }
        const userData = {
            nom: username
        };
        await update_user(userData, user_id);

        return res.status(200).send({ message: "Votre nom a été modifier" });
    } catch (err) {
        return res.status(500).send(errorResponse({ message: err.message }));
    }
}


/**
 * Suppression compte utilisateur
 * @param {*} req
 * @param {*} res
 */
exports.updateEmail = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { email, password } = req.body;
        const condition = { where: { id: user_id } };

        const user = await find_on_user(condition);
        if (!user) {
            return res.send(errorResponse({ message: "L'utilisateur n'a pas été trouvé ou n'existe pas." }));
        }

        const verify = await bcrypt.compare(password, user.password);
        if (!verify) {
            return res.status(200).send(errorResponse({ message: "Le mot de passe que vous avez saisi est incorrect." }));
        }
        const userData = {
            email
        };
        await update_user(userData, user_id);

        return res.status(200).send({ message: "Votre email a été modifier" });
    } catch (err) {
        return res.status(500).send(errorResponse({ message: err.message }));
    }
}


/**
 * Suppression compte utilisateur
 * @param {*} req
 * @param {*} res
 */
exports.updatePassword = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { currentPassword, newPassword, confirmNewPassword } = req.body;
        const condition = { where: { id: user_id } };

        if (newPassword != confirmNewPassword) {
            return res.send(errorResponse({ message: "New password do not match!" }));
        }

        const user = await find_on_user(condition);
        if (!user) {
            return res.send(errorResponse({ message: "L'utilisateur n'a pas été trouvé ou n'existe pas." }));
        }

        const verify = await bcrypt.compare(currentPassword, user.password);
        if (!verify) {
            return res.status(200).send(errorResponse({ message: "Le mot de passe que vous avez saisi est incorrect." }));
        }

        const userData = {
            password: await bcrypt.hash(newPassword, 8),
        };

        await update_user(userData, user_id);

        return res.status(200).send({ message: "Votre mot de passe a été modifier" });
    } catch (err) {
        return res.status(500).send(errorResponse({ message: err.message }));
    }
}

