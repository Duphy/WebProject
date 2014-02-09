var socket = io.connect('http://circatag.com');
console.log("client socket connected!");
socket.emit("uid",localStorage.uid);
socket.on("friend request",function(name, uid, eid, pid, action, seq){
	console.log("notfication name: "+name+" uid: "+uid+" action: "+action);
	var newNotificationNumber = parseInt($("#notificationNumber").html().trim()) + 1;
	$("#notificationNumber").html(" "+newNotificationNumber+" ");
	if(newNotificationNumber == 1){
		$("#notificationList").html("");
		$("#notificationNumber").css({"color":"red","font-weight":"bold"});
	}else{
		$("#notificationList").append("<li class = 'divider'></li>");
	}
	$("#notificationList").append(friendRequestNotification(name, uid, eid, pid, action, seq));
	var userData = {};
	userData.session_key = localStorage.session_key;
	userData.uid = localStorage.uid;
	userData.view_uid = uid;
	$.ajax({
	    url:"/getuserinfo",
	    data:JSON.stringify(userData),
	    type:"POST",
	    contentType: 'application/json',
	    success:function(data){
	    	console.log(data);
	      	$.each($(".user"+uid),function(index, element){
	      		$(element).attr("name",data.nickname);
	      		$(element).html(data.nickname);
	      	});
	    }  
	});
}); 
 
socket.on("event membership request",function(name,uid, pid, eventName,eid,action, seq){
	console.log("notfication name: "+name+" uid: "+uid+" eventName: "+eventName+" eid: "+eid+"action: "+action);
	var newNotificationNumber = parseInt($("#notificationNumber").html().trim()) + 1;
	$("#notificationNumber").html(" "+newNotificationNumber+" ");
	if(newNotificationNumber == 1){
		$("#notificationList").html("");
		$("#notificationNumber").css({"color":"red","font-weight":"bold"});
	}else{
		$("#notificationList").append("<li class = 'divider'></li>");
	}
	$("#notificationList").append(eventJoinRequestNotification(name,uid, pid, eventName,eid,action, seq));
	var eventData = {};
	eventData.session_key = localStorage.session_key;
	eventData.uid = localStorage.uid;
	eventData.eid = eid;
	$.ajax({
	    url:"/geteventinfo",
	    data:JSON.stringify(eventData),
	    type:"POST",
	    contentType: 'application/json',
	    success:function(data){
	    	console.log("!!!!!!!!!!!!!!!!!!!!!!");
	    	console.log(data);
	      	$.each($("."+eid),function(index, element){
	      		$(element).attr("name",data.name);
	      		$(element).html(data.name);
	      	});
	    }  
	});
	var userData = {};
	userData.session_key = localStorage.session_key;
	userData.uid = localStorage.uid;
	userData.view_uid = uid;
	$.ajax({
	    url:"/getuserinfo",
	    data:JSON.stringify(userData),
	    type:"POST",
	    contentType: 'application/json',
	    success:function(data){
	    	console.log(data);
	      	$.each($(".user"+uid),function(index, element){
	      		$(element).attr("name",data.nickname);
	      		$(element).html(data.nickname);
	      	});
	    }  
	});
});

socket.on("reply posting",function(name, uid, eid, post,pid, seq){
	console.log("notfication name: "+name+" uid: "+uid+" post: "+eventName+" pid: "+eid);
	var newNotificationNumber = parseInt($("#notificationNumber").html().trim()) + 1;
	$("#notificationNumber").html(" "+newNotificationNumber+" ");
	if(newNotificationNumber == 1){
		$("#notificationList").html("");
		$("#notificationNumber").css({"color":"red","font-weight":"bold"});
	}else{
		$("#notificationList").append("<li class = 'divider'></li>");
	}
	$("#notificationList").append(postReplyNotification(name, uid, eid, post,pid, seq));
});

socket.on("receive user chat",function(uid, message, date, time){
	console.log("chat: "+message+" uid: "+uid);
	console.log(date);
	console.log(time);
	var proceed = true;
	$.each($("#chatArea").find(".chat-window"),function(index,element){
		if($(element).attr("id").replace("chat","") == uid){
		  proceed = false;
		}
	});
	if(proceed){
		openFriendsChatBox(localStorage.session_key,localStorage.uid,uid,chatBoxNumber);
		chatBoxNumber++;
	}
	// if(proceed){
	// 	if($(".friendItem").length != 0){
	// 		var name = $("a.friendItem[uid='"+uid+"']").attr("name");
	// 		var url = $("a.friendItem[uid='"+uid+"']").find("img").attr("src");
	// 		$('#chatArea').append(renderChatBox({"name":name,"id":uid,"url":url},chatBoxNumber));
	// 	}else{	
	// 		$('#chatArea').append(renderChatBox({"name":uid,"id":uid,"url":"#"},chatBoxNumber));
	// 	}
	// 	chatBoxNumber++;
	// }
	$.each($("#chatArea").find(".chat-window"), function(index,element){
		if($(element).attr("id").replace("chat","") == uid){
			if($(element).find(".chat-message").last().attr("uid") == uid){
				$(element).find(".chat-message").last().find(".chat-text-wrapper").append('<p>'+message+'</p>');
			}else{
				$(element).find(".chat-window-content").append(
				  '<div class = "chat-message" uid = "'+uid+'">'+
				    '<div class = "chat-gravatar-wrapper">'+
				      '<img class = "chatAvarta'+uid+'" src = "'+$(element).attr("url")+'" style = "height:20px;width:20px;border-radius:10px;">'+
				    '</div>'+
				    '<div class = "chat-text-wrapper">'+
				      '<p>'+message+'</p>'+            
				    '</div>'+
				  '</div>'
				);
				var chatArea = $(element).find(".chat-window-content");
				$(chatArea).animate({scrollTop:$(chatArea)[0].scrollHeight}, 1000);
			}
		}
	});
});

socket.on("receive event chat",function(eid, s_uid, message, date, time){
	console.log("chat: "+message+" eid: "+eid);
	console.log(date);
	console.log(time);
	$($("#eventsList").find('.eventItem'),function(index,element){
		if($(element).attr("eid") == eid){
			$(element).trigger("click");
		}
	});
	$.each($("#chatArea").find(".chat-window"), function(index,element){
		if($(element).attr("chatId") == eid){
			if($(element).find(".chat-message").last().attr("uid") == localStorage.uid){
				$(element).find(".chat-message").last().find(".chat-text-wrapper").append('<p>'+message+'</p>');
			}else{
				$(element).find(".chat-window-content").append(
				  '<div class = "chat-message" uid = "'+s_uid+'">'+
				    '<div class = "chat-gravatar-wrapper">'+
				      '<img src = "'+localStorage.self_small_avarta+'" style = "height:20px;width:20px;border-radius:10px;">'+
				    '</div>'+
				    '<div class = "chat-text-wrapper">'+
				      '<p>'+message+'</p>'+            
				    '</div>'+
				  '</div>'
				);
			}
		}
	});
});
// socket.on("deleted from event",function(name,uid,eventName,eid){

// });

// socket.on("event membership invitation",function(name,uid,eventName,eid){

// });

// socket.on("event appointed as manager",function(name,uid,eventName,eid){

// });

// socket.on("event relieve managership",function(name,uid,eventName,eid){

// });

// socket.on("being taged",function(name,uid,tag){

// });
