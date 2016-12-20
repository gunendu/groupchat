var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/test');

var Schema = mongoose.Schema;

var ChatSchema = new Schema({
    message: String
});

var Chat = mongoose.model('Chat',ChatSchema);

module.exports = Chat;
