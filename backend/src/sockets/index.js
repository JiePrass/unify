const { Server } = require('socket.io');
const socketAuth = require('./socketAuth.middleware');
const registerChatSocket = require('./chat.socket');

let io;

    const initSocket = (server) => {
    io = new Server(server, {
        cors: {
        origin: '*',
        transports: ['websocket'],
        allowEIO3: true,
        },
    });

    io.use(socketAuth);

    io.on('connection', (socket) => {
        registerChatSocket(io, socket);
    });

    return io;
    };

const getIO = () => io;

module.exports = { initSocket, getIO };
