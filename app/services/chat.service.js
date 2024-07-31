const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const db = require("../../models");
const Users = db.Users;
const Messages = db.messages;
const userMessages = db.user_messages;
const { frTime, frDate } = require("../services/date.service");

exports.newDiscussion = async (option) => {
    try {
        return await Messages.create(option);
    } catch (err) {
        throw new Error(err.messages);
    }
}

exports.sendMessage = async (channel_uuid, user_id, content) => {
    try {
        return await userMessages.create({ channel_uuid, user_id, content });
    } catch (err) {
        throw new Error(err.messages);
    }
}

exports.getMessageUser = async (user_id) => {
    try {
        let discussions = [];
        const channel_uuids = await Messages.findAll({
            where: {
                [Op.or]: [
                    { user: user_id },
                    { user_id }
                ]
            }
        });
        if (channel_uuids.length > 0) {
            for (const channel of channel_uuids) {
                const user_sender = await Messages.findOne({
                    where: {
                        channel_uuid: channel.channel_uuid,
                        user_id: { [Sequelize.Op.ne]: user_id }
                    },
                });

                const user = await Users.findOne({
                    where: { id: user_sender.user_id }
                });

                const mess = await Messages.findOne({ where: { channel_uuid: channel.channel_uuid } });

                const messages = await userMessages.findAll({
                    where: {
                        channel_uuid: channel.channel_uuid
                    },
                    order: [['createdAt', 'DESC']],
                    limit: 1
                });
                let data;
                if (messages.length > 0) {
                    data = {
                        channel_uuid: channel.channel_uuid,
                        user_id: user.id,
                        username: mess.is_group ? mess.title || "Group's Name" : user.pseudo || user.username,
                        email: mess.is_group ? "" : user.email,
                        profile_url: mess.is_group ? mess.discussion_image : user.profil_url,
                        validated: user.is_validate == 1 ? true : false,
                        content: messages[0].content,
                        fullDate: messages[0].createdAt,
                        date: frDate(messages[0].createdAt),
                        heure: frTime(messages[0].createdAt),
                        is_read: messages[0].is_read == 1 ? true : false
                    }
                } else {
                    data = {
                        channel_uuid: channel.channel_uuid,
                        user_id: user.id,
                        username: mess.is_group ? mess.title || "Group's Name" : user.pseudo || user.username,
                        email: mess.is_group ? "groupe de discussion" : user.email,
                        profile_url: mess.is_group ? mess.discussion_image : user.profil_url,
                        validated: user.is_validate == 1 ? true : false,
                        content: "Nouveau discussion de groupe",
                        fullDate: mess.createdAt,
                        date: frDate(mess.createdAt),
                        heure: frTime(mess.createdAt),
                        is_read: true
                    }
                }
                discussions.push(data);
            }

            discussions.sort((a, b) => new Date(b.fullDate) - new Date(a.fullDate));

            return discussions
        }
        return false
    } catch (err) {
        throw new Error(err.message);
    }
}
