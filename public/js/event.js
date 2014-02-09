if(!localStorage.uid){
  window.location = "/";
}
var pidset = [];
var loadOrder = 0;
var insertOrder = 0;
var loadingFlag = true;
var postCounter = 0;
var view_eid = localStorage.eid;
var flag_displaymember=true;
var isMember = false;

$(document).ready(function(){
  var auth_data = {};
  auth_data.session_key = localStorage.session_key;
  auth_data.uid = localStorage.uid;
 
  //update page title 
  $("title").first().html(localStorage.ename);
  $("#userNameLink").text(localStorage.usernickname);

  $(".bootstrap-tagsinput").find("input").attr("placeholder","Add").attr("size",8);
  $(".bootstrap-tagsinput").find("input").limit('20');
  $('body').delegate('#postArea','keyup',function(){
    if($(this).val() == ""){
      $("#postSubmit").attr('disabled','disabled');
    }else{
     $("#postSubmit").removeAttr('disabled');
    }
  });

  $("#event_schedule").click(function(){
    localStorage.schedulingId = localStorage.eid;
    localStorage.schedulingType = "event";
    window.location = "/scheduling";
  });

  //set profile events and friends number
  $("#friendsNumber").html(localStorage.friendsNumber);
  $("#eventsNumber").html(localStorage.eventsNumber);
 
  //set profile
  var view_auth_data = auth_data;
  view_auth_data.eid = view_eid;
  $.ajax({
   url:'/geteventinfo',
   data:JSON.stringify(view_auth_data),
   type:"POST",
   contentType:"application/json",
   success:function(data){
   localStorage.ename = data.name;
   localStorage.ecreator = data.creator;
   localStorage.edescription = data.description;
   localStorage.erating = data.rating;
   localStorage.etags = data.tags;
   var tagsList = data.tags;
   localStorage.ecity = data.city;
   console.log(tagsList);
   for(var index = 0; index <  Math.min(4,tagsList.length); index++){
   $($("#subNavBar").find("li")[index+1]).html('<a class = "eventtag" href="#" tag = '+tagsList[index]+'>'+tagsList[index]+'</a>');
   }
   $("#name").html(localStorage.ename);
   $("#creator").html(localStorage.ecreator);
   $("#description").html(localStorage.description);
   if(tagsList == ""){
   $('#tags').append("<font>None</font>");
   }else{
      $.each(localStorage.etags.split(','),function(index,element){
        $('#tags').append("<span class='label label-info' style = 'margin-left:5px;'>"+element+"</span>");
      });
   }
   $("#rating").html(localStorage.erating);
   $("#city").html(localStorage.ecity);
   }
  });

  $("#left").html('<a href="#">Settings<i class = "icon-chevron-right" style = "margin-top:2%;"></i></a>');
  $("#right").html('<a href="#"><i class = "icon-chevron-left" style = "margin-top:2.5%;"></i>Members</a>');

  var eventAvartaData = {};
  eventAvartaData.session_key = localStorage.session_key;
  eventAvartaData.uid = localStorage.uid;
  eventAvartaData.time = getCurrentTime();
  eventAvartaData.date = getCurrentDate();
  
  //get event avarta
  $.ajax({
    url:"/geteventavarta",
    data:JSON.stringify(newsData),
    type:"POST",
    contentType: 'application/json',
    success:function(data){
      console.log(data);
      localStorage.event_small_avarta = data.avarta;
      $("#navi_avarta").attr("src",data.avarta);
      $("#profileAvarta").attr("src",data.avarta);
    }
  });

  //get event posts
  var newsData = view_auth_data;
  newsData.option = 0;
  $.ajax({
   url:"/geteventpost",
   data:JSON.stringify(newsData),
   type:"POST",
   contentType: 'application/json',
   success:function(data){
     console.log("News:");
     console.log(data);
     viewpost(data.pidsets,postCounter);
   }
  });

  //get event members
  $.ajax({
    url:"/geteventmembers",
    data:JSON.stringify(view_auth_data),
    type:"POST",
    contentType: 'application/json',
    success:function(data){
      $("#membersNumber").html(data.members.length);
      for(var i = 0; i < data.members.length;i++){
        if(data.members[i] == localStorage.uid){
          isMember = true;
          break;
        }
      }
      if(!isMember){
        $("#event_manage").hide();
        $("#profileEdit").hide();
        $("#createPost").hide();
        $("#profileModal").find(".modal-footer").hide();
      }
    }
  });
  
  //Adjust posting Area width
  $('#postArea').css({'width':$('#postModal').width()*0.9,'height':"80px"});

  //Just show the first tag for each post
  $(".tagsGroup").width("+=10");
  $(".tagsGroup a").hide();
  $('.tagHead').show();
  adjustTags();

  $(window).resize(function(){
    $.each($(".tagHead"),function(index,element){
      var tagsGroup = $(element).closest(".tagsGroup");
      $(tagsGroup).children().slideDown( "fast");
      var parentWidth = $('.tagsGroup').closest('.span2').width();
      var selfWidth = $(element).closest(".tagsGroup").width();
      $(element).closest(".tagsGroup").css('margin-left',parentWidth - selfWidth);
    });
  });

  $("#profileEdit").click(function(){
      var body = $("#profileModal").find(".modal-body");
      $(".profileBody").hide();
      $(".updateBody").show();
      renderEventUpdate();
      console.log($(".bootstrap-tagsinput").find("input"));
      $.each($(".bootstrap-tagsinput").find("input"),function(index,element){
             $(element).limit(20);
             });
      body.css("max-height",500);
      $(this).hide();
      return false;
  });

  $("#profileConfirm").click(function(){
    $("#floatingBarsG-update").show();
    //TO DO: send update self information request
    var realname = $('#inputName').val();
    var city = $('#inputCity').val();
    var etags = $('#inputTags').val();
    var modified_tags = [];
    var proceed = true;
    if(realname == ""){
      $('#inputName').closest('.control-group').children('label').html('<strong>Name </strong><font color ="#B94A48">*required</font>');
      $('#inputName').css('border-color','#B94A48');
      proceed = false;
    }else{
      $('#inputName').closest('.control-group').children('label').html('<strong>Name<strong>');
      $('#inputName').css('border-color','#CCC');
    }
    if(city == ""){
      $('#inputCity').closest('.control-group').children('label').html('<strong>Name </strong><font color ="#B94A48">*required</font>');
      $('#inputCity').css('border-color','#B94A48');
      proceed = false;
    }else{
      $('#inputCity').closest('.control-group').children('label').html('<strong>Name<strong>');
      $('#inputCity').css('border-color','#CCC');
    }
    if(etags.indexOf(",")>-1)
        modified_tags = $('#inputTags').val().split(",");
    else
        modified_tags.push($('#inputTags').val());
    //var tags = $('#inputPost').tagsinput('items');
    if(proceed){
        var data = {};
        data.uid = localStorage.uid;
        data.session_key =localStorage.session_key;
        data.eid = view_eid;
        data.name = realname;
        data.city = city;
        data.add_tag = [];
        data.delete_tag = [];
        for(var i=0;i<tags.length;i++){
            var flag=false;
            for(var j=0;j<modified_tags.length;j++){
                if(tags[i]==modified_tags[j]){
                    flag=true;
                    break;
                }//if
            }//for j
            if(!flag)
                data.delete_tag.push(tags[i]);
        }
        for(var i=0;i<modified_tags.length;i++){
            var flag=false;
            for(var j=0;j<tags.length;j++){
                if(tags[j]==modified_tags[i]){
                    flag=true;
                    break;
                }//if
            }//for j
            if(!flag){
                data.add_tag.push(modified_tags[i]);
            }
        }
        $.ajax({
            url:'/updateevent',
            data:JSON.stringify(data),
            type:'POST',
            contentType: 'application/json',
            success:function(data){
                if(data.status == "successful"){
                    //TO DO: handle the returned data
                    //update changes to localStorage
               localStorage.ename=realname;
               localStorage.city=city;
               localStorage.etags="";
               localStorage.etags=etags;
               $(".profileBody").show();
               $(".updateBody").hide();
               renderEventProfile();
               $("#floatingBarsG-update").hide();
                }
            }
        });
    }
    return false;
  });

  $("#profileCancel").click(function(){
      $(".profileBody").show();
      $(".updateBody").hide();
      return false;
  });

  $('#postSubmit').click(function(){
    $(this).attr("disabled","disabled");
    var content = $('#postArea').val();
    var tags = $('#postTags').tagsinput('items');
    if(content != ""){
    var eid = view_eid;
    var visibility = 0;
    var tags = tags;
    var data = {};
    var d = new Date();
    data.content = content;
    data.eid = eid;
    data.visibility = visibility;
    data.tags = tags;
    data.date = d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();
    data.time = d.getHours()*10000+d.getMinutes()*100;+d.getSeconds();
    data.session_key = localStorage.session_key;
    data.uid = localStorage.uid;
    $("#floatingBarsG-post").show();
    createPost(data);
     }
  });
$("body").delegate(".userName", 'click', function() {
  $(this).css("cusor","pointer");
  localStorage.friendUid  = $(this).attr("uid");
  localStorage.friendName = $(this).attr("name");
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

$("body").delegate(".memberItem", 'click', function() {
  $(this).css("cusor","pointer");
  localStorage.friendUid  = $(this).attr("uid");
  localStorage.friendName = $(this).attr("name");
  window.location = "/user";
  return false;
});

  $("#left").click(function(){
   $('#contentBody').toggleClass('cbp-spmenu-push-toright').removeClass('cbp-spmenu-push-toleft');
   $('#cbp-spmenu-s1').toggleClass('cbp-spmenu-open');
   $('#cbp-spmenu-s2').removeClass('cbp-spmenu-open');
   if($(this).attr("action") == "in"){
      $(this).find("a").html("<i class = 'icon-chevron-left' style = 'margin-top:2%;'></i>Settings");
      $(this).attr("action","out");
    }else{
      $(this).find("a").html("Settings<i class = 'icon-chevron-right' style = 'margin-top:2%;'></i>");
      $(this).attr("action","in");
    }
   });

  $("#right").click(function(){
    $('#contentBody').toggleClass('cbp-spmenu-push-toleft').removeClass('cbp-spmenu-push-toright');
    $('#cbp-spmenu-s2').toggleClass('cbp-spmenu-open');
    $('#cbp-spmenu-s1').removeClass('cbp-spmenu-open');
    if($(this).attr("action") == "in"){
      $(this).find("a").html("Members<i class = 'icon-chevron-right' style = 'margin-top:2.5%;'></i>");
      $(this).attr("action","out");
    }else{
      $(this).find("a").html("<i class = 'icon-chevron-left' style = 'margin-top:2.5%;'></i>Members");
      $(this).attr("action","in");
    }
    if(flag_displaymember){
    //get user's friends information
    flag_displaymember=false;
    $("#squaresWaveG-right").show();                    
    $.ajax({
           url:"/geteventmembers",
           data:JSON.stringify(view_auth_data),
           type:"POST",
           contentType: 'application/json',
           success:function(data){
           console.log("friends:");
           console.log(data);
           var membersData = {};
           membersData.uidList = data.members;
           membersData.session_key = localStorage.session_key;
           membersData.uid = localStorage.uid;
           if(membersData.uidList.length == 0){
              $("#membersList").append("<strong style = 'margin-left:15%;color:white;'>No member yet.</strong>");
              $("#squaresWaveG-right").hide();
            }else{
              userlist(membersData,"event");
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
                     var data = {};
                     data.session_key = auth_data.session_key;
                     data.uid = auth_data.uid;
                     data.replier_name = localStorage.usernickname;
                     var context = $(this).closest('.postRoot');
                     data.replyContent = $(this).closest('.span11').children('textarea').first().val();
                     data.posterUid = parseInt($(this).closest('.span11').children('textarea').first().attr('replyToUid'));
                     data.replyToUid = data.posterUid;
                     data.postEid = context.attr('postEid');
                     data.postPid = context.attr('postPid');
                     data.replyToName = context.find('a.posterName').first().text();
                     data.visibility = 0;
                     $.ajax({
                            url:"/createreply",
                            data:JSON.stringify(data),
                            type:"POST",
                            contentType: 'application/json',
                            success:function(result){
                            //console.log(result);
                            if(result.status = "sccessful"){
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
                            //console.log(context.find(".shareButtons"));
                            context.find(".shareButtons").after(
                                                                '<div class = "row-fluid" style = "margin-top:10px;">'+
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
                            var replyNumber = parseInt(context.find('.accordion-toggle').first().text().replace('replies','').replace(/[^\d]/g,""));
                            context.find('.accordion-toggle').first().html((replyNumber+1)+" replies");
                            context.find('textarea').val("");
                            }
                            }
                            });
                     
                     });
  $('body').delegate('.replyCancel','click',function(){
                     var post = $(this).closest('.postRoot');
                     var textarea = post.find('textarea').first();
                     textarea.attr({replyToName:post.attr("posterName"),replyToUid:post.attr('uid'),placeholder:"Add Comments here..."});
                     return false; 
                     });

  //TODO: notifications

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
  $(document).on('click', "#searchButton", function() {
                 localStorage.search_tag_content = "";
                 localStorage.search_tag_option = "";
                 window.location = "/search";
                 return false;
                 });
  $("#navilogout").click(function(){
    $.ajax({
      url:"/logout",
      data:JSON.stringify(auth_data),
      type:"POST",
      contentType: 'application/json',
      success:function(result){
        if(result.status == "successful"){
          localStorage.clear();
          socket.emit("logout");
          window.location = "/";
        }else{
          alert("fail to logout!");
        }
      }
    });
  });
  $("#naviDropdown").remove();
  $("#quitConfirm").click(function(){
    $("#floatingBarsG-quit").show();
    var data = {};
    data.eid = localStorage.eid;
    data.uid = localStorage.uid;
    data.session_key = localStorage.session_key;
    // $.ajax({
    //   url:"/quitevent",
    //   data:JSON.stringify(data),
    //   type:"POST",
    //   contentType: 'application/json',
    //   success:function(result){
    //     if(result.status = "sccessful"){
    //       $("#floatingBarsG-quit").show();
    //       window.location = "/home";
    //     }
    //   }
    // });
    window.location = "/home";
    return false;
  });

  $("#event_manage").click(function(){
     window.location = "/eventmanage";
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
      var friendId = $(this).closest(".chat-window").attr('id').replace("chat","");
      console.log("id length:"+friendId.length);
      if(friendId.length > 7){
          console.log("event chat: "+friendId+" "+content);
          socket.emit("get event chat",localStorage.session_key, localStorage.uid, 0, friendId, content);
      }else{
          console.log("friend chat: "+friendId+" "+content);
          socket.emit("get user chat",localStorage.session_key, localStorage.uid, 0, friendId, content);
      }
      return false;
    }
  });
});