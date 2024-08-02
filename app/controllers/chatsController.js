const Sequelize = require('sequelize');
const uuid = require('uuid');
const { successResponse, errorResponse } = require("../services/response.service");
const { frTime, frDate } = require("../services/date.service");
const {
    find_on_user
} = require("../services/users.service");

const {
    newDiscussion,
    sendNewMessage,
    getMessageUser,
    getDiscussionUser,
    createParticipes,
    newMessage
} = require("../services/chat.service");


/**
 * Initialise message and need to associate this function on sample or multiple user
 * @param {*} req
 * @param {*} res
 */
exports.initMessage = (io) => async (req, res) => {
    try {
        const { sender, receivedBy, content } = req.body;
        const condition = { where: { id: sender } }

        const userInfo = await find_on_user(condition);
        if (!userInfo) {
            return res.send(errorResponse({ message: "L'utilisateur n'existe pas." }));
        }

        const dataUser = {
            sender,
            username: userInfo.nom,
            email: userInfo.email,
            profile_url: userInfo.profile_url,
        }

        console.log(dataUser);

        const channel = await newDiscussion({ channel_uuid: uuid.v4(), title: "private message" });
        
        await createParticipes(channel.channel_uuid, sender, true);
        await createParticipes(channel.channel_uuid, receivedBy, false);

        const newMessage = await sendNewMessage(channel.channel_uuid, sender, content);
        console.log(newMessage)
        
        const dataMessage = {
            channel_uuid: channel.channel_uuid,
            uuid: newMessage.uuid,
            isMe: userInfo.id == user_id,
            content: newMessage.content,
            fullDate: newMessage.createdAt,
            date: frDate(newMessage.createdAt),
            heure: frTime(newMessage.createdAt),
            is_read: newMessage.is_read == 1 ? true : false,
            is_updated: newMessage.is_updated,
            is_retired: newMessage.is_retired,
        }

        io.emit('receive_message_user_' + receivedBy, dataMessage);
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
        const { user_id } = req.params;
        const response = await getMessageUser(user_id);
        if (!response) {
            return res.send({ message: "Vous n'avez pas encore des discussions en cour." });
        }
        return res.send(response);
    } catch (err) {
        return res.status(500).send(errorResponse({ message: err.message }));
    }
}


/**
 * Listes des discussions dans un channel
 * @param {*} req
 * @param {*} res
 */
exports.getDiscussionLists = async (req, res) => {
    try {
        const { channel_uuid, user_id } = req.params;

        const response = await getDiscussionUser(channel_uuid, user_id);
        return res.status(200).send(response);
    } catch (err) {
        return res.status(500).send(errorResponse({ message: err.message }));
    }
}


exports.nouveauMessage =  (io) =>async (req, res) => {
    try {
        const { channelUUID, content, sender, receivedBy } = req.body;

        const message = {
            user_id: sender,
            channel_uuid: channelUUID,
            content: content,
        }
        const response = await newMessage(message);
        
        const discussionInfo = {
            uuid: response.uuid,
            isMe: false,
            content: response.content,
            fullDate: response.createdAt,
            date: frDate(response.createdAt),
            heure: frTime(response.createdAt),
            is_read: response.is_read == 1 ? true : false,
            is_updated: response.is_updated,
            is_retired: response.is_retired,
        }

        io.emit(`messageReceived_${receivedBy}`, discussionInfo);
        return res.status(200).send(response);
    } catch (err) {
        return res.status(500).send(errorResponse({ message: err.message }));
    }
}
