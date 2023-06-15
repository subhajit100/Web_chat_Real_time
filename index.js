// initial ceremony for server side
const express = require('express');
const app = express();
const http = require('http');
const port = process.env.PORT || 3000;

// static files access to nodejs
app.use("/css", express.static(__dirname + '/css'));
app.use('/images',express.static(__dirname + '/images'));
app.use('/js',express.static(__dirname + '/js'));
app.use('/sounds',express.static(__dirname + '/sounds'));
const server = http.createServer(app);

const { Server } = require("socket.io");

const io = new Server(server);

// contains the user name list with key as socket.id and value as user name
const users = {};

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log("io socket connected");
    // handling 'new-user-joined' event when someone new joined and broadcast this to everyone with the new user name
    socket.on('new-user-joined', name => {
        // update it in the users list with the socket id.
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
    });

    // handling 'send' event when someone sends a message
    socket.on('send', message => {
        // will hit broadcast at 'receive' event with the given object.
        socket.broadcast.emit('receive', {message: message, name: users[socket.id]});
    });

    // handling 'disconnect' event when someone leaves the chat like close the browser window ('disconnect' is built in event, but all above are custom user defined events).
    socket.on('disconnect', () => {
        // will hit broadcast at 'receive' event with the given object.
        socket.broadcast.emit('someoneLeft', users[socket.id]);
        delete users[socket.id];
    });
});

// listening on port `port`
server.listen(port, () => {
    console.log(`listening on port ${port}`);
  });