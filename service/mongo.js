var mongoose = require('mongoose');
var options = {
	server:{
		socketOptions:{
			keepAlive: 1
		}
	},
	replset:{
		socketOptions:{
			keepAlive: 1
		}
	}
};
mongoose.connect('mongodb://localhost/chats',options);
var Schema = mongoose.Schema;

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
  console.log("mongo has been connected!");
});

var friendChatSchema = new Schema({
  selfUid:String,
  date: Date,
  content: String,
  friendUid: String,
},{collection:"friendchat"});

friendChatSchema.statics.findChatsByDate = function(uid, requiredDate, callback){
	return this.model('friendchat').find({slefUid:uid, date:requiredDate},callback);
}

var eventChatSchema = new Schema({
  eventEid:String,
  memberUid: String,
  date: Date,
  content: String
},{autoIndex: false, collection:"eventchat"});

eventChatSchema.statics.findChatsByDate = function(eid, requiredDate, callback){
	return this.model('eventchat').find({date:requiredDate},callback);
}

exports.friendchat = mongoose.model('friendchat', friendChatSchema);
var friendchat = exports.friendchat;

exports.eventChat = mongoose.model('eventchat',eventChatSchema);
var eventchat = exports.eventchat;

//test
// var chat = new friendchat({selfUid:"123",date:new Date(),time:"now",content:"you guess~",friendUid:'234',friendName:"shabi"});
// chat.save(function(err, small){
// 	if(err){
// 		console.log(err);
// 	}else{
		// friendchat.findChatsByDate("today",function(err, chats){
		// 	console.log(chats);
		// });
// 	}
// });