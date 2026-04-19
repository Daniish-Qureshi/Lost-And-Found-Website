const prisma = require('../config/prisma');

const badWords = [
  'fuck', 'shit', 'bitch', 'ass', 'bastard', 'damn', 'crap',
  'chutiya', 'madarchod', 'bhenchod', 'harami', 'kutta', 'kamina',
  'randi', 'gaandu', 'saala', 'mc', 'bc', 'lund', 'gand', 'bhosdike'
]

const filterBadWords = (text) => {
  let filtered = text
  badWords.forEach(word => {
    const regex = new RegExp(word, 'gi')
    filtered = filtered.replace(regex, '*'.repeat(word.length))
  })
  return filtered
}

// Rate limiting for messages
const messageRateLimit = new Map()
const isRateLimited = (userId) => {
  const now = Date.now()
  const userMsgs = messageRateLimit.get(userId) || []
  const recent = userMsgs.filter(t => now - t < 60000) // last 1 minute
  if (recent.length >= 30) return true // max 30 messages per minute
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

        // Rate limit check
        if (isRateLimited(senderId)) {
          socket.emit('error', 'Bahut zyada messages bhej rahe ho! Thoda ruko.')
          return
        }

        // Message length check
        if (message.trim().length === 0) return
        if (message.length > 500) {
          socket.emit('error', 'Message 500 characters se zyada nahi ho sakta!')
          return
        }

        // Bad words filter
        const cleanMessage = filterBadWords(message.trim())

        const newMessage = await prisma.message.create({
          data: { senderId, receiverId, message: cleanMessage, itemId: itemId || null }
        });

        const finalMsg = { ...newMessage, _id: newMessage.id };

        // Receiver ko bhejo
        const receiverSocketId = onlineUsers.get(receiverId)
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receiveMessage', finalMsg);
        }

        // Sender ko confirm
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