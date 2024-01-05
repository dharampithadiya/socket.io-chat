import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);
var connectedUsers = [];

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
    if(connectedUsers[socket.id]!==undefined){
      delete connectedUsers[socket.id];
    }
  });

  socket.on('setUser', (user) => {
    connectedUsers[socket.id] = { userName: user.userName, socketId: socket.id };
    console.log({'newUser': connectedUsers[socket.id]});
    io.except(socket.id).emit('updateOnlineUserList', {'newUser': connectedUsers[socket.id]});
  });

  socket.on('sendMessage', (data)=>{
    // console.log(connectedUsers[data.receiverSocketId])
    io.to(data.receiverSocketId).emit('newMessage',{
      senderId : data.receiverSocketId,
      message: data.messageInput,
      senderName: connectedUsers[data.receiverSocketId].userName
    });
  })
  

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
  


});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});