require('dotenv').config();

const http = require('http');
const { app, checkDB } = require('./app');
const { initSocket } = require('./sockets');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// init socket.io
initSocket(server);

checkDB().then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 Unify backend running on port ${PORT}`);
    });
});
