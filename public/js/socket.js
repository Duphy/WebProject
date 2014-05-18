var socket = io.connect('localhost');
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
	    timeout:10000,
	    type:"POST",
	    contentType: 'application/json',
	    success:function(data){
	    	console.log(data);
	      	$.each($(".user"+uid),function(index, element){
	      		$(element).attr("name",data.nickname);
	      		$(element).html(data.nickname);
	      	});
	    },
	    error:function(jqXHR, textStatus, errorThrown){
          if(textStatus == "timeout"){
            $("#timeoutModal").modal("show");
          }
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
	    timeout:10000,
	    type:"POST",
	    contentType: 'application/json',
	    success:function(data){
	    	console.log("!!!!!!!!!!!!!!!!!!!!!!");
	    	console.log(data);
	      	$.each($("."+eid),function(index, element){
	      		$(element).attr("name",data.name);
	      		$(element).html(data.name);
	      	});
	    },
	    error:function(jqXHR, textStatus, errorThrown){
          if(textStatus == "timeout"){
            $("#timeoutModal").modal("show");
          }
        }
	});
	var userData = {};
	userData.session_key = localStorage.session_key;
	userData.uid = localStorage.uid;
	userData.view_uid = uid;
	$.ajax({
	    url:"/getuserinfo",
	    data:JSON.stringify(userData),
	    timeout:10000,
	    type:"POST",
	    contentType: 'application/json',
	    success:function(data){
	    	console.log(data);
	      	$.each($(".user"+uid),function(index, element){
	      		$(element).attr("name",data.nickname);
	      		$(element).html(data.nickname);
	      	});
	    },
	    error:function(jqXHR, textStatus, errorThrown){
	      if(textStatus == "timeout"){
	        $("#timeoutModal").modal("show");
	      }
	    } 
	});
});

socket.on("reply posting",function(name, uid, eid, pid, seq){
	console.log("reply noti");
	console.log("notfication name: "+name+" uid: "+uid+" post: "+eventName+" pid: "+eid);
	var newNotificationNumber = parseInt($("#notificationNumber").html().trim()) + 1;
	$("#notificationNumber").html(" "+newNotificationNumber+" ");
	if(newNotificationNumber == 1){
		$("#notificationList").html("");
		$("#notificationNumber").css({"color":"red","font-weight":"bold"});
	}else{
		$("#notificationList").append("<li class = 'divider'></li>");
	}
	$("#notificationList").append(postReplyNotification(name, uid, eid, pid, seq));
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
		console.log("open a new friend chat window.");
		openFriendsChatBox(localStorage.session_key,localStorage.uid,uid,chatBoxNumber);
		chatBoxNumber++;
	}
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
	var proceed = true;
	$.each($("#chatArea").find(".chat-window"),function(index,element){
		if($(element).attr("id").replace("chat","") == eid){
		  proceed = false;
		}
	});
	if(proceed){
		console.log("open a new event chat window.");
		openEventsChatBox(localStorage.session_key,localStorage.uid,eid,chatBoxNumber);
		chatBoxNumber++;
	}
	$.each($("#chatArea").find(".chat-window"), function(index,element){
		if($(element).attr("id").replace("chat","") == eid){
			if($(element).find(".chat-message").last().attr("uid") == s_uid){
				$(element).find(".chat-message").last().find(".chat-text-wrapper").append('<p>'+message+'</p>');
			}else{
				if(localStorage.getItem("avarta"+s_uid) == null){
					$(element).find(".chat-window-content").append(
					  '<div class = "chat-message" uid = "'+s_uid+'">'+
					    '<div class = "chat-gravatar-wrapper">'+
					      '<img class = "chatAvarta'+s_uid+'" src = "" style = "height:20px;width:20px;border-radius:10px;">'+
					    '</div>'+
					    '<div class = "chat-text-wrapper">'+
					      '<p>'+message+'</p>'+            
					    '</div>'+
					  '</div>'
					);
					var data = {};
			        data.uid = localStorage.uid;
			        data.session_key = localStorage.session_key;
			        data.view_uid = s_uid;
			        $.ajax({
			          url:'/getusersmallavarta',
			          data:JSON.stringify(data),
			          timeout:10000,
			          type:"POST",
			          contentType:"application/json",
			          success:function(result){
			            localStorage.setItem("avarta"+s_uid,result.avarta);
			            $(".chatAvarta"+s_uid).attr("src",result.avarta);
			          },
			          error:function(jqXHR, textStatus, errorThrown){
		                  if(textStatus == "timeout"){
		                    $("#timeoutModal").modal("show");
		                  }
		                }
			        });

				}else{
					$(element).find(".chat-window-content").append(
					  '<div class = "chat-message" uid = "'+s_uid+'">'+
					    '<div class = "chat-gravatar-wrapper">'+
					      '<img class = "chatAvarta'+s_uid+'" src = "'+localStorage.getItem("avarta"+s_uid)+'" style = "height:20px;width:20px;border-radius:10px;">'+
					    '</div>'+
					    '<div class = "chat-text-wrapper">'+
					      '<p>'+message+'</p>'+            
					    '</div>'+
					  '</div>'
					);
				}
				var chatArea = $(element).find(".chat-window-content");
				$(chatArea).animate({scrollTop:$(chatArea)[0].scrollHeight}, 1000);
			}
		}
	});
});

socket.on("log out",function(){
	$("#timeoutModal").modal("show");
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
