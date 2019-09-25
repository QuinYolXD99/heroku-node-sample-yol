var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var activeUsers = [];
var express = require('express')
app.use(express.static('public'))
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.get('/chat', function(req, res) {
    res.sendFile(__dirname + '/chat.html');
});
io.on('connection', function(socket) {

    socket.on('set-online', function(user) {
        socket.id = user.username;
        activeUsers.push(socket.id)
        socket.broadcast.emit('joined', user.username)
        console.log(activeUsers)
        io.emit("online", activeUsers)
    })

    socket.on('typing', function(isTyping) {
        socket.broadcast.emit('typing', isTyping)
    })

    socket.on('stop-typing', function(stop_typing) {
        socket.broadcast.emit('stop-typing', stop_typing)
    })

    socket.on('check-username', function(username) {
        var found = false;
        if (activeUsers.includes(username)) {
            found = true;
        }
        if (!found) {
            socket.emit('verify-username', '1');
        } else {
            socket.emit('verify-username', '0');
        }
    })



    socket.on('message', function(msg) {
        // console.log(msg.receiver)
        socket.broadcast.emit("broadcastMessage", msg);
    });

    socket.on('typing', function(username) {
        socket.broadcast.emit('typing', username)

    })

    socket.on('disconnect', function(e) {
        for (let i = 0; i < activeUsers.length; i++) {
            if (activeUsers[i] == socket.id) {
                socket.broadcast.emit('leave', activeUsers[i])
                activeUsers.splice(i, 1);
                break;
            }

        }
        io.emit("logout", socket.id)
    })
});

http.listen(port, function() {
    console.log('server started !\nhttp://127.0.0.1:' + port);
});