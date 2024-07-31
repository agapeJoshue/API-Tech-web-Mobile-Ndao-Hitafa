// Contains all route used by app
module.exports = (app , io) => {
    require('./groups/auth.route')(app , io)
};