//服务器及页面部分
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    users=[];//保存所有在线用户的昵称
app.use('/', express.static(__dirname + '/liveChat'));
server.listen(4000);
console.log("server , start");
//socket部分
io.on('connection', function(socket) {
    //昵称设置
    socket.on('login', function(nickname) {
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname); //向所有连接到服务器的客户端发送当前登陆用户的昵称 
            io.sockets.emit('system', nickname, users.length, 'login');
        };
    });
    socket.on('disconnect',function(){
         //将断开连接的用户从users中删除
        users.splice(socket.userIndex, 1);
        //通知除自己以外的所有人
        socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
    })
    socket.on('postMsg',function(msg){
        socket.broadcast.emit('newMsg',socket.nickname,msg)
    })
    socket.on('img',function(imgData){
        socket.broadcast.emit('newImg', socket.nickname, imgData);
    })
    
});
    