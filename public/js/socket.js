
/*********** Alert: Change to "www.circatag.com" on official site ********/
var socket = io.connect('localhost');
//var socket = io.connect('www.circatag.com');
console.log("client socket connected!");
socket.emit("uid",localStorage.uid);
socket.on("friend request",function(name, uid, eid, pid, action, seq, nid){
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
}); 
 
socket.on("event membership request",function(name,uid, pid, eventName,eid,action, seq, nid){
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

socket.on("reply posting",function(name, uid, eid, pid, seq, nid){
	console.log("reply noti");
	console.log("notfication name: "+name+" uid: "+uid+" post: "+eid+" pid: "+pid);
	var newNotificationNumber = parseInt($("#notificationNumber").html().trim()) + 1;
	$("#notificationNumber").html(" "+newNotificationNumber+" ");
	if(newNotificationNumber == 1){
		$("#notificationList").html("");
		$("#notificationNumber").css({"color":"red","font-weight":"bold"});
	}else{
		$("#notificationList").append("<li class = 'divider'></li>");
	}
	$("#notificationList").append(postReplyNotification(name, uid, eid, pid, seq));
	$(".postReplyNotification").css("cursor","pointer").hover(function(){
		$(this).css("background-color","#e9edf0");
		$(this).find(".notificationContent").css("background-color","#e9edf0");
	},function(){
    	$(this).css("background-color","white");
    	$(this).find(".notificationContent").css("background-color","white");
	});
	var userData = {};
	userData.session_key = localStorage.session_key;
	userData.uid = localStorage.uid;
	userData.view_uid = uid;
	var postsData = {};
	postsData.pidList = [pid];
	postsData.uidList = [localStorage.uid];
	postsData.eidList = [eid];
	postsData.session_key = localStorage.session_key;
	postsData.uid = localStorage.uid;
	$.ajax({
		url:"/getpostscontent",
	    data:JSON.stringify(postsData),
	    type:"POST",
	    contentType: 'application/json',
	    success:function(data){
	    	console.log("post details: ");
	    	console.log(data);
	    	if(data.status == "successful"){
	    		var notificationItem = $("li.notificationItem[pid="+pid+"]");
	    		$(notificationItem).find(".postContent").html(data.source[0].postContent);
	    		$(notificationItem).unbind('click').click(function(event){
	    			var notification = $(this);
	    			$.ajax({
						url:"/getpostscontent",
					    data:JSON.stringify(postsData),
					    type:"POST",
					    contentType: 'application/json',
		    			success:function(data){
		    				console.log("post details: ");
			    			console.log(data);
			    			if(data.source[0].picids.length > 0){
							    var pictureData  = {};
								pictureData.session_key = localStorage.session_key;
								pictureData.uid = localStorage.uid;
								pictureData.picid = data.source[0].picids[0];
								pictureData.index = 0;
							    $.ajax({
				                    url:'/getpicture',
				                    data:JSON.stringify(pictureData),
				                    type:"POST",
				                    contentType:"application/json",
				                    success:function(avatarData){
				                    	console.log(avatarData);
				                      if(avatarData.pics){
				                      	var url = "url("+window.location.origin+"/"+avatarData.pics+")";
							    		$('#imageModal').find('.imgLiquidFill').css('background-image',url);
							    		$('body').css("overflow","hidden");
							    		renderLargePost(data.source[0]);
							    		$(".interactionArea").show();
										$("#imageModal").modal("show");
										socket.emit("processNoti", localStorage.uid, nid);
										if($(notification).prev() && $(notification).prev().hasClass("divider")){
											$(notification).prev().remove();
										};
										$(notification).remove();
										removeNotification();
				                      }else{
				                        console.log("failed to get the picture of this post");
				                      }
				                    },
				                    error:function(jqXHR, textStatus, errorThrown){
				                      if(textStatus == "timeout"){
				                        $("#timeoutModal").modal("show");
				                      }
				                    }
				                });
								var userData = {};
						        userData.uid = localStorage.uid;
						        userData.session_key = localStorage.session_key;
						        userData.view_uid = data.source[0].uid;
						        $.ajax({
						          url:'/getusersmallavarta',
						          data:JSON.stringify(userData),
						          type:"POST",
						          contentType:"application/json",
						          success:function(result){
						            $("#imageModal").find(".modalAvarta").first().attr("src",result.avarta);
						          },
						          error:function(jqXHR, textStatus, errorThrown){
					                  if(textStatus == "timeout"){
					                    $("#timeoutModal").modal("show");
					                  }
					                }
						        });
			    			}else{
			    				renderPopPost(data.source[0]);
				    			$.each(data.source[0].replies,function(index, element){
				    				if(element.replier_uid != localStorage.uid){
								        var userAvartaData = {};
								        userAvartaData.session_key = localStorage.session_key;
								        userAvartaData.uid = localStorage.uid;
								        userAvartaData.view_uid = element.replier_uid;
								        userAvartaData.time = 0000//getCurrentTime();
								        userAvartaData.date = 00000000//getCurrentDate();
								        $.ajax({
								          url:'/getuseravarta',
								          data:JSON.stringify(userAvartaData),
								          type:"POST",
								          contentType:"application/json",
								          success:function(avatarData){
								              $("#popPostReply"+data.source[0].pid+""+element.rid).attr("src",avatarData.avarta);
								          }
								        });
							    	}
				    			});
				    			$("#popPostModal").modal("show");
				    			socket.emit("processNoti", localStorage.uid, nid);
								if($(notification).prev() && $(notification).prev().hasClass("divider")){
									$(notification).prev().remove();
								};
								$(notification).remove();
								removeNotification();
			    			}
		    			}
		    		});
	    		});
	    	}
	    }
	});
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
