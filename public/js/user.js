if(!localStorage.uid){
  window.location = "/";
} 
var pidset = [];
var loadOrder = 0;
var insertOrder = 0; 
var loadingFlag = true;
var postCounter = 0;
var friendName;
var friendNickname;
var birthday;
var uid;
var tagsList;
var gender;
var city;
var common_friends = []; 
var flag_displaycommonfriend = true;
var flag_displayevent=true;
var flag_displayfriend=true;
 
$(document).ready(function(){
  var auth_data = {};
  auth_data.session_key = localStorage.session_key;
  auth_data.uid = localStorage.uid;
  
  //retrieve user information
  var view_auth_data = auth_data;
  view_auth_data.view_uid = localStorage.friendUid;
  if(!checkFriend(localStorage.friendUid)){
    $("#settingProfile").after('<a href="#defriendModal" data-toggle="modal" ><i class="icon-remove"></i>&nbsp;&nbsp;Defriend</a>');
  }else{
    $("#settingProfile").after('<a id = "settingAddFriend"><i class="icon-plus"></i>&nbsp;&nbsp;Add Friend</a>');
  }
  $("#settingAddFriend").click(function(){
    var data = {};
    data = auth_data;
    data.receiver_uid = localStorage.friendUid;
    data.content = "Could you add me as your friend? :)";
    $("#settingAddFriend").css({"pointer-events":"none","cursor":"default","color":"#ccc"});
    $("#settingAddFriend").html("sending....");
    $.ajax({
      url:'/friendrequest',
      data:JSON.stringify(data),
      type:"POST",
      contentType:"application/json",
      success:function(result){
        if(result.status == "successful"){
          $("#settingAddFriend").html("request pending");
        }else{
          $("#settingAddFriend").html("request failed");
        }
      }
    });
    return false;
  });

  $("#profileUid").html(localStorage.friendUid);
  $.ajax({
    url:'/getuserinfo',
    data:JSON.stringify(view_auth_data),
    type:"POST",
    contentType:"application/json",
    success:function(data){
      friendName = data.realname;
      friendNickname = data.nickname;
      birthday = data.birthday;
      uid = data.uid;
      localStorage.friendTags = sortTags(data.tags);
      tagsList = sortTags(data.tags);
      gender = data.gender;
      city = data.city;
      common_friends = data.common_friends;
      for(var index = 0; index <  Math.min(4,tagsList.length); index++){
       $($("#subNavBar").find("li")[index+1]).html('<a class = "usertag" href="#" tag = '+tagsList[index]+'>'+tagsList[index]+'</a>');
      }
        //update page title
        $("title").first().html('User-'+friendNickname);

        $("#right").find("a").html("<i class = 'icon-chevron-left' style = 'margin-top:1%;'></i>Events & Friends");
         //update the user name in the navbar
        $("#left a").prepend('<img id = "navi_avarta" src = "#" style = "width:22px;height:22px;border-radius:11px;">&nbsp;<strong id="userNameLink">user</strong>');
        $("#userNameLink").text(friendNickname);

        //update profile
        if(friendName == ""){
          $("#name").html(friendNickname);
        }else{
          $("#name").html(friendName);
        }
        $("#nickname").html(friendNickname);
        $("#city").html(city);
        $("#commonFriendsNumber").html(common_friends.length);
        if(localStorage.friendTags == ""){
        $('#tags').append("<font>None</font>");
        }else{
        $.each(localStorage.friendTags.split(','),function(index,element){
            $('#tags').append("<span class='label label-info' style = 'margin-left:5px;'>"+element+"</span>");
            });
        }
        $("#birthday").html(birthday);
        $("#gender").html(gender);
        $("#profileEdit").hide();
    }
  });

  //retrieve user avarta
  $.ajax({
    url:'/getuseravarta',
    data:JSON.stringify(view_auth_data),
    type:"POST",
    contentType:"application/json",
    success:function(data){
      localStorage.user_small_avarta = data.avarta;
      $("#navi_avarta").attr("src",data.avarta);
      $("#profileAvarta").attr("src",data.avarta);
    }
  });

  //retrieve user's posts
  $.ajax({
     url:"/getuserposts",
     data:JSON.stringify(view_auth_data),
     type:"POST",
     contentType: 'application/json',
     success:function(data){
       console.log("News:");
       console.log(data);
       viewpost(data.pidsets);
     }
  });

  //retrieve user's events
  $.ajax({
      url:"/getuserevents",
      data:JSON.stringify(view_auth_data),
      type:"POST",
      contentType: 'application/json',
      success:function(data){
        $("#eventsNumber").html(data.events.length);
        localStorage.user_eventsNumber = data.events.length;
        localStorage.user_eventsList = data.events;
      }
  });

  //retrieve user's friends
  $.ajax({
    url:"/getuserfriendsinfo",
    data:JSON.stringify(view_auth_data),
    type:"POST",
    contentType: 'application/json',
    success:function(data){
      $("#friendsNumber").html(data.friends.length);
      localStorage.user_friendsNumber = data.friends.length;
      localStorage.user_friendsList = data.friends;
    }  
  });

  //Just show the first tag for each post
  $(".tagsGroup").width("+=10");
  $(".tagsGroup a").hide();
  $('.tagHead').show();
  adjustTags();

  $(window).resize(function(){
    $.each($(".tagHead"),function(index,element){
      var tagsGroup = $(element).closest(".tagsGroup");
      var parentWidth = $('.tagsGroup').closest('.span2').width();
      var selfWidth = $(element).closest(".tagsGroup").width();
      $(element).closest(".tagsGroup").css('margin-left',parentWidth - selfWidth);
    });
  });

  $("#left").click(function(){
    $('#contentBody').toggleClass('cbp-spmenu-push-toright').removeClass('cbp-spmenu-push-toleft');
    $('#cbp-spmenu-s1').toggleClass('cbp-spmenu-open');
    $('#cbp-spmenu-s2').removeClass('cbp-spmenu-open');
    if($(this).attr("action") == "in"){
      $(this).find(".icon-chevron-right").remove();
      $(this).find("a").prepend("<i class = 'icon-chevron-left' style = 'margin-top:2%;'></i>");
      $(this).attr("action","out");
    }else{
      $(this).find(".icon-chevron-left").remove();
      $(this).find("a").append("<i class = 'icon-chevron-right' style = 'margin-top:2%;'></i>");
      $(this).attr("action","in");
    }
    return false;
  });

  $("#commonFriendsHead").click(function(){
    if($(this).find("i").hasClass("icon-chevron-right")){
      $(this).find("i").remove();
      $(this).prepend("<i class = 'icon-chevron-down icon-white' style = 'margin-top:3%;margin-right:2%;'></i>");
      $("#commonFriendsList").show();
    }else{
      $(this).find("i").remove();
      $(this).prepend("<i class = 'icon-chevron-right icon-white' style = 'margin-top:3%;margin-right:2%;'></i>");
      $("#commonFriendsList").hide();
    }
    return false;
  });

  $("#friendsHead").click(function(){
    if($(this).find("i").hasClass("icon-chevron-right")){
      $(this).find("i").remove();
      $(this).prepend("<i class = 'icon-chevron-down icon-white' style = 'margin-top:3%;margin-right:2%;'></i>");
      $("#friendsList").show();
    }else{
      $(this).find("i").remove();
      $(this).prepend("<i class = 'icon-chevron-right icon-white' style = 'margin-top:3%;margin-right:2%;'></i>");
      $("#friendsList").hide();
    }
    return false;
  });

  $("#eventsHead").click(function(){
    if($(this).find("i").hasClass("icon-chevron-right")){
      $(this).find("i").remove();
      $(this).prepend("<i class = 'icon-chevron-down icon-white' style = 'margin-top:3%;margin-right:2%;'></i>");
      $("#eventsList").show();
    }else{
      $(this).find("i").remove();
      $(this).prepend("<i class = 'icon-chevron-right icon-white' style = 'margin-top:3%;margin-right:2%;'></i>");
      $("#eventsList").hide();
    }
    return false;
  });

  $("#right").click(function(){
    $('#contentBody').toggleClass('cbp-spmenu-push-toleft').removeClass('cbp-spmenu-push-toright');
    $('#cbp-spmenu-s2').toggleClass('cbp-spmenu-open');
    $('#cbp-spmenu-s1').removeClass('cbp-spmenu-open');
    if($(this).attr("action") == "in"){
      $(this).find("a").html("Events & Friends<i class = 'icon-chevron-right' style = 'margin-top:2%;'></i>");
      $(this).attr("action","out");
    }else{
      $(this).find("a").html("<i class = 'icon-chevron-left' style = 'margin-top:2%;'></i>Events & Friends");
      $(this).attr("action","in");
    }
    if(flag_displaycommonfriend){
      flag_displaycommonfriend=false;
      $("#squaresWaveG-commonFriend").show();
    }//if flag
    if(flag_displayfriend){
      flag_displayfriend=false;
      $("#squaresWaveG-friend").show();
      //get user's friends information
      $.ajax({
             url:"/getuserfriendsinfo",
             data:JSON.stringify(view_auth_data),
             type:"POST",
             contentType: 'application/json',
             success:function(data){
             console.log("friends:");
             console.log(data);
             var friendsData = {};
              friendsData.session_key= localStorage.session_key;
              friendsData.uid=localStorage.uid;
              friendsData.uidList = data.friends;
              if(data.friends){
                localStorage.user_friendsNumber = data.friends.length;
              }else{
                localStorage.user_friendsNumber = 0;
              }
              $("#friendsNumber").html(localStorage.user_friendsNumber);
              $(".friendItem").remove();
              $("#friendsHead").find("font").html("("+localStorage.user_friendsNumber+")");
              if(common_friends.length == 0){
                 $("#squaresWaveG-commonFriend").hide();
                $("#commonFriendsList").append("<strong style = 'margin-left:15%;color:white;'>No mutual friend.</strong>");
              }else{
                $("#commonFriendsHead").find('font').html("("+localStorage.common_friends.length+")");
              }
              if(localStorage.user_friendsNumber == 0){
                $("#friendsList").append("<strong style = 'margin-left:15%;color:white;'>No friend.</strong>");
                $("#squaresWaveG-friend").hide();
              }else{
                  userlist(friendsData,'user');
              }
             }
      });
    }//if flag
    if(flag_displayevent){
     flag_displayevent=false;
     $("#squaresWaveG-event").show();
     //get user event
     $.ajax({
        url:"/getuserevents",
        data:JSON.stringify(view_auth_data),
        type:"POST",
        contentType: 'application/json',
        success:function(data){
          console.log("events:");
          console.log(data);
          var eventsData = {};
          eventsData.eidList = data.events;
          eventsData.session_key = localStorage.session_key;
          eventsData.uid = localStorage.uid;
          if(data.events){
            localStorage.user_eventsNumber = data.events.length;
          }else{
            localStorage.user_eventsNumber = 0;
          }
          $("#eventsNumber").html(localStorage.user_eventsNumber);
          $(".eventItem").remove();
          $("#eventsHead").find("font").html("("+localStorage.user_eventsNumber+")");
          if(localStorage.user_eventsNumber == 0){
            $("#eventsList").append("<strong style = 'margin-left:15%;color:white;'>No event.</strong>");
            $("#squaresWaveG-event").hide();
          }else{
            eventlist(eventsData);
          }
        } 
      });//ajax
    }//if flag    
  });
  
  $('body').delegate('.tagHead','mouseover',function(){
    var tagsGroup = $(this).closest(".tagsGroup");
    $(tagsGroup).children().slideDown( "fast");
    var parentWidth = $('.tagsGroup').closest('.span2').width();
    var selfWidth = $(this).closest(".tagsGroup").width();
    $(this).closest(".tagsGroup").css('margin-left',parentWidth - selfWidth);
    setTimeout(function(){
      $(tagsGroup).children("a:not(:first-child)").slideUp( "fast",function(){
        var parentWidth = $('.tagsGroup').closest('.span2').width();
        var selfWidth = $(this).closest(".tagsGroup").width();
        $(this).closest(".tagsGroup").css('margin-left',parentWidth - selfWidth);
      });
      },3000);
    });
  
  $('body').delegate('.replyLink','click',function(){
    var replier = $(this).prev().find('.replier').first();
    var textarea = $(this).closest('.postRoot').find('textarea').first();
    textarea.attr({replyToName:replier.attr('name'),replyToUid:replier.attr('uid')});
    textarea.focus();
    return false;
  });
  
  $('body').delegate('.removereply','click',function(){
    $("#removeReplyConfirm").attr("postId",$(this).closest(".postRoot").attr("id"));
  });

  $("#removeReplyConfirm").click(function(){
      $("#floatingBarsG-removeReply").show();
      $("#removeReplyConfirm").attr("disabled","disabled");
      var postId = $(this).attr("postId");
      var context = $("#"+postId);
      var data = auth_data;
      data.id = context.attr('posterUid');
      data.eid = context.attr('postEid');
      data.pid = context.attr('postPid');
      var reply = context.find('.replyBody');
      var repliesArea = context.find('.repliesArea');
      data.rid = reply.attr("rid");
      $.ajax({
            url:"/deletereply",
            data:JSON.stringify(data),
            type:"POST",
            contentType: 'application/json',
            success:function(data){
              console.log(data);
              if(data.status=="successful"){
                if(context.attr("repliesNumber") == 1){
                  repliesArea.remove();
                }else{
                  reply.remove();
                  var repliesNumber = parseInt(context.attr("repliesNumber"));
                  context.attr("repliesNumber",(repliesNumber - 1));
                  if(repliesNumber == 2){
                    repliesArea.find(".accordion-toggle").html('1 reply');
                  }else{
                    repliesArea.find(".accordion-toggle").html((repliesNumber - 1)+' replies');
                  }
                }
              }
              $("#removeConfirm").removeAttr("disabled");
              $("#floatingBarsG-removeReply").hide();
              $("#removeCancel").trigger("click");
            }
      });
    return false;
  });

  $('body').delegate('.replyInput','focus',function(){
    console.log("focus");
    var replyToName = $(this).attr("replyToName");
    $(this).attr('placeholder','Reply to '+replyToName+":");
    return false;
  });
  
  $('body').delegate('.replyInput','keyup',function(){
    console.log("enabled");
    if($(this).val() == ""){
    $(this).closest('.postRoot').find('.replySubmit').attr('disabled','disabled');
    }else{
    $(this).closest('.postRoot').find('.replySubmit').removeAttr('disabled');
    }
  });
  
  $('body').delegate('.replySubmit','click',function(){
    //TODO: choose reply target
    var data = auth_data;
    data.replier_name = localStorage.usernickname;
    var context = $(this).closest('.postRoot');
    data.replyContent = $(this).closest('.span11').children('textarea').first().val();
    data.posterUid = parseInt($(this).closest('.span11').children('textarea').first().attr('replyToUid'));
    data.replyToUid = data.posterUid;
    data.postEid = "0";
    data.postPid = context.attr('postPid');
    data.replyToName = $(this).closest('.span11').children('textarea').first().attr("replyToName");
    data.visibility = 0;
    $.ajax({
          url:"/createreply",
          data:JSON.stringify(data),
          type:"POST",
          contentType: 'application/json',
          success:function(result){
          if(result.status = "sccessful"){
          console.log(result);
          var reply = {};
          reply.replyto_name = data.replyToName;
          reply.replyto_uid = data.replyToUid;
          reply.replier_name = data.replier_name;
          reply.replier_uid = data.uid;
          reply.replyContent = data.replyContent;
          reply.date = getCurrentDate();
          reply.time = getCurrentTime();
          if(context.attr("repliesNumber") == 0){
          var id = context.attr("posterUid")+context.attr("postEid")+context.attr("postPid");
          context.find(".shareButtons").after(
                '<div class = "row-fluid repliesArea" style = "margin-top:10px;" repliesNumber = '+0+'>'+
                '<div class="accordion" id="reply'+id+'" style = "background-color:white;margin-bottom: 0px;">'+
                '<div class="accordion-group" style = "border:none;">'+
                '<div class="accordion-heading" style = "text-align: center;">'+
                '<a class="accordion-toggle" data-toggle="collapse" data-parent="#reply'+id+'" href="#collapse'+id+'">'+
                '0 reply'+
                '</a>'+
                '</div>'+
                '<div id = "collapse'+id+'" class="accordion-body collapse">'+
                '<div class="accordion-inner">'+
                '<ul class ="scroller" style = "max-height:250px;overflow: scroll;">'+
                '</ul>'+
                '</div>'+
                '</div>'+
                '</div>'+
                '</div>'+
                '</div>'
            );
          }
          var scroller = context.find('ul.scroller').first();
          scroller.append(renderReply(reply));
          context.attr("repliesNumber",parseInt(context.attr("repliesNumber"))+1);
          scroller.scrollTop(scroller.prop('scrollHeight'));
          //console.log(scroller.prop('scrollHeight'));
          var replyNumber = context.attr("repliesNumber");
          if(replyNumber == 1){
              context.find('.accordion-toggle').first().html(replyNumber+" reply");
          }else{
              context.find('.accordion-toggle').first().html(replyNumber+" replies");
          }
          context.find('textarea').val("");
          }
          }
    });            
  });
  
  $("body").delegate(".userName", 'click', function() {
    if($(this).attr("uid") != localStorage.uid){
      $(this).css("cusor","pointer");
      localStorage.friendUid  = $(this).attr("uid");
      localStorage.friendName = $(this).attr("name");
      window.location = "/user";
    }
    return false;
  });

  $("body").delegate(".friend_small_avarta",'click',function(){
    localStorage.friendUid  = $(this).parent().attr("uid");
    localStorage.friendName = $(this).parent().attr("name");
    window.location = "/user";
    return false;
  });

  $("body").delegate(".eventName", 'click', function() {
    $(this).css("cusor","pointer");
    localStorage.eid = $(this).attr("eid");
    localStorage.ename = $(this).attr("name");
    window.location = "/event";
    return false;
  });

  $("body").delegate(".event_small_avarta",'click',function(){
    localStorage.eid  = $(this).parent().attr("eid");
    localStorage.ename = $(this).parent().attr("ename");
    window.location = "/event";
    return false;
  });

  $("body").delegate(".eventItem", 'click', function() {
   localStorage.eid  = $(this).parent().attr("eid");
   localStorage.ename = $(this).parent().attr("ename");
   window.location = "/event";
  });
  $("body").delegate(".friendItem", 'click', function() {
   localStorage.friendUid  = $(this).parent().attr("uid");
   localStorage.friendName = $(this).parent().attr("name");
   window.location = "/user";
   return false;
  });

  $('body').delegate('.replyCancel','click',function(){
                     var post = $(this).closest('.postRoot');
                     var textarea = post.find('textarea').first();
                     textarea.attr({replyToName:post.attr("posterName"),replyToUid:post.attr('uid'),placeholder:"Add Comments here..."});
                     return false; 
                     });
  
  $(document).on('click', ".posttag", function() {
                 localStorage.search_tag_content = $(this).attr("tag");
                 localStorage.search_tag_option = "post";
                 window.location = "/search";
                 return false;
                 });
  $(document).on('click', ".eventtag", function() {
                 localStorage.search_tag_content = $(this).attr("tag");
                 localStorage.search_tag_option = "event";
                 window.location = "/search";
                 return false;
                 });
  $(document).on('click', ".usertag", function() {
                 localStorage.search_tag_content = $(this).attr("tag");
                 localStorage.search_tag_option = "user";
                 window.location = "/search";
                 return false;
                 });

  $(document).on('click','#homeNav',function(){
    window.location = "/home";
    return false;
  });

  $(document).on('click', "#searchNav", function() {
    localStorage.search_tag_content = "";
    localStorage.search_tag_option = "";
    window.location = "/search";
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

  $("#defriendConfirm").click(function(){
    $("#floatingBarsG-defriend").show();
    $(this).attr("disabled","disabled");
    $("#defriendCancel").attr("disabled","disabled");
    var data = {};
    data = auth_data;
    data.id = localStorage.friendUid;
    $.ajax({
      url:"/deletefriend",
          data:JSON.stringify(data),
          type:"POST",
          contentType: 'application/json',
          success:function(result){
            $(this).removeAttr("disabled");
            $("#defriendCancel").removeAttr("disabled");
            $("#floatingBarsG-defriend").hide();
            $("#defriendModal").modal("hide");

          }
    });
  });

  $("#loadMoreButton").click(function(){
    getMorePosts();
    return false;
  });

  $("#notification").hover(function(){
    $(this).tooltip('show');
    console.log("first");
    setTimeout(function(){$('#notification').tooltip('hide')},2000);
  });

  //Handle notifications behaviors
  $('body').delegate('.notificationItem','click',function(){
    if($(this).hasClass('unread')){
      $(this).removeClass('unread');
    }
    return false;
  });

  $('body').delegate('.friendResponse','click',function(){
    console.log("read friend response");
    flag_displayfriend = true;
    var notification = $(this).closest('.notificationItem');
    if(notification.prev() && notification.prev().hasClass("divider")){
        notification.prev().remove();
    };
    notification.remove();
    removeNotification();
    return false;
  });

  $('body').delegate('.approveFriendRequest','click',function(){
    console.log("friend request processing");
    var notification = $(this).closest('.notificationItem');
    var data = auth_data;
    data.subType = 0;
    data.seq = notification.attr("seqNo");
    data.n_uid = notification.attr("uid");
    data.eid = notification.attr("eid");
    data.pid = notification.attr("pid");
    data.action = 0;
    $.ajax({
      url:"/responsetonotification",
      data:JSON.stringify(data),
      type:"POST",
      contentType: 'application/json',
      success:function(result){
        if(result.status == "successful"){
          flag_displayfriend = true;
          if(notification.prev() && notification.prev().hasClass("divider")){
              notification.prev().remove();
          };
          notification.remove();
        }
      }
    });
    removeNotification();
  });
  $('body').delegate('.rejectFriendRequest','click',function(){
    console.log("friend request processing");
    var notification = $(this).closest('.notificationItem');
    var data = auth_data;
    data.subType = 0;
    data.seq = notification.attr("seqNo");
    data.n_uid = notification.attr("uid");
    data.eid = notification.attr("eid");
    data.pid = notification.attr("pid");
    data.action = 1;
    $.ajax({
      url:"/responsetonotification",
      data:JSON.stringify(data),
      type:"POST",
      contentType: 'application/json',
      success:function(result){
        if(result.status == "successful"){
          console.log(notification.prev());
          if(notification.prev() && notification.prev().hasClass("divider")){
              notification.prev().remove();
          };
          notification.remove();
        }
      }
    });
    removeNotification();
  });

  $('body').delegate('.eventResponse','click',function(){
    console.log("read event response");
    flag_displayevent = true;
    if(notification.prev() && notification.prev().hasClass("divider")){
        notification.prev().remove();
    };
    notification.remove();
    removeNotification();
    return false;
  });

  $('body').delegate('.approveEventJoinRequest','click',function(){
    console.log("event request processing");
    var notification = $(this).closest('.notificationItem');
    var data = auth_data;
    data.subType = 1;
    data.seq = notification.attr("seqNo");
    data.n_uid = notification.attr("uid");
    data.eid = notification.attr("eid");
    data.pid = notification.attr("pid");
    data.action = 0;
    $.ajax({
      url:"/responsetonotification",
      data:JSON.stringify(data),
      type:"POST",
      contentType: 'application/json',
      success:function(result){
        if(result.status == "successful"){
          flag_displayevent = true;
          if(notification.prev() && notification.prev().hasClass("divider")){
              notification.prev().remove();
          };
          notification.remove();
        }
      }
    });
    removeNotification();
  });
  $('body').delegate('.rejectEventJoinRequest','click',function(){
    console.log("event request processing");
    var notification = $(this).closest('.notificationItem');
    var data = auth_data;
    data.subType = 1;
    data.seq = notification.attr("seqNo");
    data.n_uid = notification.attr("uid");
    data.eid = notification.attr("eid");
    data.pid = notification.attr("pid");
    data.action = 1;
    $.ajax({
      url:"/responsetonotification",
      data:JSON.stringify(data),
      type:"POST",
      contentType: 'application/json',
      success:function(result){
        if(result.status == "successful"){
          if(notification.prev() && notification.prev().hasClass("divider")){
              notification.prev().remove();
          };
          notification.remove();
        }
      }
    });
    removeNotification();
  });

  $("#timeoutButton").click(function(){
    localStorage.clear();
    window.location = "/";
    return false;
  });

  $("#createPost").remove();
});
