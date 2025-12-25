const chatService = require('../services/chat.service');

const registerChatSocket = (io, socket) => {
  console.log('Client connected:', socket.id);

  // Join Chat Room
  socket.on('join_chat', async ({ userId, helpId }) => {
    try {
      // Cari ChatRoom aktif untuk user ini
      const chatRoom = await chatService.getChatRoomByHelpId(userId, helpId);

      if (!chatRoom) {
        socket.emit('join_error', { message: 'No active chat room found or unauthorized' });
        return;
      }

      const roomName = `chat_${chatRoom.id}`;
      socket.join(roomName);

      const rawMessages = await chatService.getMessages(chatRoom.id);

      const messages = rawMessages.map(m => ({
        id: m.id,
        sender_id: m.sender_id,
        content: m.message,
        created_at: m.created_at,
      }));

      socket.emit('join_success', {
        chatRoomId: chatRoom.id,
        messages,
      });

      socket.emit('join_success', { chatRoomId: chatRoom.id, messages });
    } catch (err) {
      console.error(err);
      socket.emit('join_error', { message: 'Server error' });
    }
  });

  // Send Message
  socket.on('send_message', async ({ userId, chatRoomId, content }) => {
    try {
      const canAccess = await chatService.canAccessRoom(userId, chatRoomId);
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
