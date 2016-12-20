module.exports = function(io){
  var express = require('express');
  var router = express.Router();
  var _ = require('underscore');
  var chat = require('../db/models/chat.js');

  /* GET home page. */
  router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
  });

  var SaveChat = function(data) {

  }

  var usernames = {};

  io.sockets.on('connection', function (socket) {

  chat.find({},{message:1},function(err,chats){
    console.log(JSON.stringify(chats));
    _.each(chats,function(chat){
        io.sockets.emit('updatechat',chat.message);
    })
  })

	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		// we tell the client to execute 'updatechat' with 2 parameters
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
		// we store the username in the socket session for this client
		socket.username = username;
		// add the client's username to the global list
		usernames[username] = username;
		// echo to client they've connected
		socket.emit('updatechat', 'SERVER', 'you have connected');
		// echo globally (all clients) that a person has connected
		socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
		// update the list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER has disconnected');
	});
});

  return router;
};
