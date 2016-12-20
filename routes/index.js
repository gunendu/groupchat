module.exports = function(io){
  var express = require('express');
  var router = express.Router();
  var _ = require('underscore');
  var chat = require('../db/models/chat.js');

  /* GET home page. */
  router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
  });

  var usernames = {};

  io.sockets.on('connection', function (socket) {

  chat.find({},{message:1},function(err,chats){
    _.each(chats,function(chat){
        io.sockets.to(socket.id).emit('updatechat',chat.message);
    })
  })

	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		var chatObj = new chat({
      "message":data
    })
    chatObj.save(function(err){
      if(err) {
        console.log("chat save error",err);
      } else {
        io.sockets.emit('updatechat',data);
      }
    })
	});

	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username){
		socket.username = username;
		usernames[username] = username;

		socket.emit('updatechat', 'SERVER', 'you have connected');
		io.sockets.emit('updateusers', usernames);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		io.sockets.emit('updateusers', usernames);
		//socket.broadcast.emit('updatechat', 'SERVER has disconnected');
	});
});

  return router;
};
