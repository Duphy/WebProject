var eid = localStorage.eid;
var loadOrder = 1;
$(document).ready(function(){
    $("#eventHead").html(localStorage.ename);
    var auth_data = {};
    auth_data.session_key = localStorage.session_key;
    auth_data.uid = localStorage.uid;
    auth_data.eid = eid;
    var selfAvartaData = {};
    eventAvartaData = auth_data;
    selfAvartaData.time = getCurrentTime();
    selfAvartaData.date = getCurrentDate();
    $.ajax({
    	url:'/geteventsmallavarta',
    	data:JSON.stringify(eventAvartaData),
    	type:"POST",
    	contentType:"application/json",
    	success:function(data){
    		console.log("event avarta data:"); 
    		console.log(data);
        $("#eventAvarta").attr("src",data.avarta);
    	}
    });

    //get event's members information
    $.ajax({
         url:"/geteventmembers",
         data:JSON.stringify(auth_data),
         type:"POST",
         contentType: 'application/json',
         success:function(result){
         if(result.members || result.members.length > 0){
            var membersData = {};
            membersData.uidList = result.members;
            membersData.session_key = localStorage.session_key;
            membersData.uid = localStorage.uid;
            console.log(membersData);
                $.ajax({
                      url:"/getusersinfo",
                      data:JSON.stringify(membersData),
                      type:"POST",
                      contentType:'application/json',
                      success:function(result){
                      //console.log("friends information:");
                      console.log(result);
                      if(result.status == "successful"){
                      $.each(result.source,function(index,element){
                        switch(loadOrder){
                          case 1:
                            $("#membersList1").append(member(element,"member"));
                          break;
                          case 2:
                            $("#membersList2").append(member(element,"member"));
                          break;
                          case 3:
                            $("#membersList3").append(member(element,"member"));
                          break;
                          case 4:
                            $("#membersList4").append(member(element,"member"));
                          break;
                          case 5:
                            $("#membersList5").append(member(element,"member"));
                          break;
                          case 6:
                            $("#membersList6").append(member(element,"member"));
                          break;
                          default:
                          break;
                        }
                        loadOrder = loadOrder%6 + 1;
                      });
                      $("#circularG").hide();
                      }
                    }
                });//ajax
            }
        }
    });//ajax

    $("#memberTab").click(function(){
      $("#circularG").show();
      $.each($(this).closest("ul").find("li"),function(index,element){
        $(element).removeClass("active");
      });
      $(this).addClass("active");
      clearMembers();
      $.ajax({
         url:"/geteventmembers",
         data:JSON.stringify(auth_data),
         type:"POST",
         contentType: 'application/json',
         success:function(result){
         if(result.members || result.members.length > 0){
          var membersData = {};
          membersData.uidList = result.members;
          membersData.session_key = localStorage.session_key;
          membersData.uid = localStorage.uid;
          console.log(membersData);
          $.ajax({
                url:"/getusersinfo",
                data:JSON.stringify(membersData),
                type:"POST",
                contentType:'application/json',
                success:function(result){
                  console.log(result);
                  if(result.status == "successful"){
                  $.each(result.source,function(index,element){
                    switch(loadOrder){
                      case 1:
                        $("#membersList1").append(member(element,"member"));
                      break;
                      case 2:
                        $("#membersList2").append(member(element,"member"));
                      break;
                      case 3:
                        $("#membersList3").append(member(element,"member"));
                      break;
                      case 4:
                        $("#membersList4").append(member(element,"member"));
                      break;
                      case 5:
                        $("#membersList5").append(member(element,"member"));
                      break;
                      case 6:
                        $("#membersList6").append(member(element,"member"));
                      break;
                      default:
                      break;
                    }
                    loadOrder = loadOrder%6 + 1;
                  });
                  $("#circularG").hide();
                  }
                }
          }); 
      }else{
          $("#membersList").append("<font>No member yet.</font>");
          $("#circularG").hide();
      }
      }
    });
});

    $("#managerTab").click(function(){
     $("#circularG").show();
     $.each($(this).closest("ul").find("li"),function(index,element){
        $(element).removeClass("active");
      });
      $(this).addClass("active");
      clearMembers();
      $.ajax({
         url:"/geteventmanagers",
         data:JSON.stringify(auth_data),
         type:"POST",
         contentType: 'application/json',
         success:function(result){
         if(result.members && result.members.length > 0){
          var membersData = {};
          membersData.uidList = result.members;
          membersData.session_key = localStorage.session_key;
          membersData.uid = localStorage.uid;
          console.log(membersData);
          $.ajax({
                url:"/getusersinfo",
                data:JSON.stringify(membersData),
                type:"POST",
                contentType:'application/json',
                success:function(result){
                  console.log(result);
                  if(result.status == "successful"){
                  $.each(result.source,function(index,element){
                    switch(loadOrder){
                      case 1:
                        $("#membersList1").append(member(element,"manager"));
                      break;
                      case 2:
                        $("#membersList2").append(member(element,"manager"));
                      break;
                      case 3:
                        $("#membersList3").append(member(element,"manager"));
                      break;
                      case 4:
                        $("#membersList4").append(member(element,"manager"));
                      break;
                      case 5:
                        $("#membersList5").append(member(element,"manager"));
                      break;
                      case 6:
                        $("#membersList6").append(member(element,"manager"));
                      break;
                      default:
                      break;
                    }
                    loadOrder = loadOrder%6 + 1;
                  });
                  $("#circularG").hide();
                  }
                }
          }); 
      }else{
          $("#membersList").append("<font>No member yet.</font>");
          $("#circularG").hide();
      }
      }
    });
});

  $('#backButton').click(function(){
      window.location.href= "/event";
      return false;
  });

  $("body").delegate(".userName", 'click', function() {
    localStorage.friendUid  = $(this).attr("uid");
    localStorage.friendName = $(this).attr("name");
    window.location = "/user";
    return false;
  });

  $("body").delegate(".eventName", 'click', function() {
    localStorage.eid = $(this).attr("eid");
    localStorage.ename = $(this).attr("name");
    window.location = "/event";
    return false;
  });

  $("#deleteConfirm").click(function(){
    //TO DO: to be completed

  });

  $("#timeoutButton").click(function(){
    localStorage.clear();
    window.location = "/";
    return false;
  });

  $('body').delegate('.chat-window-text-box','keypress',function(event){
    var content = $(this).val();
    if(event.keyCode == 13)
    {
      var chatArea = $(this).closest(".chat-window").find(".chat-window-content");
      if($(this).closest(".chat-window").find(".chat-message").last().attr("uid") == localStorage.uid){
        $(this).closest(".chat-window").find(".chat-message").last().find(".chat-text-wrapper").append('<p>'+content+'</p>');
      }else{
        $(chatArea).append(
          '<div class = "chat-message" uid = "'+localStorage.uid+'">'+
            '<div class = "chat-gravatar-wrapper">'+
              '<img src = "'+localStorage.self_small_avarta+'" style = "height:20px;width:20px;border-radius:10px;">'+
            '</div>'+
            '<div class = "chat-text-wrapper">'+
              '<p>'+content+'</p>'+            
            '</div>'+
          '</div>'
          );
      }
      $(chatArea).animate({scrollTop:$(chatArea)[0].scrollHeight}, 1000);
      $(this).val("");
      var id = $(this).closest(".chat-window").attr('id').replace("chat","");
      console.log("id length:"+id.length);
      if(id.length > 7){
          console.log("event chat: "+id+" "+content);
          socket.emit("get event chat",localStorage.session_key, localStorage.uid, 0, id, content);
      }else{
          console.log("friend chat: "+id+" "+content);
          socket.emit("get user chat",localStorage.session_key, localStorage.uid, 0, id, content);
      }
      return false;
    }
  });
  
});

function renderUser(user){
        //user.id = user.uid+""+post.eid+""+post.pid;
        var html =
        '<div class = "row-fluid postRoot" uid = "'+user.uid+'" style = "background-color:#FFFFFF;margin-bottom:10px;">'+
            '<div class = "row-fluid" style = "margin-top:10px;height:50px;">'+
                '<div class = "span4 row-fluid" style = "text-align: center;">'+
                    '<div class = "span4">'+
                        '<img src = "#" style = "width:40px;border-radius:20px;">'+
                    '</div>'+
                    '<div class = "span8" style = "text-align:left;">'+
                        '<a href = # class = "userName" name = "'+user.name+'" uid = "'+user.uid+'">'+user.nickname+'</a><p style = "font-size:12px;color:#999;">'+user.gender+'<br>'+user.city+'</p>'+
                    '</div>'+
                '</div>'+
                '<div class = "offset6 span2" style = "color:white;text-align: center;">'+
                '<div class = "tagsGroup">';
                    var tagCounter = Math.min(4,user.tags.length);
                    for(var tagNumber = 0; tagNumber < tagCounter; tagNumber++){
                        if(tagNumber == 0){
                            html = html +'<a class = "tagHead">'+user.tags[tagNumber]+'</a>';
                        }else{
                            html = html +'<a>'+user.tags[tagNumber]+'</a>';
                        }
                    }
                    html = html+
                '</div>'+
            '</div>'+
        '</div>'+
        '<div class = "row-fluid shareButtons" style = "margin-top:10px;">'+
            '<div class = "offset1 span1"><button class = "btn" style = "width:68px;height:35px;margin-left:111px"><i class = "icon-plus-sign"></i>  add</button></div>'+
        '</div>'+
        '<div class = "row-fluid" style="margin-top:10px;">'+
           '<div class = "offset1 span10 offset1" style = "text-align: center;"><a>You have '+user.common_friends.length+' common friends</a></div>'+
        '</div>';
    return html;
}

function getCurrentTime(){
    var now = new Date(),
    hour = now.getHours();
    minute =now.getMinutes();
    if(hour < 10){
		hour = "0"+hour;
	}
	if(minute < 10){
		minute = "0"+minute;
	}
    now = hour +":"+minute;
    //now = now.getHours()+':'+now.getMinutes();
    //console.log("time is "+ now);
    return now;
}

function getCurrentDate(){
    var now = new Date();
    var tmp = [ "Jan ", "Feb ", "Mar ", "Apr ", "May ", "Jun ", "Jul ", "Aug ", "Sep ", "Oct ", "Nov ", "Dec "];
    now = tmp[now.getMonth()]+now.getDate()+", "+now.getFullYear();
    //console.log("date is "+ now);
	return now;
}

function clearMembers(){
    $("#membersList1").html("");
    $("#membersList2").html("");
    $("#membersList3").html("");
    $("#membersList4").html("");
    $("#membersList5").html("");
    $("#membersList6").html("");
    loadOrder = 1;
}
/////////ajx////////////
//add manager
// var data = auth_data;
// //data.add_manager;
// $.ajax({
//        url:"/addeventmanager",
//        data:JSON.stringify(auth_data),
//        type:"POST",
//        contentType: 'application/json',
//        success:function(result){
//        }
// });
// //delete manager
// var data = auth_data;
// //data.delete_manager;
// $.ajax({
//        url:"/deleteeventmanager",
//        data:JSON.stringify(auth_data),
//        type:"POST",
//        contentType: 'application/json',
//        success:function(result){
//        }
// });
// //delete member
// var data = auth_data;
// //data.delete_manager;
// $.ajax({
//        url:"/deleteeventmember",
//        data:JSON.stringify(auth_data),
//        type:"POST",
//        contentType: 'application/json',
//        success:function(result){
//        }
// });