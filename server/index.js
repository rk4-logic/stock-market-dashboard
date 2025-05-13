const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const setupSocket = require('./socket');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Use actual domain in production
    methods: ['GET', 'POST'],
  },
  path: '/socket.io',
});

setupSocket(io); // Setup all socket logic

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
