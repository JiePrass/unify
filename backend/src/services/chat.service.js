const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createChatRoomTx = async (tx, assignmentId) => {
    const assignment = await tx.helpAssignment.findUnique({
        where: { id: assignmentId },
    });
    if (!assignment) throw new Error("Assignment not found");

    const existingRoom = await tx.chatRoom.findUnique({
        where: { assignment_id: assignmentId },
    });
    if (existingRoom) return existingRoom;

    return tx.chatRoom.create({
        data: {
            help_request_id: assignment.help_request_id,
            assignment_id: assignment.id,
            is_active: true,
        },
    });
};

exports.createChatRoom = async (assignmentId) => {
    const assignment = await prisma.helpAssignment.findUnique({
        where: { id: assignmentId },
        select: {
            id: true,
            help_request_id: true,
        },
    });
    if (!assignment) throw new Error("Assignment not found");

    return prisma.chatRoom.upsert({
        where: { assignment_id: assignmentId },
        update: {
            is_active: true,
            closed_at: null,
        },
        create: {
            assignment_id: assignment.id,
            help_request_id: assignment.help_request_id,
            is_active: true,
        },
    });
};


exports.getChatRoom = async (chatRoomId) => {
    return prisma.chatRoom.findUnique({
        where: { id: chatRoomId },
        include: {
        assignment: true,
        helpRequest: true,
        },
    });
};

exports.getChatRoomByHelpId = async (userId, helpId) => {
    return prisma.chatRoom.findFirst({
        where: {
        help_request_id: helpId,
        is_active: true,
        OR: [
            { assignment: { helper_id: userId } },
            { helpRequest: { user_id: userId } },
        ],
        },
        include: {
        assignment: true,
        helpRequest: true,
        },
    });
};

exports.canAccessRoom = async (userId, chatRoomId) => {
    const room = await exports.getChatRoom(chatRoomId);
    if (!room) return false;
    return room.assignment.helper_id === userId || room.helpRequest.user_id === userId;
};

exports.getMessages = (chatRoomId) => {
    return prisma.chatMessage.findMany({
        where: { chat_room_id: chatRoomId },
        orderBy: { created_at: 'asc' },
    });
};


exports.createMessage = async (chatRoomId, senderId, content) => {
    const message = await prisma.chatMessage.create({
        data: {
            chat_room_id: chatRoomId,
            sender_id: senderId,
            message: content,
        },
    });

    // Notify recipient
    const room = await prisma.chatRoom.findUnique({
        where: { id: chatRoomId },
        include: {
            assignment: true,
            helpRequest: true,
        },
    });

    if (room) {
        const receiverId = senderId === room.assignment.helper_id 
            ? room.helpRequest.user_id 
            : room.assignment.helper_id;

        await prisma.notification.create({
            data: {
                user_id: receiverId,
                title: "Pesan Baru",
                body: `Anda menerima pesan baru terkait bantuan "${room.helpRequest.title}"`,
                type: "CHAT"
            }
        });
    }

    return message;
};

exports.closeChatRoomTx = async (tx, assignmentId) => {
    return tx.chatRoom.updateMany({
        where: {
            assignment_id: assignmentId,
            is_active: true,
        },
        data: {
            is_active: false,
            closed_at: new Date(),
        },
    });
};

exports.closeChatRoom = async (assignmentId) => {
    return prisma.chatRoom.updateMany({
        where: {
            assignment_id: assignmentId,
            is_active: true,
        },
        data: {
            is_active: false,
            closed_at: new Date(),
        },
    });
};
