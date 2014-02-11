
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
var fs = require('fs');
var mongo = require('./service/mongo');

//TO DO: to be configured 
//mongoose.connect('mongodb://localhost/test');

var app = express();

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

app.post('/getuseravarta',express.bodyParser(),service.viewUserAvarta);
app.post('/getusersmallavarta',express.bodyParser(),service.viewUserSmallAvarta);
app.post('/getselfavarta',express.bodyParser(),service.viewSelfAvarta);
app.post('/getselfsmallavarta',express.bodyParser(),service.viewSelfSmallAvarta);
app.post('/geteventavarta',express.bodyParser(),service.viewEventAvarta);
app.post('/geteventsmallavarta',express.bodyParser(),service.viewEventSmallAvarta);
app.post('/getusercircatags',express.bodyParser(),service.viewUserCircatags);
app.post('/getpostcontent',express.bodyParser(),service.viewPostContent);
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
app.post('/uploadavarta',service.uploadAvarta);
/*************** End *****************/

//Server starts
var server = http.createServer(app).listen(app.get('port'), function(){
  	console.log('Express server listening on port ' + app.get('port'));
});

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
	});

	socket.on('get user chat',function(session_key, uid, seq, c_uid, content){
		chatToUser(session_key, uid, seq, c_uid, content);
  		var now = new Date();
		var chat = new mongo.friendchat({selfUid:uid,date:now,content:content,friendUid:c_uid});
		chat.save(function(err){
		    if (err){
		    	console.log("chat save error "+uid+" "+c_uid);
		    	throw err;
		    }else{
		    	console.log("chat save successfully "+uid+" "+c_uid);
		    }
		});
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
	console.log("user id is: "+uid);
	if(socketsList[uid] && !socketsList[uid].disconnected){
		console.log("find socket!!!!");
		for(var i = 0;i < notifications[1].length;i++){
			sendNotification(notifications[1][i],socketsList[uid]);
		}
	}else{
		console.log("cannot find socket!!!!");
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
		var notificationsList = notificationsPool[uid];
		for(var i = 0; i < notificationsList.length;i++){
			if(notificationsList[i][1] == seq){
				notificationsList.splice(i,1);
			}
		}
		notificationsPool[uid] = notificationsList;
	}
}
function sendNotification(notification,socket){
	console.log("send notification!!!!!!!!!!!!!!!!!");
    console.log(notification);
	switch(notification[0]){
		case 0:
			socket.emit("friend request",notification[2],notification[2],notification[3],notification[4],notification[5],notification[1]);
			break;
		case 1:
			socket.emit("event membership request",notification[2],notification[2],notification[4],notification[3],notification[3],notification[5],notification[1]);
			break;
		case 2:
			socket.emit("reply posting",notification[2],notification[2],notification[3],notification[4],notification[4],notification[1]);
			break;
		default:
			console.log("no matched notification type!");
			break;
	}
}


function chatHandler(chat,uid){
	console.log("get chat!");
	console.log(chat);

	//save to mongodb
	//TO DO:need to convert date and time to Date object
	// var chatItem = new mongo.friendchat({selfUid:uid,date:now,content:content,friendUid:c_uid});
	// chatItem.save(function(err){
	//     if (err){
	//     	console.log("chat save error "+uid+" "+c_uid);
	//     	throw err;
	//     }else{
	//     	console.log("chat save successfully "+uid+" "+c_uid);
	//     }
	// });

	var uid = chat[0][2];
	console.log("user id is: "+uid);
    //console.log(socketsList[uid]);
    //console.log(socketsList);
    //console.log(socketsList[uid].connected);
	if(socketsList[uid] && !socketsList[uid].disconnected){
	 	console.log("find socket!!!!");
        sendChat(chat,socketsList[uid]);
    }
	//  }else{
	//  	console.log("cannot find socket!!!!");
	//  	if(personalChatPool[uid]){
	//  		console.log("pool is not empty!!!!");
	//  		var newChatList = personalChatPool[uid];
 //             newChatList.push(chat);
	//  		personalChatPool[uid] = newChatList;
	//  	}else{
	//  		personalChatPool[uid] = chat;
	//  	}
	// }
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
                    socket.emit("receive event chat",chat[1][1],chat[1][2],service.sanitizer.escape(chat[1][3]),chat[1][4],chat[1][5]);//eid,s_uid, message, date, time
                    break;
            }
			break;
		default:
			console.log("no matched chat type!");
			break;
	}
}

function chatToEvent(session_key, uid, seq, eid, content){
	// console.log("I got the chat!!!!!!!!!!!!!!!!!!!");
	var status = "unsuccessful";
	var pack = lib.createMessageToEventPack(session_key,parseInt(uid), parseInt(seq), service.helper.decToHex(eid), content);
	    helper.connectAndSend(pack, function(){
	 	    var output = {"status":"successful"};
		},null,true);
}

function chatToUser(session_key, uid, seq, to_uid, content){
    console.log("I got the chat!!!!!!!!!!!!!!!!!!!");
    var status = "unsuccessful";
    var pack = service.lib.createMessageToUserPack(session_key,parseInt(uid), parseInt(seq), parseInt(to_uid), content);
    service.helper.connectAndSend(pack, function(data){
    var output = {"status":"successful"};
      //  var pkg = [[0,0,0,0],[0,seq,1]];
    	//chatHandler(pkg,uid);
    //	console.log(socketsList);
    //	console.log(uid);
    	//console.log(socketsList[uid]);
    	//console.log(socketsList[uid].disconnected);
//                                  console.log(content);
//                                  console.log(pkg);
//	    if(socketsList[uid] && !socketsList[uid].disconnected){
//			console.log("find socket!!!!");
//			sendChat(pkg,socketsList[uid]);
//		}else{
//			console.log("cannot find socket!!!!");
//			if(personalChatPool[uid]){
//				personalChatPool[uid].push(pkg);
//			}else{
//				personalChatPool[uid] = [];
//                personalChatPool[uid] = pkg;
//			}
//		}
//    	clearChatHandler(uid,seq);
       },null,true);
}

service.setClearNotificationHandelr(clearNotificationHandler);
service.helper.set_noti_handle(notificationHandler);

service.setClearChatHandelr(clearChatHandler);
service.helper.set_chat_handle(chatHandler);

service.helper.set_timeout_handle(timeoutHandler);
