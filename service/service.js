var max_pid = "7fffffffffffffff";
exports.lib = require("../node_modules/lib");
var lib = exports.lib;
exports.helper = require("./helper");
var helper = exports.helper;
var fs = require("fs");
var sanitizer = require("sanitizer");
exports.sanitizer = sanitizer;
var dataPath = __dirname.replace("service","") + "public/data/";
var gm = require("gm");
var default_avarta = "/img/circa.png";
var default_eventAvarta = "/img/event_default.png";
var clearNotificationHandler;
//************ Backend APIs ****************//

/** *********** Signup, Login and Logout **************** */
exports.signUp = function(req, res) {
    var output;
    // console.log(req.body.p);
    console.log(req.body.password);
    console.log(req.body.nickname);
    console.log(req.body.realname);
    console.log(req.body.birthday);
    console.log(req.body.gender);
    console.log(req.body.city);
    console.log(req.body.state);
    console.log(req.body.country);    
    console.log(req.body.tags); 
    console.log(req.body.hidden_tags);
    console.log(req.body.code);
    var tags = []; 
    var hidden_tags = []; 
    if (req.body.tags)
	tags = req.body.tags;
    if (req.body.hidden_tags)
	hidden_tags = req.body.hidden_tags;
	console.log(tags);
    var pack = lib.createCreateUserPack(req.body.email,req.body.code, req.body.password,req.body.nickname, req.body.realname, parseInt(req.body.birthday),
	    parseInt(req.body.gender), req.body.city, req.body.state,
	    req.body.country, tags, hidden_tags);
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	console.log("signup feedback:");
	console.log(pkg);
	if (pkg[1][0]) {
	    output = {
		"status" : "successful",
		"uid" : pkg[1][1]
	    };
	} else {
	    output = {
		"status" : "unsucessful",
		"uid" : pkg[1][1]
	    };
	}
	res.send(output);
    }, function() {
	res.send({
	    status : "timeout"
	});
    });
}

exports.setClearNotificationHandelr = function(handler){
	clearNotificationHandler = handler;
}
exports.setClearChatHandelr = function(handler){
	clearChatHandler = handler;
}
function loginAuth(req, res) {
    const
    LOG_IN_MODE = 1;
    var pack = lib.createLoginPack(LOG_IN_MODE, req.body.email,
	    req.body.password);
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	// if login successfully
	if (pkg[1][0]) {
	    res.send({
		status : "successful",
		session_key : pkg[1][1],
		uid : pkg[0][2]
	    });
	    // console.log("uid: "+pkg[0][2]);
	    // console.log("session_key: "+pkg[1][1]);
	} else
	    res.send({
		status : "unsuccessful"
	    });
    }, function() {
	res.send({
	    status : "timeout"
	});
    });
}
exports.loginAuth = loginAuth;

exports.logout = function(req, res) {
    var pack = lib.createLogoutPack(req.body.session_key,
	    parseInt(req.body.uid));
    var status = "unsuccessful";
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	// if logout successfully
	if (pkg[1][0]) {
	    status = "successful";
	}
	res.send({
	    "status" : status
	});
	// console.log("logout successfully.");
    }, function() {
	res.send({
	    status : "timeout"
	});
    });
}

/** ***************** Create ****************** */
exports.createEvent = function(req, res) {
    var status = "unsuccessful";
    var pack = lib.createCreateEventPack(req.body.session_key,
	    req.body.event_name, parseInt(req.body.uid), req.body.description,
	    req.body.city, req.body.tags);
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	console.log(pkg);
	var eid;
	if (pkg[1][0] == 1) {
	    status = "successful";
	    eid = helper.hexToDec(pkg[1][1]);
	}
	res.send({
	    "status" : status,
	    "eid" : eid
	});
    }, function() {
	res.send({
	    status : "timeout"
	});
    });
}
exports.createPost = function(req, res) {
    console.log("creater uid: " + req.body.uid);
    var pack = lib.createCreatePostingPack(req.body.session_key,
	    parseInt(req.body.uid), helper.decToHex(req.body.eid), req.body.content,
	    parseInt(req.body.visibility), req.body.tags);
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	if (pkg[1][0]) {
	    var pidset = pkg[1][1];
	    console.log(pidset);
	    var pack = lib.createViewPostingPack(req.body.session_key,
		    parseInt(req.body.uid), pidset[0], pidset[1], pidset[2]);
	    var output;
	    helper.connectAndSend(pack, function(data) {
		var pkg = lib.resolvPack(data);
		// resolve replies
		var replies = [];
		var reply_set = pkg[1][10];
		for (var i = 0; i < reply_set.length; i++) {
		    var time = helper.UTCtimeTransform(reply_set[i][6],
			    reply_set[i][7]);
		    replies[i] = {
			"rid" : reply_set[i][0],
			"replier_uid" : reply_set[i][1],
			"replyto_uid" : reply_set[i][2],
			"replier_name" : sanitizer.escape(reply_set[i][3]),
			"replyto_name" : sanitizer.escape(reply_set[i][4]),
			"replyContent" : sanitizer.escape(reply_set[i][5]),
			"date" : time[0],
			"time" : time[1],
			"visibility" : reply_set[i][8]
		    };
		}
		output = {
		    "pid" : pkg[1][0],
		    "uid" : pkg[1][1],
		    "eid" : helper.hexToDec(pkg[1][2]),
		    "date" : pkg[1][3],
		    "time" : pkg[1][4],
		    "poster_name" : sanitizer.escape(pkg[1][5]),
		    "event_name" : sanitizer.escape(pkg[1][6]),
		    "postContent" : sanitizer.escape(pkg[1][7]),
		    "visibility" : pkg[1][8],
		    "tags" : parseTags(pkg[1][9]),
		    "replies_no" : reply_set.length,
		    "replies" : replies
		};
		res.send({
		    status : "successful",
		    post : output
		});
	    }, function() {
		res.send({
		    status : "timeout"
		});
	    });
	} else {
	    res.send({
		status : "unsuccessful"
	    });
	}
    }, function() {
	res.send({
	    status : "timeout"
	});
    });
}

exports.createReply = function(req, res) {
    var status = "unsuccessful";
    var pack = lib.createReplyPostingPack(req.body.session_key,
	    parseInt(req.body.uid), parseInt(req.body.posterUid),
	    parseInt(req.body.replyToUid), helper.decToHex(req.body.postEid), req.body.postPid,
	    req.body.replier_name, req.body.replyToName, req.body.replyContent,
	    parseInt(req.body.visibility));
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	console.log("reply package:");
	console.log(pkg);
	if (pkg[1][4] == 0) {
	    var output = {
		"poster_uid" : pkg[1][0],
		"replyTo_uid" : pkg[1][1],
		"eid" : helper.hexToDec(pkg[1][2]),
		"pid" : pkg[1][3]
	    };
	    res.send({
		status : "successful",
		reply : output
	    });
	} else {
	    res.send({
		status : "unsuccessful"
	    });
	}
    }, function() {
	res.send({
	    status : "timeout"
	});
    });
}
 
/** **********Request************ */
exports.createFriendRequest = function(req, res) {
    var pack = lib.createCreateRequestPack(0, req.body.session_key,
	    parseInt(req.body.uid), parseInt(req.body.receiver_uid),
	    req.body.content);
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
    console.log("send friend request");
	console.log(pkg);
	if (pkg[1][0] == 1) {
	    var output = {
		"type" : pkg[1][1],
		"uid" : pkg[1][2],
		"content" : pkg[1][3]
	    };
	    res.send({
		status : "successful",
		reply : output
	    });
	} else {
	    res.send({
		status : "unsuccessful"
	    });
	}
    }, function() {
	res.send({
	    status : "timeout"
	});
    });
}
exports.createJoinEventRequest = function(req, res) {
    var pack = lib.createCreateRequestPack(1, req.body.session_key,
	    parseInt(req.body.uid), helper.decToHex(req.body.eid), req.body.content);
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
                          console.log("send event request");
                          console.log(pkg);
	if (pkg[1][0] == 1) {
	    var output = {
		"type" : pkg[1][1],
		"eid" : helper.hexToDec(pkg[1][2]),
		"content" : pkg[1][3],
	    };
	    res.send({
		status : "successful",
		reply : output
	    });
	} else {
	    res.send({
		status : "unsuccessful"
	    });
	}
    }, function() {
	res.send({
	    status : "timeout"
	});
    });
}
exports.createEventInvitationRequest = function(req, res) {
    var pack = lib.createCreateRequestPack(2, req.body.session_key,
	    parseInt(req.body.uid), parseInt(req.body.receiver_uid),
	    helper.decToHex(req.body.eid), req.body.content);
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	console.log(pkg);
	if (pkg[1][0] == 1) {
	    var output = {
		"type" : pkg[1][1],
		"uid" : pkg[1][2],
		"eid" : helper.hexToDec(pkg[1][3]),
		"content" : pkg[1][4],
	    };
	    res.send({
		status : "successful",
		reply : output
	    });
	} else {
	    res.send({
		status : "unsuccessful"
	    });
	}
    }, function() {
	res.send({
	    status : "timeout"
	});
    });
}
/***/
exports.createSchedule = function(req, res) {
    var members = [];
    for (var i = 0; i < req.body.members.length; i++) {
	members[i] = parseInt(req.body.members[i]);
    }
    var pack = lib.createCreateSchedulePack(req.body.session_key,
	    parseInt(req.body.uid), helper.decToHex(req.body.eid),
	    parseInt(req.body.start_date), parseInt(req.body.start_time),
	    parseInt(req.body.end_date), parseInt(req.body.end_time),
	    req.body.place, req.body.description, members);
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	if (pkg[1][0]) {
	    var output = {
		"uid" : pkg[1][1],
		"eid" : helper.hexToDec(pkg[1][2]),
		"sid" : pkg[1][3],
	    };
	    res.send({
		status : "successful",
		reply : output
	    });
	} else {
	    res.send({
		status : "unsuccessful"
	    });
	}
    }, function() {
	res.send({
	    status : "timeout"
	});
    });
}
/** ***************** View Information ****************** */

exports.viewSelfInfo = function(req, res) {
    var pack = lib.createViewSelfPack(4, req.body.session_key,
	    parseInt(req.body.uid));
    helper.connectAndSend(pack, function(data) {
	// console.log("self is "+data);
	var pkg = lib.resolvPack(data);
	// console.log(pkg);
	req.session.name = pkg[1][1][1];
	var birthday = helper.print_date(pkg[1][1][3]);
	var gender = helper.print_gender(pkg[1][1][8]);
	var output = {
	    "status" : "successful",
	    "realname" : sanitizer.escape(pkg[1][1][1]),
	    "nickname" : sanitizer.escape(pkg[1][1][2]),
	    "birthday" : birthday,
	    "raw_birthday" : pkg[1][1][3],
	    "tags" : parseTags(pkg[1][1][4]),
	    "hidden_tags" : parseTags(pkg[1][1][5]),
	    "rating" : pkg[1][1][6],
	    "honors" : pkg[1][1][7],
	    "gender" : gender,
	    "raw_gender" : pkg[1][1][8],
	    "city" : sanitizer.escape(pkg[1][1][9]),
	    "state" : sanitizer.escape(pkg[1][1][10]),
	    "country" : sanitizer.escape(pkg[1][1][11])
	};
	res.send(output);
    }, function() {
	res.send({
	    status : "timeout"
	});
    });
}

exports.viewUserInfo = function(req, res) {
    var output;
    var pack = lib.createViewUserPack(4, req.body.session_key,
	    parseInt(req.body.uid), parseInt(req.body.view_uid));
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	var birthday = helper.print_date(pkg[1][2][3]);
	var gender = helper.print_gender(pkg[1][2][4]);
	output = {
	    "status" : "successful",
	    "uid" : pkg[1][2][0],
	    "realname" : sanitizer.escape(pkg[1][2][1]),
	    "nickname" : sanitizer.escape(pkg[1][2][2]),
	    "birthday" : birthday,
	    "raw_birthday" : pkg[1][2][3],
	    "tags" : parseTags(pkg[1][2][6]),
	    "gender" : gender,
	    "raw_gender" : pkg[1][2][4],
	    "city" : sanitizer.escape(pkg[1][2][5]),
	    "common_friends" : pkg[1][2][7]
	};
	res.send(output);
    }, function() {
	res.send({
	    status : "timeout"
	});
    });
}

exports.viewUsersInfo = function(req, res) {
    var counter = 0;
    var uidList = req.body.uidList;
    var results = [];
    var pack;
    for (var i = 0; i < uidList.length; i++) {
	var pack = lib.createViewUserPack(4, req.body.session_key,
		parseInt(req.body.uid), parseInt(uidList[i]));
	helper.connectAndSend(pack, function(data) {
	    var pkg = lib.resolvPack(data);
	    var gender = helper.print_gender(pkg[1][2][4]);
	    results[counter] = {
		"status" : "successful",
		"uid" : pkg[1][2][0],
		"realname" : sanitizer.escape(pkg[1][2][1]),
		"nickname" : sanitizer.escape(pkg[1][2][2]),
		"birthday" : pkg[1][2][3],
		"tags" : parseTags(pkg[1][2][6]),
		"gender" : gender,
		"city" : sanitizer.escape(pkg[1][2][5]),
		"common_friends" : pkg[1][2][7]
	    };
	    counter++;
	    if (counter == uidList.length) {
		res.send({
		    status : "successful",
		    source : results
		});
	    }
	}, function() {
	    res.send({
		status : "timeout"
	    });
	});
    }
}

exports.viewSelfFriends = function(req, res) {
    var output;
    var pack = lib.createViewSelfPack(0, req.body.session_key,
	    parseInt(req.body.uid));
    var friend_uids = {};
    helper.connectAndSend(pack, function(data) {
		var pkg = lib.resolvPack(data);
		// console.log("self friends:");
		// console.log(pkg);
	    if(pkg[1][0]>0){
	        friend_uids = pkg[1][1];
	    }
		output = {
		    "status" : "successful",
		    "friend_uids" : pkg[1][1]
	    };
		res.send(output);
	    }, function() {
			res.send({
		    	status : "timeout"
			});
    	});
}

exports.viewUserFriends = function(req, res) {
    var output;
    var friend_uids = {};
    var pack = lib.createViewUserPack(0, req.body.session_key,
	    parseInt(req.body.uid), parseInt(req.body.view_uid));
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
    if(pkg[1][1]>0){
        friend_uids = pkg[1][2];
    }
	output = {
		"status" : "successful",
		"friends" : pkg[1][2]
	};
	res.send(output);
    }, function() {
	res.send({
	    status : "timeout"
	});
    });
}

// this will return an array of post id sets.
exports.viewSelfPosts = function(req, res) {
    var output;
    var pack = lib.createViewSelfPack(2, req.body.session_key,
	    parseInt(req.body.uid), max_pid);
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	console.log("self posts:");
	console.log(pkg);
	output = {
	    "pidsets" : pkg[1][1]
	};
	res.send(output);
    }, function() {
	res.send({
	    status : "timeout"
	});
    });
}

exports.viewUserPosts = function(req, res) {
    var output;
    var pack = lib.createViewUserPack(2, req.body.session_key,
	    parseInt(req.body.uid), parseInt(req.body.view_uid), max_pid);

    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	output = {
	    "pidsets" : pkg[1][2]
	};
	res.send(output);
    }, function() {
	res.send({
	    status : "timeout"
	});
    });
}

exports.viewSelfEvents = function(req, res) {
    var pack = lib.createViewSelfPack(1, req.body.session_key,
	    parseInt(req.body.uid));
    var output;
    var eids = [];
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	if(pkg[1][1]){
		for(var i=0;i<pkg[1][1].length;i++)
			eids[i]=helper.hexToDec(pkg[1][1][i]);
	}
	output = {
	    "events" : eids
	};
	res.send(output);
    }, function() {
	res.send({
	    status : "timeout"
	});
    });
}

exports.viewUserEvents = function(req, res) {
    var pack = lib.createViewUserPack(1, req.body.session_key,
	    parseInt(req.body.uid), parseInt(req.body.view_uid));
    var output;
    var eids=[];
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	if(pkg[1][2]){
		for(var i=0;i<pkg[1][2].length;i++)
			eids[i]=helper.hexToDec(pkg[1][2][i]);
	}
	output = {
	    "events" : eids
	};
	res.send(output);
    }, function() {
	res.send({
	    status : "timeout"
	});
    });
}
exports.viewSelfSchedule = function(req, res) {
    var pack = lib.createViewSelfPack(17, req.body.session_key,
	    parseInt(req.body.uid), parseInt(req.body.option));
    var output;
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	console.log(data);
	var schedules = [];
	var schedules_set = pkg[1][1];
	for (var i = 0; i < schedules_set.length; i++) {
	    schedules[i] = {
		"uid" : schedules_set[i][0],
		"eid" : helper.hexToDec(schedules_set[i][1]),
		"sid" : schedules_set[i][2],
		"start_date" : schedules_set[i][3],
		"start_time" : schedules_set[i][4],
		"end_date" : schedules_set[i][5],
		"end_time" : schedules_set[i][6],
		"place" : schedules_set[i][7],
		"description" : schedules_set[i][8],
		"users" : schedules_set[i][9],
	    };
	}
	output = {
	    "schedules" : schedules
	};
	res.send(output);
    }, function() {
	res.send({
	    status : "timeout"
	});
    });
}
exports.viewUserNews = function(req, res) {
    var output;
    var pack = lib.createMassViewPack(0, parseInt(req.body.option),
	    req.body.session_key, parseInt(req.body.uid), max_pid);
    //console.log(pack);
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	//console.log(pkg);
	output = {
	    "pidsets" : pkg[1]
	};
	res.send(output);
    }, function() {
	res.send({
	    status : "timeout"
	});
    });
}
exports.viewEventNews = function(req, res) {
    var pack = lib.createMassViewPack(1, 0, req.body.session_key,
	    parseInt(req.body.uid), max_pid);
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	output = {
	    "pidsets" : pkg[1]
	};
	res.send(output);
    }, function() {
	res.send({
	    status : "timeout"
	});
    });
}

// option
/*
 * 0=for personal 1=for city 2=for friends 3=for city-user 4=for city-events
 * 5=for city-posting
 */
exports.viewSelfCircatags = function(req, res) {
    var pack = lib.createViewSelfPack(18, req.body.session_key,
	    parseInt(req.body.uid), parseInt(req.body.option));
    var output;
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	output = {
	    "circatags" : pkg[1][1]
	// circa tags is a array of [tag,weight]
	};
	res.send(output);
    }, function() {
	res.send({
	    status : "timeout"
	});
    });
}

exports.viewUserCircatags = function(req, res) {
    var pack = lib.createViewUserPack(18, req.body.session_key,
	    parseInt(req.body.uid), parseInt(req.body.view_uid));
    var output;
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	output = {
	    "circatags" : pkg[1][1]
	};
	res.send(output);
    }, function() {
	res.send({
	    status : "timeout"
	});
    });
}
exports.viewSelfAvarta = function(req,res){
    var version_date;
    var version_time;
    var hasAvarta = false;
    var avarta;
    var date=0;
    var time=0;
    var path = dataPath+req.body.uid+"/avarta";
    var current_avarta;
    fs.readdir(path, function (err,files) {
    	if(!err){
	        for (var i in files){
	            var version = files[i].split("_");
		        //console.log(version);
		        var v2 = version[1].split(".");
		        //console.log(v2);
		        if(v2[1]=="jpg"){
		            date = version[0];
		            time = v2[0];
		            current_avarta = files[i];
		            break;
		        }
	        }
    	}  
    });
    //var version = helper.getVersion();
    var pack = lib.createViewSelfPack(23,req.body.session_key, parseInt(req.body.uid), parseInt(date), parseInt(time));
    var output;
    helper.connectAndSend(pack,function(data){
        var pkg = lib.resolvPack(data);
        console.log(pkg);
		if(!pkg[1][3]){
			avarta = default_avarta;
		}
		else
			avarta = pkg[1][3];
		if(date!=0&&time!=0){
			if(date!=pkg[1][1] || time!=pkg[1][2]){
				fs.unlinkSync(path+"/"+current_avarta);
			}
		}
		output = {
			"status":"successful",
			"version_date":pkg[1][1],
			"version_time":pkg[1][2],
			"avarta": avarta
		};
        res.send(output);
    }, function(){
        res.send({status: "timeout"});
    });
}

exports.viewSelfSmallAvarta = function(req,res){
    var version_date;
    var version_time;
    var hasAvarta = false;
    var avarta;
    var date=0;
    var time=0;
    var path = dataPath+req.body.uid+"/avarta";
    var current_avarta;
    fs.readdir(path, function (err,files) {
    	if(!err){
	        for (var i in files){
	            var version = files[i].split("_");
	            //console.log(version);
	            if(version[2]=="small.jpg"){
	            	current_avarta = files[i];
	                date = version[0];
	                time = version[1];
	                break;
	            }
	        }
    	}  
    });
    //var version = helper.getVersion();
    var pack = lib.createViewSelfPack(24,req.body.session_key, parseInt(req.body.uid), parseInt(date), parseInt(time));
    var output;
    helper.connectAndSend(pack,function(data){
        var pkg = lib.resolvPack(data);
        console.log(pkg);
		if(!pkg[1][3]){
			avarta = default_avarta;
		}
		else
			avarta = pkg[1][3];
		if(date!=0&&time!=0){
			if(date!=pkg[1][1] || time!=pkg[1][2]){
				fs.unlinkSync(path+"/"+current_avarta);
			}
		}
		output = {
			"status":"successful",
			"version_date":pkg[1][1],
			"version_time":pkg[1][2],
			"avarta": avarta
		};
        res.send(output);
    }, function(){
        res.send({status: "timeout"});
    });
}
exports.viewUserAvarta = function(req,res){
    var version_date;
    var version_time;
    var hasAvarta = false;
    var avarta;
    var date=0;
    var time=0;
    var path = dataPath+req.body.view_uid+"/avarta";
    fs.readdir(path, function (err,files) {
    	if(!err){
	        for (var i in files){
	            var version = files[i].split("_");
		        //console.log(version);
		        var v2 = version[1].split(".");
		        //console.log(v2);
		        if(v2[1]=="jpg"){
		            date = version[0];
		            time = v2[0];
		            break;
		        }
	        }
    	}  
    });
    var pack = lib.createViewUserPack(23,req.body.session_key, parseInt(req.body.uid), parseInt(req.body.view_uid), parseInt(date), parseInt(time));
    var output;
    helper.connectAndSend(pack,function(data){
        var pkg = lib.resolvPack(data);
        console.log(pkg);
        //var time = helper.UTCtimeTransform(pkg[1][0],pkg[1][1]);
		if(!pkg[1][4]){
			avarta = default_avarta;
		}
		else
			avarta = pkg[1][4];
		output = {
			"status":"successful",
			"version_date":pkg[1][2],
			"version_time":pkg[1][3],
			"avarta": avarta
		};
        res.send(output);
    }, function(){
        res.send({status: "timeout"});
    });
}
exports.viewUserSmallAvarta = function(req,res){
    var version_date;
    var version_time;
    var hasAvarta = false;
    var avarta;
    var date=0;
    var time=0;
    var path = dataPath+req.body.view_uid+"/avarta";
    fs.readdir(path, function (err,files) {
    	if(!err){
	        for (var i in files){
	            var version = files[i].split("_");
	            //console.log(version);
	            if(version[2]=="small.jpg"){
	                date = version[0];
	                time = version[1];
	                break;
	            }
	        }
    	}  
    });
    var pack = lib.createViewUserPack(24,req.body.session_key, parseInt(req.body.uid), parseInt(req.body.view_uid), parseInt(date), parseInt(time));
    var output;
    helper.connectAndSend(pack,function(data){
        var pkg = lib.resolvPack(data);
        console.log(pkg);
        //var time = helper.UTCtimeTransform(pkg[1][0],pkg[1][1]);
                          if(!pkg[1][4]){
                          avarta = default_avarta;
                          }
                          else
                          avarta = pkg[1][4];
                          output = {
                          "status":"successful",
                          "version_date":pkg[1][2],
                          "version_time":pkg[1][3],
                          "avarta": avarta
                          };

        res.send(output);
    }, function(){
        res.send({status: "timeout"});
    });
}
// ****************view Event***********//
exports.viewEventInfo = function(req, res) {
    var output;
    var eid = helper.decToHex(req.body.eid);
    console.log(eid);
    var pack = lib.createViewEventPack(4, req.body.session_key,
	    parseInt(req.body.uid), eid);
    helper.connectAndSend(pack, function(data) {
	// console.log(data);
	var pkg = lib.resolvPack(data);
	// console.log(pkg);
	output = {
	    "status" : "successful",
	    "eid" : helper.hexToDec(pkg[1][2][0]),
	    "name" : sanitizer.escape(pkg[1][2][1]),
	    "creator" : pkg[1][2][2],
	    "description" : sanitizer.escape(pkg[1][2][3]),
	    "tags" : parseTags(pkg[1][2][4]),
	    "city" : sanitizer.escape(pkg[1][2][5]),
	    "rating" : pkg[1][2][6],
	    "honors" : pkg[1][2][7]
	};
	res.send(output);
    }, function() {
	res.send({
	    status : "timeout"
	});
    });
}
exports.viewEventsInfo = function(req, res) {
    var counter = 0;
    var eidList = req.body.eidList;
    var results = [];
    var pack;
    for (var i = 0; i < eidList.length; i++) {
	var pack = lib.createViewEventPack(4, req.body.session_key,
		parseInt(req.body.uid), helper.decToHex(eidList[i]));
	helper.connectAndSend(pack, function(data) {
	    var pkg = lib.resolvPack(data);
	    results[counter] = {
		"status" : "successful",
		"eid" : helper.hexToDec(pkg[1][2][0]),
		"name" : sanitizer.escape(pkg[1][2][1]),
		"creator" : pkg[1][2][2],
		"description" : sanitizer.escape(pkg[1][2][3]),
		"tags" : parseTags(pkg[1][2][4]),
		"city" : sanitizer.escape(pkg[1][2][5]),
		"rating" : pkg[1][2][6],
		"honors" : pkg[1][2][7]
	    };
	    counter++;
	    if (counter == eidList.length) {
		res.send({
		    status : "successful",
		    source : results
		});
	    }
	}, function() {
	    res.send({
		status : "timeout"
	    });
	});
    }
}
exports.viewEventMembers = function(req, res) {
    var output;
    var pack = lib.createViewEventPack(0, req.body.session_key,
	    parseInt(req.body.uid), helper.decToHex(req.body.eid));
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	output = {
	    "members" : pkg[1][2]
	};
	res.send(output);
    }, function() {
	res.send({
	    status : "timeout"
	});
    });
}
exports.viewEventManagers = function(req, res) {
    var output;
    var pack = lib.createViewEventPack(5, req.body.session_key,
	    parseInt(req.body.uid), helper.decToHex(req.body.eid));
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	output = {
	    "members" : pkg[1][2]
	};
	res.send(output);
    }, function() {
	res.send({
	    status : "timeout"
	});
    });
}

exports.viewEventPosts = function(req, res) {
    var output;
    var pack = lib.createViewEventPack(2, req.body.session_key,
	    parseInt(req.body.uid), helper.decToHex(req.body.eid), max_pid);
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	//console.log(pkg);
	output = {
	    "pidsets" : pkg[1][2]
	};
	res.send(output);
    }, function() {
	res.send({
	    status : "timeout"
	});
    });
}
exports.viewEventCircatags = function(req, res) {
    var pack = lib.createViewEventPack(18, req.body.session_key,
	    parseInt(req.body.uid), helper.decToHex(req.body.eid));
    var output;
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	output = {
	    "circatags" : pkg[1][1]
	};
	res.send(output);
    }, function() {
	res.send({
	    status : "timeout"
	});
    });
}
exports.viewEventSchedule = function(req, res) {
    var pack = lib.createViewEventPack(17, req.body.session_key,
	    parseInt(req.body.uid), helper.decToHex(req.body.eid));
    var output;

    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	var schedules = [];
	var schedules_set = pkg[1][2];
	for (var i = 0; i < schedules_set.length; i++) {
	    var start_time = helper.UTCtimeTransform(schedules_set[i][3],
		    schedules_set[i][4]);
	    var end_time = helper.UTCtimeTransform(schedules_set[i][5],
		    schedules_set[i][6]);
	    schedules[i] = {
		"uid" : schedules_set[i][0],
		"eid" : helper.hexToDec(schedules_set[i][1]),
		"sid" : schedules_set[i][2],
		"start_date" : schedules_set[i][3],
		"start_time" : schedules_set[i][4],
		"end_date" : schedules_set[i][5],
		"end_time" : schedules_set[i][6],
		"place" : schedules_set[i][7],
		"description" : schedules_set[i][8],
		"users" : schedules_set[i][9],
	    };
	}
	output = {
	    "schedules" : schedules
	};
	res.send(output);
    }, function() {
	res.send({
	    status : "timeout"
	});
    });
}
exports.viewEventAvarta = function(req, res) {
    var version_date;
    var version_time;
    var hasAvarta = false;
    var avarta;
    //var pack = lib.createViewEventPack(24,req.body.session_key,parseInt(req.body.uid), helper.decToHex(req.body.eid), parseInt(req.body.date),parseInt(req.body.time));
    var output;
    avarta = default_eventAvarta;
    output = {
        "status":"successful",
        "version_date": 00000000,
        "version_time": 0000,
        "avarta": avarta
    };
    res.send(output);
//    helper.connectAndSend(pack,function(data){
//                          //TODO:
//                          //var pkg = lib.resolvPack(data);
//                          //                console.log(pkg);
//                          //var time = helper.UTCtimeTransform(pkg[1][0],pkg[1][1]);
//                          avarta = default_avarta;
//                          output = {
//                          "status":"successful",
//                          "version_date": 00000000,
//                          "version_time": 0000,
//                          "avarta": avarta
//                          };
//                          res.send(output);
//                          }, function(){
//                          res.send({status: "timeout"});
//                          });

}
exports.viewEventSmallAvarta = function(req, res) {
    var version_date;
    var version_time;
    var hasAvarta = false;
    var avarta;
    //var pack = lib.createViewEventPack(24,req.body.session_key,parseInt(req.body.uid), helper.decToHex(req.body.eid), parseInt(req.body.date),parseInt(req.body.time));
    var output;
    avarta = default_eventAvarta;
    output = {
        "status":"successful",
        "version_date": 00000000,
        "version_time": 0000,
        "avarta": avarta
    };
    res.send(output);
//    helper.connectAndSend(pack,function(data){
//                          //TODO:
//                          //var pkg = lib.resolvPack(data);
//                          //                console.log(pkg);
//                          //var time = helper.UTCtimeTransform(pkg[1][0],pkg[1][1]);
//                          avarta = default_avarta;
//                          output = {
//                          "status":"successful",
//                          "version_date": 00000000,
//                          "version_time": 0000,
//                          "avarta": avarta
//                          };
//                          res.send(output);
//                          }, function(){
//                          res.send({status: "timeout"});
//                          });

}
// helper functions to view the post(posts) content
exports.viewPostContent = function(req, res) {
    var pack = lib.createViewPostingPack(req.body.session_key,
	    parseInt(req.body.uid), parseInt(req.body.view_uid), helper.decToHex(req.body.eid),
	    req.body.pid);
    var output;
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	if (typeof pkg[1] == "undefined")
	    res.send({
		status : "unsuccessful"
	    });
	// resolve replies
	var replies = [];
	var reply_set = pkg[1][10];
	for (var i = 0; i < reply_set.length; i++) {
	    //var time = helper.UTCtimeTransform(reply_set[i][6], reply_set[i][7]);
	    replies[i] = {
		"rid" : reply_set[i][0],
		"replier_uid" : reply_set[i][1],
		"replyto_uid" : reply_set[i][2],
		"replier_name" : sanitizer.escape(reply_set[i][3]),
		"replyto_name" : sanitizer.escape(reply_set[i][4]),
		"replyContent" : sanitizer.escape(reply_set[i][5]),
		"date" : reply_set[i][6],
		"time" : reply_set[i][7],
		"visibility" : reply_set[i][8]
	    };
	}
	output = {
	    "pid" : pkg[1][0],
	    "uid" : pkg[1][1],
	    "eid" : helper.hexToDec(pkg[1][2]),
	    "date" : pkg[1][3],
	    "time" : pkg[1][4],
	    "poster_name" : sanitizer.escape(pkg[1][5]),
	    "event_name" : sanitizer.escape(pkg[1][6]),
	    "postContent" : sanitizer.escape(pkg[1][7]),
	    "visibility" : pkg[1][8],
	    "tags" : parseTags(pkg[1][9]),
	    "replies_no" : reply_set.length,
	    "replies" : replies
	};
	res.send({
	    status : "successful",
	    post : output
	});
    }, function() {
	res.send({
	    status : "timeout"
	});
    });
}
exports.viewPostsContent = function(req, res) {
    var counter = 0;
    var pidList = req.body.pidList;
    var uidList = req.body.uidList;
    var eidList = req.body.eidList;
    var results = [];
    var pack;
    //console.log("Num of pids are: " + pidList.length);

    var counter = 0;
    pack = lib.createViewPostingPack(req.body.session_key,
	    parseInt(req.body.uid), uidList[counter], eidList[counter], pidList[counter]);
    var f = function(data) {
	var pkg = lib.resolvPack(data);
	if (typeof pkg[1] == "undefined") {
	    res.send({
		status : "unsuccessful"
	    });
	    return;
	}
	// resolve replies
	var replies = [];
	var reply_set = pkg[1][10];
	for (var i = 0; i < reply_set.length; i++) {
	    replies[i] = {
		"rid" : reply_set[i][0],
		"replier_uid" : reply_set[i][1],
		"replyto_uid" : reply_set[i][2],
		"replier_name" : sanitizer.escape(reply_set[i][3]),
		"replyto_name" : sanitizer.escape(reply_set[i][4]),
		"replyContent" : sanitizer.escape(reply_set[i][5]),
		"date" : reply_set[i][6],
		"time" : reply_set[i][7],
		"visibility" : reply_set[i][8]
	    };
	}
	results[counter] = {
	    "pid" : pkg[1][0],
	    "uid" : pkg[1][1],
	    "eid" : helper.hexToDec(pkg[1][2]),
	    "date" : pkg[1][3],
	    "time" : pkg[1][4],
	    "poster_name" : sanitizer.escape(pkg[1][5]),
	    "event_name" : sanitizer.escape(pkg[1][6]),
	    "postContent" : sanitizer.escape(pkg[1][7]),
	    "visibility" : pkg[1][8],
	    "tags" : parseTags(pkg[1][9]),
	    "replies_no" : reply_set.length,
	    "replies" : replies
	};
	counter++;
	if (counter == pidList.length)
	    res.send({
		status : "successful",
		source : results
	    });
	else {
	    pack = lib.createViewPostingPack(req.body.session_key,
		    parseInt(req.body.uid), uidList[counter], eidList[counter], pidList[counter]);
	   // console.log(pack);
	    helper.connectAndSend(pack, f, function() {
		res.send({
		    status : "timeout"
		});
	    });
	}
    };
    //console.log(pack);
    helper.connectAndSend(pack, f, function() {
	res.send({
	    status : "timeout"
	});
    });
}

/** ***************** Search ******************* */

// Search Users
/*
 * option = 1 name = 2 tags = 0 both range = 0 local = 1 global gender = 0
 * female = 1 male = 2 both
 */

exports.searchUserByFilter = function(req, res) {
    // console.log(parseInt(req.body.age_lower));
    console.log("option is " + req.body.option);
    console.log("filteris " + req.body.filter);
    var pack = lib.createSearchUserPack(0, req.body.session_key,
	    parseInt(req.body.uid), parseInt(req.body.option), req.body.filter,
	    parseInt(req.body.range), parseInt(req.body.age_lower),
	    parseInt(req.body.age_upper), parseInt(req.body.gender));
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	var output = {
	    "uids" : pkg[1]
	};
    res.send(output);}
    , function() {
    res.send({
           status : "timeout"
           });
    });
}

// mode =1 by id
// =2 by email
exports.searchUserById = function(req, res) {
    var pack = lib.createSearchUserPack(1, req.body.session_key,
	    parseInt(req.body.uid), parseInt(req.body.id));
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	var output = {
	    "uids" : pkg[1]
	};
    res.send(output);}
    , function() {
    res.send({
           status : "timeout"
           });
    });
}

exports.searchUserByEmail = function(req, res) {
    var pack = lib.createSearchUserPack(2, req.body.session_key,
	    parseInt(req.body.uid), req.body.email);
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	var output = {
	    "uids" : pkg[1]
	};
    res.send(output);}
    , function() {
    res.send({
           status : "timeout"
           });
    });
}

// Search Events
/*
 * option = 1 name = 2 tags = 0 both range = 0 local = 1 global
 */

exports.searchEventByFilter = function(req, res) {
    var pack = lib.createSearchEventPack(0, req.body.session_key,
	    parseInt(req.body.uid), parseInt(req.body.option), req.body.filter,
	    parseInt(req.body.range));
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	var eids=[];
	if(pkg[1]){
		for(var i=0;i<pkg[1].length;i++)
			eids[i]=helper.hexToDec(pkg[1][i]);
	}
	var output = {
	    "eids" : eids
	};
    res.send(output);}
    , function() {
    res.send({
       status : "timeout"
       });
    });
}

exports.searchEventById = function(req, res) {
	console.log("search event id is");
    console.log(helper.decToHex(req.body.id));
    var pack = lib.createSearchEventPack(1, req.body.session_key,
	    parseInt(req.body.uid), helper.decToHex(req.body.id));
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	var eids=[];
	if(pkg[1]){
		for(var i=0;i<pkg[1].length;i++)
			eids[i]=helper.hexToDec(pkg[1][i]);
	}
	var output = {
	    "eids" : eids
	};
    res.send(output);}
    , function() {
    res.send({
           status : "timeout"
           });
    });
}

// Search Posts
/*
 * range = 0 local = 1 global option = 1 user = 2 event = 0 both
 */

exports.searchPost = function(req, res) {
    var pack = lib.createSearchPostingPack(req.body.session_key,
	    parseInt(req.body.uid), req.body.filter, parseInt(req.body.range),
	    parseInt(req.body.option));
    helper.connectAndSend(pack, function(data) {
                          console.log(data);
	var pkg = lib.resolvPack(data);
                          console.log(pkg);
	var output = {
	    "pidsets" : pkg[1]
	};
    res.send(output);}
    , function() {
    res.send({
           status : "timeout"
           });
    });
}

/** ***************** Update Information ****************** */

exports.updateUser = function(req, res) {
    var update = [];
    if (req.body.name.length > 0)
	update.push([ 1, req.body.name ]);
    if (req.body.nickname.length > 0)
	update.push([ 2, req.body.nickname ]);
    if (req.body.birthday.length > 0)
	update.push([ 3, parseInt(req.body.birthday) ]);
    if (req.body.gender.length > 0)
	update.push([ 4, parseInt(req.body.gender) ]);
    if (req.body.city.length > 0)
	update.push([ 5, req.body.city ]);
    if (req.body.state.length > 0)
	update.push([ 6, req.body.state ]);
    if (req.body.country.length > 0)
	update.push([ 7, req.body.country ]);
    if (req.body.add_tag.length > 0) {
		for (var i = 0; i < req.body.add_tag.length; i++)
		    update.push([ 8, req.body.add_tag[i] ]);
    }
    // ,[8,req.body.add_tag]];
    if (req.body.delete_tag.length > 0) {
		for (var i = 0; i < req.body.delete_tag.length; i++)
		    update.push([ 9, req.body.delete_tag[i] ]);
    }
    // ,[9,req.body.delete_tag],[10,req.body.setting_no, req.body.setting]];
    console.log(update);
    var pack = lib.createUpdateUserPack(req.body.session_key,
	    parseInt(req.body.uid), update);
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	var status = "successful";
	var result = pkg[1][0];
	for (var i = 0; i < result.length; i++) {
	    if (result[i][1] == 1) {
		status = "unsuccessful";
		break;
	    }
	}
	var output = {
	    "status" : status
	};
	res.send(output);
    });
}
exports.updateUserPassword = function(req, res) {
    var update = [ [ 1, req.session.password ] ];
    var pack = lib.createUpdateUserPack(req.body.session_key,
	    parseInt(req.body.uid), update);
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvePack(data);
	var status = "successful";
	var result = pkg[1][0];
	for (var i = 0; i < result.length; i++) {
	    if (result[i][1] == 1) {
		status = "unsuccessful";
		break;
	    }
	}
	var output = {
	    "status" : status
	};
	res.send(output);
    });
}
exports.updateEvent = function(req, res) {
    // var updates =
    // [[1,req.session.name],[5,req.body.city],[8,req.body.add_tag],[9,req.body.delete_tag],
    // [10,req.body.setting_no, req.body.setting],
    // [11,req.body.add_manager],[12,
    // req.body.del_manager],[13,req.body.del_member]];
    var update = [];
    if (req.body.name.length > 0)
	update.push([ 1, req.body.name ]);
    if (req.body.city.length > 0)
	update.push([ 5, req.body.city ]);
    if (req.body.add_tag.length > 0) {
	for (var i = 0; i < req.body.add_tag.length; i++)
	    update.push([ 8, req.body.add_tag[i] ]);
    }
    // ,[8,req.body.add_tag]];
    if (req.body.delete_tag.length > 0) {
	for (var i = 0; i < req.body.delete_tag.length; i++)
	    update.push([ 9, req.body.delete_tag[i] ]);
    }
    // lack of [10,req.body.setting_no, req.body.setting];
    var pack = lib.createUpdateEventPack(req.body.session_key,
	    parseInt(req.body.uid), helper.decToHex(req.body.eid), update);
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	var status = "successful";
	var result = pkg[1][0];
	for (var i = 0; i < result.length; i++) {
	    if (result[i][1] == 1) {
		status = "unsuccessful";
		break;
	    }
	}
	var output = {
	    "status" : status
	};
	res.send(output);
    });
}
/*
 * not finished exports.updateFriendComments = function(req,res){ var pack =
 * lib.createUpdateFriendCommentsPack(req.body.session_key,
 * parseInt(req.body.uid), req.body.target_uid, req.body.comment);
 * helper.connectAndSend(pack,function(data){ var pkg = lib.resolvPack(data);
 * var output = { status; }; res.send(output); }); }
 * 
 * exports.updateStatus = function(req,res){ var status = "unsuccessful"; var
 * pack = lib.createUpdateStatusPack(req.body.session_key,
 * parseInt(req.body.uid), req.body.target_uid, req.body.status);
 * helper.connectAndSend(pack,function(data){ var pkg = lib.resolvPack(data);
 * if(pkg[1][0]==1){ status = "successful"; } var output = { "status": status };
 * res.send(output); }); }
 */
exports.updateUserAvarta = function(req, res) {
	var status = "unsuccessful";
	var path = dataPath+req.body.uid+'/tmp/'+req.body.avarta;
	//var path = "/data/"+req.body.uid+"/tmp/"+req.body.avarta;
	var pack = lib.createUpdateAvartaBig(0, req.body.session_key, parseInt(req.body.uid), path);
	helper.connectAndSend(pack, function(data) {
		var pkg = lib.resolvPack(data);
		if (pkg[1][2]) {
			status = "successful";
			fs.unlink(path);
		}
		var output = {
			"status" : status
		};
		res.send(output);
	});
}

exports.updateUserSmallAvarta = function(req, res) {
    var status = "unsuccessful";
    var path = dataPath+req.body.uid+'/tmp/small'+req.body.avarta;
    //var path = "/data/"+req.body.uid+"/tmp/"+req.body.avarta;
    var pack = lib.createUpdateAvartaSmall(0, req.body.session_key, parseInt(req.body.uid), path);
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	if (pkg[1][2]) {
	    status = "successful";
        fs.unlink(path);

	}
	var output = {
	    "status" : status
	};
	res.send(output);
    });
}
/* not finished */
exports.updateEventAvarta = function(req, res) {
    var status = "unsuccessful";
    var pack = lib.createUpdateAvartaBig(req.body.session_key, 1,
	    parseInt(req.body.uid), helper.decToHex(req.body.eid), req.body.avarta);
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	if (pkg[1][3] == 0) {
	    status = "successful";
	}
	var output = {
	    "status" : status
	};
	res.send(output);
    });
}
exports.updateEventSmallAvarta = function(req, res) {
    var status = "unsuccessful";
    var pack = lib.createUpdateAvartaSmall(req.body.session_key, 1,
	    parseInt(req.body.uid), helper.decToHex(req.body.eid), req.body.avarta);
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	if (pkg[1][3] == 0) {
	    status = "successful";
	}
	var output = {
	    "status" : status
	};
	res.send(output);
    });
}

/** ********Delete************* */
exports.deleteFriend = function(req, res) {
    var status = "unsuccessful";
    var pack = lib.createDeleteFriendPack(req.body.session_key,
	    parseInt(req.body.uid), parseInt(req.body.id));
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	if (pkg[1][1] == 1) {
	    status = "successful";
	}
	var output = {
	    "status" : status
	};
	res.send(output);
    });
}
exports.deletePost = function(req, res) {
    var status = "unsuccessful";
    var pack = lib.createDeletePostingPack(req.body.session_key,
	    parseInt(req.body.uid), parseInt(req.body.id), helper.decToHex(req.body.eid),
	    req.body.pid);
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	if (pkg[1][3] == 1) {
	    status = "successful";
	}
	var output = {
	    "status" : status
	};
	res.send(output);
    });
}
exports.deleteSchedule = function(req, res) {
    var status = "unsuccessful";
    var pack = lib.createDeleteSchedulePack(req.body.session_key,
	    parseInt(req.body.uid), parseInt(req.body.id), helper.decToHex(req.body.eid),
	    parseInt(req.body.sid));
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	if (pkg[1][3] == 1) {
	    status = "successful";
	}
	var output = {
	    "status" : status
	};
	res.send(output);
    });
}
exports.deleteReply = function(req, res) {
    var status = "unsuccessful";
    console.log(req.body);
    var pack = lib.createDeleteReplyPack(req.body.session_key,
	    parseInt(req.body.uid), parseInt(req.body.id), helper.decToHex(req.body.eid),
	    req.body.pid, parseInt(req.body.rid));

    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
        if (pkg[1][5] == 1) {
	    status = "successful";
	}
	var output = {
	    "status" : status
	};
	res.send(output);
    });
}
exports.deleteEventManager = function(req,res){
    var update = [];
    update.push([12, parseInt(req.body.delete_manager)]);
    // lack of [10,req.body.setting_no, req.body.setting];
    var pack = lib.createUpdateEventPack(req.body.session_key, parseInt(req.body.uid), helper.decToHex(req.body.eid), update);
    helper.connectAndSend(pack, function(data) {
        var pkg = lib.resolvPack(data);
        var status = "successful";
        var result = pkg[1][0];
        for (var i = 0; i < result.length; i++) {
            if (result[i][1] == 1) {
                status = "unsuccessful";
                break;
            }
        }
        var output = {
            "status" : status
        };
        res.send(output);
        });
}
exports.addEventManager = function(req,res){
    var update = [];
    update.push([11, parseInt(req.body.add_manager)]);
    // lack of [10,req.body.setting_no, req.body.setting];
    var pack = lib.createUpdateEventPack(req.body.session_key, parseInt(req.body.uid), helper.decToHex(req.body.eid), update);
    helper.connectAndSend(pack, function(data) {
        var pkg = lib.resolvPack(data);
        var status = "successful";
        var result = pkg[1][0];
        for (var i = 0; i < result.length; i++) {
        if (result[i][1] == 1) {
        status = "unsuccessful";
        break;
        }
        }
        var output = {
        "status" : status
        };
        res.send(output);
        });
}
exports.deleteEventMember = function(req,res){
    var update = [];
    update.push([13, parseInt(req.body.delete_members)]);
    // lack of [10,req.body.setting_no, req.body.setting];
    var pack = lib.createUpdateEventPack(req.body.session_key, parseInt(req.body.uid), helper.decToHex(req.body.eid), update);
    helper.connectAndSend(pack, function(data) {
        var pkg = lib.resolvPack(data);
        var status = "successful";
        var result = pkg[1][0];
        for (var i = 0; i < result.length; i++) {
        if (result[i][1] == 1) {
        status = "unsuccessful";
        break;
        }
        }
        var output = {
        "status" : status
        };
        res.send(output);
        });
}


exports.emailValidation = function(req, res) {
    var status = "successful";
    var reason = "NA";
    var pack = lib.createEmailValidationPack(req.body.email);
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	if (pkg[1][0] != 1) {
	    status = "unsuccessful";
        switch(pkg[1][1]){
            case 0:
                reason = "Email Already Registered!";
                break;
            case 1:
                reason = "Invalid Email";
        }
	}
	var output = {
	    "status" : status,
        "reason" : reason
	};
	res.send(output);
    });
}
exports.validateCode = function(req, res) {
    var status = "unsuccessful";
    var pack = lib.createIdentificationCodeValidationPack(req.body.email,
	    parseInt(req.body.code_1), req.body.code_2);
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	if (pkg[1][0] == 1) {
	    status = "successful";
	}
	var output = {
	    "status" : status
	};
	res.send(output);
    });
}
exports.quitEvent = function(req, res) {
    var status = "unsuccessful";
    var pack = lib.createQuitEventPack(req.body.session_key,
	    parseInt(req.body.uid), helper.decToHex(req.body.eid));
    helper.connectAndSend(pack, function(data) {
	var pkg = lib.resolvPack(data);
	if (pkg[1][1] == 1) {
	    status = "successful";
	}
	var output = {
	    "status" : status
	};
	res.send(output);
    });
}
exports.emailInvitation = function(req, res) {
    var status = "unsuccessful";
    var pack = lib.createInvitationPack(req.body.session_key,
	    parseInt(req.body.uid), req.body.emails);
    helper.connectAndSend(pack, function() {
	var output = {"status":"successful"};
	res.send(output);
    },null,true);
}
/** ***************Notifications****************** */
exports.responseNoti = function(req, res) {
	console.log("reach here");
    var status = "unsuccessful";
    var session_key = req.body.session_key;
    var uid = req.body.uid;
    var subtype = req.body.subType;
    var seq = req.body.seq;
    var n_uid = req.body.n_uid;
    var eid = helper.decToHex(req.body.eid);
    var pid = req.body.pid;
    var action = req.body.action;
    var pack = lib.createNotificationPack(session_key,parseInt(uid), parseInt(subtype), parseInt(seq), parseInt(n_uid), eid,pid,parseInt(action));
    helper.connectAndSend(pack, function(){
	var output = {"status":"successful"};
	res.send(output);
	clearNotificationHandler(uid,seq);
    },null,true);
}
// exports.chatToUser = function(session_key, uid, seq, to_uid, content){
//     //createMessageToUserPack
//     console.log("I got the chat!!!!!!!!!!!!!!!!!!!");
//     var status = "unsuccessful";
//     var pack = lib.createMessageToUserPack(session_key,parseInt(uid), parseInt(seq), parseInt(to_uid), content);
//     helper.connectAndSend(pack, function(){
//                 var output = {"status":"successful"};
//                 res.send(output);
//                           clearChatHandler(uid,seq);
//                           },null,true);}
// exports.chatToEvent = function(session_key, uid, seq, eid, content){
// var status = "unsuccessful";
// var pack = lib.createMessageToEventPack(session_key,parseInt(uid), parseInt(seq), eid, content);
//     helper.connectAndSend(pack, function(){
//     var output = {"status":"successful"};
//     res.send(output);
//                           clearChatHandler(uid,seq);
//                           },null,true);}

exports.uploadAvarta = function(req, res){
	fs.readFile(req.files.image.path, function(err, data){
		var imageName = req.files.image.name;
		var imgsize =1;
		/// If there's an error
		if(!imageName){
			console.log("There was an error.")
			res.send({status:"unsuccessful"});
		}else{
			var path = dataPath +req.body.uid+"/tmp/";
			console.log("path: "+path);
			fs.readdir(path, function(err){
				if(err){
					console.log("not exists");
					fs.mkdir(path,function(err){
						console.log("created dir");
						var imagePath = path + imageName;
						var smallimagePath = path +'small'+imageName;
						fs.writeFileSync(imagePath, data);
						fs.writeFileSync(smallimagePath, data);
						gm(smallimagePath).resize(24,24);
						res.send({status:"successful"});
					});
				}else{
					console.log("exists");
					var imagePath = path + imageName;
					var smallimagePath = path +'small'+imageName;
					fs.writeFileSync(imagePath, data);
					fs.writeFileSync(smallimagePath, data);
					gm(smallimagePath).resize(24,24);
					res.send({status:"successful"});
				}
			});
		}
	});
}
/*sanitizer tags*/
function parseTags(tags){
	var results=[];
	if(tags){
		for(var i=0;i<tags.length;i++)
			results[i] = sanitizer.escape(tags[i]);
	}
	return results;
}