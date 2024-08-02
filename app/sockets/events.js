const db = require('../../models');
const Sequelize = require('sequelize');
const userMessages = db.user_messages;
const { newMessage } = require("../services/chat.service.js");

const eventAction = (io) => {
  const userListing = new Set();
  io.on('connection', (socket) => {
    //const userID = socket.handshake.query.userID;
    //userListing.set(userID, socket);

    //console.log(`User ${userID} connected`);

    socket.on('sendMessage', async (data) => {
      console.log(data);
      const message = {
        user_id: data.sender,
        channel_uuid: data.channelUUID,
        content: data.content,
      }
      const response = await newMessage(message);
      if (!response) {

      }
      console.log(response);
      io.emit(`messageReceived_${message.receivedBy}`, message);
    });

    /* socket.on('disconnect', () => {
      userListing.delete(userID);
      console.log(`User ${userID} disconnected`);
    }); */
  });
};

module.exports = eventAction;
