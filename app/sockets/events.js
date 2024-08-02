const db = require('../../models');
const { newMessage } = require("../services/chat.service.js");

const eventAction = (io) => {
  const userListing = new Set();

  io.on('connection', (socket) => {
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
      io.emit(`receive_message_user_${message.receivedBy}`, message);
    });
  });
};

module.exports = eventAction;
