const Message = require('../models/Message');
const Notification = require('../models/Notification');

const socketHandler = (io) => {
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('🟢 User connected:', socket.id);

    // User join
    socket.on('join', (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
      console.log('User joined:', userId);
    });

    // Send message
    socket.on('sendMessage', async (data) => {
      try {
        const message = await Message.create({
          sender: data.senderId,
          receiver: data.receiverId,
          message: data.message,
        });

        const receiverSocket = onlineUsers.get(data.receiverId);
        if (receiverSocket) {
          io.to(receiverSocket).emit('receiveMessage', message);
        }
        socket.emit('receiveMessage', message);
      } catch (error) {
        console.log('Message error:', error);
      }
    });

    // Typing
    socket.on('typing', (data) => {
      const receiverSocket = onlineUsers.get(data.receiverId);
      if (receiverSocket) io.to(receiverSocket).emit('typing', data.senderId);
    });

    socket.on('stopTyping', (data) => {
      const receiverSocket = onlineUsers.get(data.receiverId);
      if (receiverSocket) io.to(receiverSocket).emit('stopTyping', data.senderId);
    });

    // Disconnect
    socket.on('disconnect', () => {
      onlineUsers.forEach((socketId, userId) => {
        if (socketId === socket.id) onlineUsers.delete(userId);
      });
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
      console.log('🔴 User disconnected:', socket.id);
    });
  });
};

module.exports = socketHandler;