const sequelize = require('sequelize');
const db = require("../../models");
const Users = db.Users;
const Friends = db.friends;
const Invite = db.invitations;


/**
 * Create a user
 * @param {object} option - The option for creating user
 */
exports.create_user = async (user) => {
    try {
        return await Users.create(user);
    } catch (err) {
        throw new Error(err.message);
    }
}

/**
 * Update a user
 * @param {object} option - The condition and option for updating user
 * @param {number} id
 */
exports.update_user = async (option, id) => {
    try {
        return await Users.update(option, { where: { id } });
    } catch (err) {
        throw new Error(err.message);
    }
}

/**
 * Destroy a user
 * @param {number} id
 */
exports.destroy_user = async (id) => {
    try {
        return await Users.destroy({ where: { id } });
    } catch (err) {
        throw new Error(err.message);
    }
}

/**
 * delete a user
 * @param {number} id
 */
exports.delete_user = async (id) => {
    try {
        return await Users.update({ is_deleted: true }, { where: { id } });
    } catch (err) {
        throw new Error(err.message);
    }
}

/**
 * block a user
 * @param {number} id
 */
exports.block_user = async (id) => {
    try {
        return await Users.update({ is_blocked: true }, { where: { id } });
    } catch (err) {
        throw new Error(err.message);
    }
}

/**
 * Get list of all user
 */
exports.find_all_user = async () => {
    try {
        return await Users.findAll();
    } catch (err) {
        throw new Error(err.message);
    }
}

/**
 * Get list of all user with condition
 * @param {object} condition - The condition for finding user
 */
exports.find_user = async (condition) => {
    try {
        return await Users.findAll(condition);
    } catch (err) {
        throw new Error(err.message)
    }
}

/**
 * Get one user
 * @param {object} condition - The condition for finding user
 */
exports.find_on_user = async (condition) => {
    try {
        return await Users.findOne(condition);
    } catch (err) {
        throw new Error(err.message)
    }
}

/**
 * Add a new Friends
 * @param {object} invitation - The invitation option for create invitation
 */
exports.addFriend = async (invitation) => {
    try {
        return await Invite.create(invitation);
    } catch (err) {
        throw new Error(err.message)
    }
}

/**
 * Lists of demand
 * @param {object} condition - The condition for finding invitation
 */
exports.getAllInvitations = async (condition) => {
    try {
        const invitations_lists = [];
        const invitations = await Invite.findAll(condition);
        if (!invitations) {
            return false
        }
        for (const invitation of invitations) {
            const user = await Users.findOne({ where: { id: invitation.sent_by } });
            //invitation.dataValues = user;
            const data = {
                id: invitation.id,
                user_id: user.id,
                username: user.username,
                email: user.email,
                profile_url: user.profil_url,
                validated: user.is_validate == 1 ? true : false,
                is_accepted: invitation.is_accepted == 1 ? true : false
            }
            invitations_lists.push(data);
        }

        return invitations_lists;
    } catch (err) {
        throw new Error(err.message);
    }
}

/**
 * Add a new Friends
 * @param {number} id - The ID of the user
 * @param {number} received_by - The ID of the user connected
 */
exports.acceptInvitation = async (id, received_by) => {
    try {
        const invitation = await Invite.findOne({ where: { id, received_by } });
        if (!invitation) {
            return false
        }

        await Friends.create({
            user_id1: invitation.sent_by,
            user_id2: received_by
        });

        await Invite.update({ is_accepted: true }, { where: { id } });

        return true;
    } catch (err) {
        throw new Error(err.message)
    }
}

/**
 * Get all user no friend
 * @param {number} userId - The ID of the user
 */
exports.getAllNoFriends = async (userId) => {
    try {
        const friends1 = await Friends.findAll({
            attributes: ['user_id2'],
            where: {
                user_id1: userId
            },
            raw: true
        });

        const friends2 = await Friends.findAll({
            attributes: ['user_id1'],
            where: {
                user_id2: userId
            },
            raw: true
        });

        const friendIdsArray = [
            ...friends1.map(friend => friend.user_id2),
            ...friends2.map(friend => friend.user_id1)
        ];
        const nonFriends = [];
        const users = await Users.findAll({
            where: {
                id: {
                    [sequelize.Op.notIn]: friendIdsArray,
                    [sequelize.Op.ne]: userId
                }
            }
        });

        if (users) {
            for (const user of users) {
                const data = {
                    user_id: user.id,
                    username: user.username,
                    email: user.email,
                    profile_url: user.profil_url,
                    validated: user.is_validate == 1 ? true : false,
                    active: user.is_validate == 1 ? true : false
                }
                nonFriends.push(data);
            }
        }

        return nonFriends
    } catch (err) {
        throw new Error(err.message);
    }
}

/**
 * Get all users who are not friends
 * @param {number} userId - The ID of the user
 * @param {string} searchTerm - The search term for filtering users by username or email
 */
exports.searchNoFriends = async (userId, searchTerm) => {
    try {
        const friends1 = await Friends.findAll({
            attributes: ['user_id2'],
            where: {
                user_id1: userId
            },
            raw: true
        });

        const friends2 = await Friends.findAll({
            attributes: ['user_id1'],
            where: {
                user_id2: userId
            },
            raw: true
        });

        const friendIdsArray = [
            ...friends1.map(friend => friend.user_id2),
            ...friends2.map(friend => friend.user_id1)
        ];

        const nonFriends = [];
        const users = await Users.findAll({
            where: {
                [sequelize.Op.or]: [
                    { username: { [sequelize.Op.like]: `%${searchTerm}%` } },
                    { email: { [sequelize.Op.like]: `%${searchTerm}%` } }
                ],
                id: {
                    [sequelize.Op.notIn]: friendIdsArray,
                    [sequelize.Op.ne]: userId
                }
            }
        });

        if (users) {
            for (const user of users) {
                const data = {
                    user_id: user.id,
                    username: user.username,
                    email: user.email,
                    profile_url: user.profil_url,
                    validated: user.is_validate == 1 ? true : false,
                    active: user.is_validate == 1 ? true : false
                }
                nonFriends.push(data);
            }
        }

        return nonFriends
    } catch (err) {
        throw new Error(err.message);
    }
}

/**
 * Get all friend
 * @param {number} user_id - The ID of the user
 * @param {object} condition - The condition for finding friends
 */
exports.getAllFriend = async (user_id, condition) => {
    try {
        const friends_lists = [];
        const friends = await Friends.findAll(condition);
        if (friends) {
            for (const friend of friends) {
                let user;
                if (user_id == friend.user_id1) {
                    user = await Users.findOne({ where: { id: friend.user_id2 } });
                } else {
                    user = await Users.findOne({ where: { id: friend.user_id1 } });
                }

                if (user) {
                    const data = {
                        user_id: user.id,
                        username: user.username,
                        email: user.email,
                        profile_url: user.profil_url,
                        validated: user.is_validate == 1 ? true : false,
                        active: user.is_validate == 1 ? true : false
                    }
                    friends_lists.push(data);
                }
            }
        }
        return friends_lists;
    } catch (err) {
        throw new Error(err.message)
    }
}

/**
 * Search friend
 * @param {number} user_id - The ID of the user
 * @param {object} condition - The condition for finding friends
 */
exports.searchFriend = async (user_id, condition, searchTerm) => {
    try {
        const friends_lists = [];
        const friends = await Friends.findAll(condition);
        if (friends) {
            for (const friend of friends) {
                let user;
                if (user_id == friend.user_id1) {
                    user = await Users.findOne({
                        where: {
                            [sequelize.Op.or]: [
                                { username: { [sequelize.Op.like]: `%${searchTerm}%` } },
                                { email: { [sequelize.Op.like]: `%${searchTerm}%` } }
                            ],
                            id: friend.user_id2
                        }
                    });
                } else {
                    user = await Users.findOne({
                        where: {
                            [sequelize.Op.or]: [
                                { username: { [sequelize.Op.like]: `%${searchTerm}%` } },
                                { email: { [sequelize.Op.like]: `%${searchTerm}%` } }
                            ],
                            id: friend.user_id1
                        }
                    });
                }

                if (user) {
                    const data = {
                        user_id: user.id,
                        username: user.username,
                        email: user.email,
                        profile_url: user.profil_url,
                        validated: user.is_validate == 1 ? true : false,
                        active: user.is_validate == 1 ? true : false
                    }
                    friends_lists.push(data);
                }
            }
        }
        return friends_lists;
    } catch (err) {
        throw new Error(err.message)
    }
}

/**
 * Get all friend active
 * @param {number} user_id - The ID of the user
 * @param {object} condition - The condition for finding friends
 */
exports.getAllActiveFriend = async (user_id, condition) => {
    try {
        const friends_lists = [];
        const friends = await Friends.findAll(condition);
        if (friends) {
            for (const friend of friends) {
                let user;
                if (user_id === friend.user_id1) {
                    user = await Users.findOne({ where: { id: friend.user_id2, is_actif: true } });
                } else {
                    user = await Users.findOne({ where: { id: friend.user_id1, is_actif: true } });
                }

                if (user) {
                    const data = {
                        user_id: user.id,
                        username: user.username,
                        email: user.email,
                        profile_url: user.profil_url,
                        validated: user.is_validate == 1 ? true : false,
                        active: user.is_validate == 1 ? true : false
                    }
                    friends_lists.push(data);
                }
            }
        }
        return friends_lists;
    } catch (err) {
        throw new Error(err.message)
    }
}

/**
 * search all friend active
 * @param {number} user_id - The ID of the user
 * @param {object} condition - The condition for finding friends
 * @param {string} searchTerm - The term to search in username or email
 */
exports.searchActiveFriend = async (user_id, condition, searchTerm) => {
    try {
        const friends_lists = [];
        const friends = await Friends.findAll(condition);
        if (friends) {
            for (const friend of friends) {
                let user;
                if (user_id === friend.user_id1) {
                    user = await Users.findOne({
                        where: {
                            [sequelize.Op.or]: [
                                { username: { [sequelize.Op.like]: `%${searchTerm}%` } },
                                { email: { [sequelize.Op.like]: `%${searchTerm}%` } }
                            ],
                            id: friend.user_id2,
                            is_actif: true
                        }
                    });
                } else {
                    user = await Users.findOne({
                        where: {
                            [sequelize.Op.or]: [
                                { username: { [sequelize.Op.like]: `%${searchTerm}%` } },
                                { email: { [sequelize.Op.like]: `%${searchTerm}%` } }
                            ],
                            id: friend.user_id1,
                            is_actif: true
                        }
                    });
                }

                if (user) {
                    const data = {
                        user_id: user.id,
                        username: user.username,
                        email: user.email,
                        profile_url: user.profil_url,
                        validated: user.is_validate == 1 ? true : false,
                        active: user.is_validate == 1 ? true : false
                    }
                    friends_lists.push(data);
                }
            }
        }
        return friends_lists;
    } catch (err) {
        throw new Error(err.message)
    }
}