const chatService = require('../services/chat.service');

const registerChatSocket = (io, socket) => {
  console.log('Client connected:', socket.id);

  // Join Chat Room
  socket.on('join_chat', async ({ userId, helpId }) => {
    console.log(`Attempting to join chat: userId=${userId}, helpId=${helpId}`);

    try {
      // Cari ChatRoom aktif untuk user ini (requester atau relawan)
      const chatRoom = await chatService.getChatRoomByHelpId(userId, helpId);

      if (!chatRoom) {
        socket.emit('join_error', { message: 'No active chat room found or unauthorized' });
        return;
      }

      const roomName = `chat_${chatRoom.id}`;
      socket.join(roomName);
      socket.emit('join_success', { chatRoomId: chatRoom.id });
      console.log(`User ${userId} joined room ${roomName}`);
    } catch (err) {
      console.error(err);
      socket.emit('join_error', { message: 'Server error' });
    }
  });

  // Send Message
  socket.on('send_message', async ({ userId, chatRoomId, content }) => {
    try {
      const canAccess = await chatService.canAccessRoom(userId, chatRoomId);
      console.log('canAccessRoom result:', canAccess);
      if (!canAccess) {
        socket.emit('send_error', { message: 'Unauthorized to send message in this room' });
        return;
      }

      const message = await chatService.createMessage(chatRoomId, userId, content);

      // Emit pesan ke semua member room
      const roomName = `chat_${chatRoomId}`;
      io.to(roomName).emit('new_message', {
        id: message.id,
        sender_id: message.sender_id,
        content: message.message,
        created_at: message.created_at,
      });
    } catch (err) {
      console.error(err);
      socket.emit('send_error', { message: 'Server error' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
};

module.exports = registerChatSocket;
