const Message = require('../models/Message');

const socketHandler = (io) => {
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('🟢 User connected:', socket.id);

    // User join
    socket.on('user-join', (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit('online-users', Array.from(onlineUsers.keys()));
    });

    // Send message
    socket.on('send-message', async (data) => {
      try {
        const message = await Message.create({
          sender: data.senderId,
          receiver: data.receiverId,
          message: data.message,
        });

        const receiverSocket = onlineUsers.get(data.receiverId);
        if (receiverSocket) {
          io.to(receiverSocket).emit('receive-message', message);
        }
        socket.emit('message-sent', message);
      } catch (error) {
        console.log('Message error:', error);
      }
    });

    // Typing
    socket.on('typing', (data) => {
      const receiverSocket = onlineUsers.get(data.receiverId);
      if (receiverSocket) io.to(receiverSocket).emit('user-typing', data.senderId);
    });

    socket.on('stop-typing', (data) => {
      const receiverSocket = onlineUsers.get(data.receiverId);
      if (receiverSocket) io.to(receiverSocket).emit('user-stop-typing', data.senderId);
    });

    // Disconnect
    socket.on('disconnect', () => {
      onlineUsers.forEach((socketId, userId) => {
        if (socketId === socket.id) onlineUsers.delete(userId);
      });
      io.emit('online-users', Array.from(onlineUsers.keys()));
      console.log('🔴 User disconnected:', socket.id);
    });
  });
};

module.exports = socketHandler;