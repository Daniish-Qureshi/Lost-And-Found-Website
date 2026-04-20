const prisma = require('../config/prisma');
const { Profanity, ProfanityOptions } = require('@2toad/profanity')

const options = new ProfanityOptions()
options.wholeWord = false
const profanity = new Profanity(options)
profanity.addWords(['chutiya', 'madarchod', 'bhenchod', 'harami', 'kutta', 'kamina', 'randi', 'gaandu', 'saala', 'lund', 'gand', 'bhosdike', 'mc', 'bc'])

// Rate limiting for messages
const messageRateLimit = new Map()
const isRateLimited = (userId) => {
  const now = Date.now()
  const userMsgs = messageRateLimit.get(userId) || []
  const recent = userMsgs.filter(t => now - t < 60000)
  if (recent.length >= 30) return true
  messageRateLimit.set(userId, [...recent, now])
  return false
}

const socketHandler = (io) => {
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('🟢 Connected:', socket.id);

    socket.on('join', (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.join(userId);
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
      console.log('User joined:', userId, '| Socket:', socket.id);
    });

    socket.on('sendMessage', async (data) => {
      try {
        const { senderId, receiverId, message, itemId } = data;
        if (!senderId || !receiverId || !message) return;

        if (isRateLimited(senderId)) {
          socket.emit('chatError', 'Bahut zyada messages bhej rahe ho! Thoda ruko.')
          return
        }

        if (message.trim().length === 0) return
        if (message.length > 500) {
          socket.emit('chatError', 'Message 500 characters se zyada nahi ho sakta!')
          return
        }

        const cleanMessage = profanity.censor(message.trim())

        const newMessage = await prisma.message.create({
          data: { senderId, receiverId, message: cleanMessage, itemId: itemId || null }
        });

        const finalMsg = { ...newMessage, _id: newMessage.id };

        const receiverSocketId = onlineUsers.get(receiverId)
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receiveMessage', finalMsg);
        }

        socket.emit('receiveMessage', finalMsg);

      } catch (err) {
        console.error('Socket Error:', err);
      }
    });

    socket.on('typing', (data) => {
      const receiverSocket = onlineUsers.get(data.receiverId);
      if (receiverSocket) io.to(receiverSocket).emit('typing', data.senderId);
    });

    socket.on('stopTyping', (data) => {
      const receiverSocket = onlineUsers.get(data.receiverId);
      if (receiverSocket) io.to(receiverSocket).emit('stopTyping', data.senderId);
    });

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