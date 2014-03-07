
/**
 * Module dependencies.
 */ 

require('nodetime').profile({
    accountKey: '26a95b0883dded633cdfe6fb60baba9b65557349', 
    appName: 'circa'
});
var express = require('express');
var http = require('http');
var path = require('path');
var service = require('./service/service'); 
var routes = require('./routes');
var mkdirp = require("mkdirp");
var rimraf = require("rimraf");
var fs = require('fs');

var app = express();
//var redis = require('redis');
// redisClient = redis.createClient();
// redisClient.on("error", function (err) {
//     console.log("Error " + err);
// });

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());  
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
 
if ('development' == app.get('env')) {
  app.use(express.errorHandler()); 
}

if('production' == app.get('env')){
	//do something in production version
}

 
app.get('/',routes.login);
app.get('/user',routes.user);
app.get('/event',routes.event);
app.get('/home',routes.home);
app.get('/updateuserinfo',routes.updateUserInfo);
app.get('/editevent',routes.updateEventInfo);
app.get('/search',routes.search);
app.get('/newevent', routes.createevent);
app.get('/eventmanage',routes.eventmanage);
app.get('/eventnews',routes.eventnews);
app.get('/profile',routes.profile);
app.get('/userprofile',routes.userprofile);
app.get('/eventprofile',routes.eventprofile);
// app.get("/scheduling",routes.scheduling);


/************** URL dispatchers *****************/

//Signup, login, logout
app.post('/signup',express.bodyParser(),service.signUp);
app.post('/login',express.bodyParser(),service.loginAuth);
app.post('/logout',express.bodyParser(),service.logout);

//Create
app.post('/createpost',express.bodyParser(),service.createPost);
app.post('/createreply',express.bodyParser(),service.createReply);
app.post('/createevent',express.bodyParser(),service.createEvent);
app.post('/createschedule', express.bodyParser(),service.createSchedule);
//app.post('/createeventschedule', express.bodyParser(),service.createEventSchedule);

//View Information
app.post('/getselfinfo',express.bodyParser(),service.viewSelfInfo);
app.post('/getuserinfo',express.bodyParser(),service.viewUserInfo);
app.post('/getusersinfo',express.bodyParser(),service.viewUsersInfo);
app.post('/getselffriendsinfo',express.bodyParser(),service.viewSelfFriends);
app.post('/getuserfriendsinfo',express.bodyParser(),service.viewUserFriends);
app.post('/getselfposts',express.bodyParser(),service.viewSelfPosts);
app.post('/getuserposts',express.bodyParser(),service.viewUserPosts);
app.post('/getselfevents',express.bodyParser(),service.viewSelfEvents);
app.post('/getuserevents',express.bodyParser(),service.viewUserEvents);
app.post('/getselfcircatags',express.bodyParser(),service.viewSelfCircatags);
app.post('/getpicture',express.bodyParser(), service.viewPicture);
app.post('/getpictures',express.bodyParser(),service.viewPictures);
app.post('/getcommonfriends',express.bodyParser(),service.viewCommonFriends);

app.post('/getuseravarta',express.bodyParser(),service.viewUserAvarta);
app.post('/getusersmallavarta',express.bodyParser(),service.viewUserSmallAvarta);
app.post('/getselfavarta',express.bodyParser(),service.viewSelfAvarta);
app.post('/getselfsmallavarta',express.bodyParser(),service.viewSelfSmallAvarta);
app.post('/geteventavarta',express.bodyParser(),service.viewEventAvarta);
app.post('/geteventsmallavarta',express.bodyParser(),service.viewEventSmallAvarta);
app.post('/getusercircatags',express.bodyParser(),service.viewUserCircatags);
//app.post('/getpostcontent',express.bodyParser(),service.viewPostContent);
app.post('/getpostscontent',express.bodyParser(),service.viewPostsContent);
app.post('/geteventinfo',express.bodyParser(),service.viewEventInfo);
app.post('/geteventsinfo',express.bodyParser(),service.viewEventsInfo);
app.post('/geteventmembers',express.bodyParser(),service.viewEventMembers);
app.post('/geteventmanagers',express.bodyParser(),service.viewEventManagers);
app.post('/geteventcicatags',express.bodyParser(),service.viewEventCircatags);
app.post('/geteventpost',express.bodyParser(),service.viewEventPosts);
app.post('/geteventschedule',express.bodyParser(),service.viewEventSchedule);
app.post('/getselfschedule',express.bodyParser(),service.viewSelfSchedule);

app.post('/getusernews',express.bodyParser(),service.viewUserNews);
app.post('/geteventnews',express.bodyParser(),service.viewEventNews);
//Search
app.post('/searchuserbyfilter',express.bodyParser(), service.searchUserByFilter);
app.post('/searchuserbyid', express.bodyParser(), service.searchUserById);
app.post('/searchuserbyemail', express.bodyParser(), service.searchUserByEmail);
app.post('/searcheventbyfilter', express.bodyParser(), service.searchEventByFilter);
app.post('/searcheventbyid',express.bodyParser(), service.searchEventById);
app.post('/searchpost', express.bodyParser(), service.searchPost);

//Update Information
app.post('/updatesuserinfo',express.bodyParser(), service.updateUser);
app.post('/updateevent',express.bodyParser(), service.updateEvent);
app.post('/updateselfavarta', express.bodyParser(), service.updateUserAvarta);
app.post('/updateselfsmallavarta', express.bodyParser(), service.updateUserSmallAvarta);
app.post('/updateeventavarta', express.bodyParser(), service.updateEventAvarta);
app.post('/updateeventsmallavarta', express.bodyParser(), service.updateEventSmallAvarta);
app.post('/addeventmanager',express.bodyParser(), service.addEventManager);

//app.post('/updatefriendcomments',express.bodyParser(), service.updateFriendComments);

//Request
app.post('/friendrequest', express.bodyParser(), service.createFriendRequest);
app.post('/joinevent', express.bodyParser(), service.createJoinEventRequest);
app.post('/eventinvitation', express.bodyParser(),service.createEventInvitationRequest);
app.post('/quitevent', express.bodyParser(), service.quitEvent);
app.post('/emailvalidation',express.bodyParser(), service.emailValidation);
app.post('/emailinvitation',express.bodyParser(), service.emailInvitation);
app.post('/validatecode',express.bodyParser(), service.validateCode);
//delete
app.post('/deletefriend', express.bodyParser(), service.deleteFriend);
app.post('/deletepost', express.bodyParser(), service.deletePost);
app.post('/deleteschedule', express.bodyParser(), service.deleteSchedule);
app.post('/deletereply', express.bodyParser(), service.deleteReply);
app.post('/deleteeventmember',express.bodyParser(), service.deleteEventMember);
app.post('/deleteeventmanager',express.bodyParser(), service.deleteEventManager);
//chat
//app.post('/userchat', express.bodyParser(), service.chatToUser);
//app.post('/eventchat', express.bodyParser(), service.chatToEvent);

//notification
app.post('/responsetonotification', express.bodyParser(), service.responseNoti);

//upload Avarta
app.post('/uploadpostpicture',service.uploadPicture);
app.post('/uploadavarta',service.uploadAvarta);
/*************** End *****************/

//Server starts
var server = http.createServer(app).listen(app.get('port'), function(){
  	console.log('Express server listening on port ' + app.get('port'));
});

//configure redis
// redisClient.on("error", function (err) {
//     console.log("Error " + err);
// });

//configure socket.io connection
var socketsList = {};
var notificationsPool = {};
var personalChatPool = {};
var eventChatPool = {};

var io = require("socket.io").listen(server);
io.on('connection',function(socket){
	console.log("server socket connected!");
	socket.on('uid',function(uid){
		socketsList[uid] = socket;
		if(notificationsPool[uid]){
			console.log("pool is not empty");
			for(var i = 0;i < notificationsPool[uid].length;i++){
				sendNotification(notificationsPool[uid][i],socket);
			}
		}
		socket.set('userId', uid, function(err){
			if(err){
				throw err;
			}
		});
		readUserChat(uid);
		readEventChat(uid);
	});

	socket.on('get user chat',function(session_key, uid, seq, c_uid, content){
		chatToUser(session_key, uid, seq, c_uid, content);
	});

	socket.on('get event chat',function(session_key,uid, seq, eid,content){
		chatToEvent(session_key, uid, seq, eid, content);
	});

	socket.on('logout',function(session_key){
		socket.get('userId',function(err, uid){
			if(err){
				throw err;
			}
			console.log("logout");
			console.log(uid);
			console.log(session_key);
			notificationsPool[uid] = [];
            service.helper.disconnect(session_key);
		});
	});

	socket.on('disconnect',function(){
		// socket.on('chat history',function(chats){
		// 	chats.friendsChats.forEach(function(friends){
		// 		friends.forEach(function(chat){
		// 			//TO DO: store friend chat information
		// 		});
		// 	});
		// 	chats.eventsChats.forEach(function(events){
		// 		events.forEach(function(chat){
		// 			//TO DO: store friend chat information
		// 		});
		// 	});
		// });
		socket.get('userId',function(err, uid){
			if(err){
				throw err;
			}
			console.log("user "+uid+" has disconnected!");
		});
	});
});

function notificationHandler(notifications,uid){
	console.log("get notifications!");
	var uid = notifications[0][2];
	if(socketsList[uid] && !socketsList[uid].disconnected){
		console.log("find socket!!!!");
		for(var i = 0;i < notifications[1].length;i++){
			sendNotification(notifications[1][i],socketsList[uid]);
		}
	}else{
		console.log("cannot find socket!!!!");
	}
	if(notificationsPool[uid]){
		console.log("pool is not empty!!!!");
		var newNotificationsList = notificationsPool[uid];
		for(var j = 0;j < notifications[1].length;j++){
			newNotificationsList.push(notifications[1][j]);
		}
		notificationsPool[uid] = newNotificationsList;
	}else{
		notificationsPool[uid] = notifications[1];
	}
	console.log("finished handling");
}
function timeoutHandler(uid){
    if(socketsList[uid] && !socketsList[uid].disconnected){
	 	console.log("find socket!!!!");
        socketsList[uid].emit("log out");
    }else{
	 	console.log("cannot find socket!!!!");
    }

}
function clearNotificationHandler(uid,seq){
	if(notificationsPool[uid]){
		if(seq == -1){
			notificationsPool[uid] = [];
		}else{
			var notificationsList = notificationsPool[uid];
			for(var i = 0; i < notificationsList.length;i++){
				if(notificationsList[i][1] == seq){
					notificationsList.splice(i,1);
				}
			}
			notificationsPool[uid] = notificationsList;
		}	
	}
}
function sendNotification(notification,socket){
	console.log("send notification!!!!!!!!!!!!!!!!!");
    console.log(notification);
	switch(notification[0]){
		case 0:
			console.log("send friend notification!!!!!!!!!!!!!!!!!");
			socket.emit("friend request",notification[2],notification[2],notification[3],notification[4],notification[5],notification[1]);
			break;
		case 1:
			console.log("send event notification!!!!!!!!!!!!!!!!!");
			socket.emit("event membership request",notification[2],notification[2],notification[4],service.helper.hexToDec(notification[3]),service.helper.hexToDec(notification[3]),notification[5],notification[1]);
			break;
		case 2:
			socket.emit("reply posting",notification[2],notification[2],service.helper.hexToDec(notification[3]),notification[4],notification[4],notification[1]);
			break;
		default:
			console.log("no matched notification type!");
			break;
	}
}


function chatHandler(chat,uid){
	console.log("get chat!");
	console.log(chat);

	var uid = chat[0][2];
	console.log("user id is: "+uid);
    //console.log(socketsList[uid]);
    //console.log(socketsList);
    //console.log(socketsList[uid].connected);
	if(socketsList[uid] && !socketsList[uid].disconnected){
	 	console.log("find socket!!!!");
        sendChat(chat,socketsList[uid]);
    }
    else{//socket close store it in the disk
    	console.log("cannot find socket");
    	saveChat(chat);
    }
	console.log("finished handling");
}
function clearChatHandler(uid,seq){
	if(personalChatPool[uid]){
		var chatList = personalChatPool[uid];
		for(var i = 0; i < chatList.length;i++){
			if(chatList[i][1] == seq){
				chatList.splice(i,1);
			}
		}
		personalChatPool[uid] = chatList;
	}
}
//assume chat is chat[user/event, direction, content]
function sendChat(chat,socket){
	console.log("send chat!!!!!!!!!!!!!!!!!");
    console.log(chat);
    console.log(chat[1][0]);
    console.log(chat[0][4]);
	switch(chat[0][4]){
		case 0:
			switch(chat[1][0]){
                case 0:
                    socket.emit("send user chat",chat[1][1],chat[1][2]);//seq status
                    break;
                case 1:
                    socket.emit("receive user chat",chat[1][1],service.sanitizer.escape(chat[1][2]),chat[1][3],chat[1][4]);//s_uid, message, date, time
                    //socket.emit("receive user chat",1235760,"hello world",20110811,48636);//s_uid, message, date, time
                    break;
            }
			break;
		case 1:
            switch(chat[1][0]){
                case 0:
                    socket.emit("send event chat",chat[1][1],chat[1][2]);//seq status
                    break;
                case 1:
                    socket.emit("receive event chat",service.helper.hexToDec(chat[1][1]),chat[1][2],service.sanitizer.escape(chat[1][3]),chat[1][4],chat[1][5]);//eid,s_uid, message, date, time
                    break;
            }
			break;
		default:
			console.log("no matched chat type!");
			break;
	}
}
function saveChat(chat){
	switch(chat[0][4]){
		case 0:
			switch(chat[1][0]){
                case 0:
                	//do nothing
                    //socket.emit("send user chat",chat[1][1],chat[1][2]);//seq status
                    break;
                case 1:
                	var data = {};
                	var uid = chat[0][2];
                	data.sender_uid = chat[1][1];
                	data.content = chat[1][2];
                	data.date = chat[1][3];
                	data.time = chat[1][4];
                	storeUserChat(uid, data.sender_uid, JSON.stringify(data));
                    //socket.emit("receive user chat",chat[1][1],service.sanitizer.escape(chat[1][2]),chat[1][3],chat[1][4]);//s_uid, message, date, time
                    //socket.emit("receive user chat",1235760,"hello world",20110811,48636);//s_uid, message, date, time
                    break;
            }
			break;
		case 1:
            switch(chat[1][0]){
                case 0:
                    //socket.emit("send event chat",chat[1][1],chat[1][2]);//seq status
                    break;
                case 1:
                    //socket.emit("receive event chat",service.helper.hexToDec(chat[1][1]),chat[1][2],service.sanitizer.escape(chat[1][3]),chat[1][4],chat[1][5]);//eid,s_uid, message, date, time
                    var data = {};
                	var uid = chat[0][2];
                	data.eid = service.helper.hexToDec(chat[1][1]);
                	data.sender_uid = chat[1][2];
                	data.content = chat[1][3];
                	data.date = chat[1][4];
                	data.time = chat[1][5];
                	storeEventChat(uid, data.eid, JSON.stringify(data));
                    break;
            }
			break;
		default:
			console.log("no matched chat type!");
			break;
	}
}
function storeUserChat(uid,sender_uid, data){
	var path = service.dataPath +uid+"/chat/user/";
	service.fs.readdir(path, function(err){
		if(err){
			console.log("dir does not exists.");
			mkdirp(path, function(err){
			    if(err){
			    	console.log("created dir unsuccessfully.");
			    }else{
			   		console.log("created dir");
					var chatPath = path + sender_uid;//public/data/uid/sender_uid
					//service.fs.writeFileSync(chatPath, data,);
					service.fs.appendFileSync(chatPath, data + "\n");
			    }
			});
		}else{
			console.log("dir exists.");
			var chatPath = path + sender_uid;//public/data/uid/sender_uid
			service.fs.appendFileSync(chatPath, data + "\n");
		}
	});
}
function storeEventChat(uid,sender_uid, data){
	var path = service.dataPath +uid+"/chat/event/";
	service.fs.readdir(path, function(err){
		if(err){
			console.log("dir does not exists.");
			mkdirp(path, function(err){
			    if(err){
			    	console.log("created dir unsuccessfully.");
			    }else{
			   		console.log("created dir");
					var chatPath = path + sender_uid;//public/data/uid/sender_uid
					//service.fs.writeFileSync(chatPath, data,);
					service.fs.appendFileSync(chatPath, data + "\n");
			    }
			});
		}else{
			console.log("dir exists.");
			var chatPath = path + sender_uid;//public/data/uid/sender_uid
			service.fs.appendFileSync(chatPath, data + "\n");
		}
	});
}
function readUserChat(uid){
	console.log("enter readUserChat function.");
	var path = service.dataPath+uid+"/chat/user/";
	var chats=[];
	fs.readdir(path, function(err,files){
		if(err){
			console.log("not exists");
		}
		else{
			for (var i in files){
				console.log("the file[i] are:");
				console.log(path+files[i]);
				fs.readFileSync(path+files[i]).toString().split('\n').forEach(function (line) {
					if(line != ""){
						console.log("message :"+line);
						var chat = JSON.parse(line);
						if(socketsList[uid] && !socketsList[uid].disconnected){
							socketsList[uid].emit("receive user chat",chat.sender_uid,
							service.sanitizer.escape(chat.content),
							chat.date,chat.time);//s_uid, message, date, time
							console.log("finished send one chat message.");
						}
					}
		        });
			}
			rimraf(path, function(err){
				console.log("remove directory successfully");
			});
		}
	});
}

function readEventChat(uid){
	var path = service.dataPath+uid+"/chat/event/";
	var chats=[];
	service.fs.readdir(path, function(err,files){
		if(err){
			console.log("not exists");
			//do nothing
		}
		else{
			for (var i in files){
				console.log("the file[i] are:");
				console.log(path+files[i]);
				fs.readFileSync(path+files[i]).toString().split('\n').forEach(function (line) {
					if(line != ""){
						console.log("message :"+line);
						var chat = JSON.parse(line);
						if(socketsList[uid] && !socketsList[uid].disconnected){
							socketsList[uid].emit("receive event chat",chat.eid, chat.sender_uid,
							service.sanitizer.escape(chat.content),
							chat.date,chat.time);//s_uid, message, date, time
						}
					}
		        });
			}
			rimraf(path, function(err){
				console.log("remove directory successfully");
			});
		}
	});
}
function chatToEvent(session_key, uid, seq, eid, content){
	// console.log("I got the chat!!!!!!!!!!!!!!!!!!!");
	var status = "unsuccessful";
	var pack = service.lib.createMessageToEventPack(session_key,parseInt(uid), parseInt(seq), service.helper.decToHex(eid), content);
    service.helper.connectAndSend(pack, function(){
 	    var output = {"status":"successful"};

	},null,true);
}

function chatToUser(session_key, uid, seq, to_uid, content){
    console.log("I got the chat!!!!!!!!!!!!!!!!!!!");
    var status = "unsuccessful";
    var pack = service.lib.createMessageToUserPack(session_key,parseInt(uid), parseInt(seq), parseInt(to_uid), content);
    service.helper.connectAndSend(pack, function(data){
    	var output = {"status":"successful"};

    },null,true);
}

service.setClearNotificationHandler(clearNotificationHandler);
service.helper.set_noti_handle(notificationHandler);

service.setClearChatHandler(clearChatHandler);
service.helper.set_chat_handle(chatHandler);

service.helper.set_timeout_handle(timeoutHandler);
