const prisma = require('../config/prisma');

const socketHandler = (io) => {
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('🟢 Connected:', socket.id);

    // Join
    socket.on('join', (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.join(userId);
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
      console.log('User joined:', userId, '| Socket:', socket.id);
    });

    // Send Message
    socket.on('sendMessage', async (data) => {
      try {
        const { senderId, receiverId, message } = data;
        if (!senderId || !receiverId || !message) return;

        const newMessage = await prisma.message.create({
          data: { senderId, receiverId, message }
        });

        const finalMsg = { ...newMessage, _id: newMessage.id };

        // Receiver ka socket ID map se nikalo
        const receiverSocketId = onlineUsers.get(receiverId);
        console.log('Sending to receiver:', receiverId, '| Socket ID:', receiverSocketId);

        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receiveMessage', finalMsg);
        }

        // Sender ko bhi bhejo (apna message screen pe dikhane ke liye)
        socket.emit('receiveMessage', finalMsg);

      } catch (err) {
        console.error('Socket Error:', err);
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
      console.log('🔴 Disconnected:', socket.id);
    });
  });
};

module.exports = socketHandler;