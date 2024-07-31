const Sequelize = require('sequelize');
const uuid = require('uuid');
const { successResponse, errorResponse } = require("../services/response.service");
const { frTime, frDate } = require("../services/date.service");
const {
    find_on_user
} = require("../services/users.service");

const {
    newDiscussion,
    sendMessage,
    getMessageUser,
} = require("../services/chat.service");


/**
 * Initialise message and need to associate this function on sample or multiple user
 * @param {*} req
 * @param {*} res
 */
exports.initMessage = (io) => async (req, res) => {
    try {
        const { user_id, recipient_id, message } = req.body;
        const condition = { where: { id: user_id } }
        const userInfo = await find_on_user(condition);
        if (!userInfo) {
            return res.send(errorResponse({ message: "L'utilisateur n'existe pas." }));
        }

        const dataUser = {
            user_id,
            username: userInfo.nom,
            email: userInfo.email,
            profile_url: userInfo.profile_url,
        }

        const channel = await newDiscussion({ channel_uuid: uuid.v4(), user: user_id, user_id: recipient_id , title: "private message"});

        const newMessage = await sendMessage(channel.channel_uuid, user_id, message);
        const dataMessage = {
            channel_uuid: channel.channel_uuid,
            user_sender_info: dataUser,
            title: channel.title ? channel.title : "private message",
            is_admin: true,
            message: {
                uuid: newMessage.uuid,
                content: newMessage.content,
                fullDate: newMessage.createdAt,
                date: frDate(newMessage.createdAt),
                time: frTime(newMessage.createdAt)
            }
        }

        io.emit('receive_message_user_' + recipient_id, dataMessage);
        return res.status(200).send(dataMessage);
    } catch (error) {
        return res.status(500).send(errorResponse(error));
    }
};


/**
 * Listes des messages de l'utilisateur connecter
 * @param {*} req
 * @param {*} res
 */
exports.messageLists = async (req, res) => {
    try {
        const {user_id} = req.body;
        const response = await getMessageUser(user_id);
        if (!response) {
            return res.send(successResponse({ message: "Vous n'avez pas encore des discussions en cour." }));
        }
        return res.send(successResponse(response));
    } catch (err) {
        return res.status(500).send(errorResponse({ message: err.message }));
    }
}
