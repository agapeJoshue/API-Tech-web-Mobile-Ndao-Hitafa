const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const db = require("../../models");
const Users = db.Users;
const Messages = db.messages;
const userMessages = db.user_messages;
const userAssociated = db.participants;
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
        const channel_uuids = await userAssociated.findAll({
            where: { user_id }
        });
        if (channel_uuids.length > 0) {
            for (const channel of channel_uuids) {
                const user_sender = await userAssociated.findOne({
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
                data = {
                    channel_uuid: channel.channel_uuid,
                    user_id: user.id,
                    username: user.pseudo ? user.pseudo : user.nom || mess.title,
                    email: user.email,
                    profile_url: user.profile_url,
                    content: messages[0].content,
                    fullDate: messages[0].createdAt,
                    date: frDate(messages[0].createdAt),
                    heure: frTime(messages[0].createdAt),
                    status: messages[0].is_read == 1 ? "Vue" : "Sent",
                }
                discussions.push(data);
            }

            discussions.sort((a, b) => new Date(b.fullDate) - new Date(a.fullDate));
        }
        return discussions;
    } catch (err) {
        throw new Error(err.message);
    }
}

exports.getDiscussionUser = async (channel_uuid, user_id) => {
    try {
        let DiscussionLists = [];
        const user_sender = await userAssociated.findOne({
            where: {
                channel_uuid,
                user_id: { [Sequelize.Op.ne]: user_id }
            }
        });

        const user = await Users.findOne({
            where: { id: user_sender.user_id }
        });

        const message = await Messages.findOne({ where: { channel_uuid } });
        const messageInfo = {
            channel_uuid,
            title: user.pseudo ? user.pseudo : user.nom || mess.title,
            theme: message.theme,
            seeder: {
                user_id: user.id,
                username: user.username,
                email: user.email,
                profile_url: user.profil_url,
                validated: user.is_validate == 1 ? true : false,
            }
        }

        const discussions = await userMessages.findAll({
            where: {
                channel_uuid
            },
            order: [['createdAt', 'ASC']],
        });

        for (const discussion of discussions) {
            const userInfo = await Users.findOne({ where: { id: discussion.user_id } });
            const discussionInfo = {
                uuid: discussion.uuid,
                isMe: userInfo.id == user_id,
                content: discussion.content,
                fullDate: discussion.createdAt,
                date: frDate(discussion.createdAt),
                heure: frTime(discussion.createdAt),
                is_read: discussion.is_read == 1 ? true : false,
                is_updated: discussion.is_updated,
                is_retired: discussion.is_retired,
            }
            DiscussionLists.push(discussionInfo);
        }

        return DiscussionLists;
    } catch (err) {
        throw new Error(err.messages);
    }
}

exports.createParticipes = async (channel_uuid, user_id, is_admin) => {
    try {
        return await userAssociated.create({ channel_uuid, user_id, is_admin });
    } catch (err) {
        throw new Error(err.messages);
    }
}

exports.newMessage = async (option) => {
    try{
        return await userMessages.create(option);
    }catch(err){
        throw new Error(err.message);
    }
}
