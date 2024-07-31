const db = require("../../models");
const Users = db.Users;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config.auth");
const { successResponse, errorResponse, } = require("../services/response.service");
const { create_user, update_user, find_on_user } = require("../services/users.service");


/**
 * Identification de l'utilisateur
 * @param {*} req
 * @param {*} res
 */
exports.signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        const condition = { where: { email } };
        const user = await find_on_user(condition);
        if (!user) {
            return res.send(errorResponse({ message: "L'utilisateur n'a pas été trouvé ou n'existe pas." }));
        }

        const verify = await bcrypt.compare(password, user.password);
        if (!verify) {
            return res.status(200).send(errorResponse({ message: "Le mot de passe que vous avez saisi est incorrect." }));
        }

        const userInfo = {
            user_id: user.id,
            username: user.nom,
            email: user.email,
            profile_url: user.profile_url,
        };

        const token = await jwt.sign({ email: user.email }, config.secretKey, {
            expiresIn: config.expiresIn,
        });

        return res.send(successResponse({ message: "connected", userInfo, token }));
    } catch (err) {
        return res.send(errorResponse({ message: err.message }));
    }
}


/**
 * Création du compte de l'utilisateur
 * @param {*} req
 * @param {*} res
 */
exports.signUp = async (req, res) => {
    try {
        const path = {
            0: "lib/images/uploads/happy-young-cute-illustration-face-profile-png.webp",
            1: "lib/images/uploads/png-transparent-profile-logo-computer-icons-user-user-blue-heroes-logo-thumbnail.png",
            2: "lib/images/uploads/Profile-Male-PNG.png",
        };
        const numero = Math.floor(Math.random() * 3);
        const options = {
            nom: req.body.username,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, 8),
            profile_url: path[numero]
        };
        const newUser = await create_user(options);

        const userInfo = {
            user_id: newUser.id,
            username: newUser.nom,
            email: newUser.email,
            profile_url: newUser.profile_url,
        };

        return res.status(200).json(successResponse({ message: "Le compte à été crée", userInfo }));
    } catch (err) {
        return res.status(500).send(errorResponse({ message: err.message }));
    }
}