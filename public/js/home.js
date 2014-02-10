if(!localStorage.uid){
  window.location = "/";
}
var pidset = []; 
var loadOrder = 0;
var postOrder = 0;
var loadingFlag = true;
var postCounter = 0;
var chatBoxNumber = 0;
var flag_displayfriend=true;
var flag_displayevent=true; 
localStorage.common_friends = "";

$(document).ready(function(){ 
  //set authentication data
  var auth_data = {};
  auth_data.session_key = localStorage.session_key;
  auth_data.uid = localStorage.uid;

  //update page title
  $("title").first().html("Home-"+localStorage.usernickname);

  $("#right").find("a").html("<i class = 'icon-chevron-left' style = 'margin-top:2%;'></i>Chats");

  $(".bootstrap-tagsinput").find("input").attr("placeholder","Add").attr("size",8);
  $(".bootstrap-tagsinput").find("input").limit('14');
  $('body').delegate('#postArea','keyup',function(){
    if($(this).val() == ""){
      $("#postSubmit").attr('disabled','disabled');
    }else{
     $("#postSubmit").removeAttr('disabled');
    }
  });

  //load tags
  renderSubNavBar();

  //update the user name in the navbar
  $("#left a").prepend('<img class = "selfProfileAvarta" src = "#" style = "width:22px;height:22px;border-radius:11px;">&nbsp;<strong id="userNameLink">user</strong>');
	$("#userNameLink").text(localStorage.usernickname);

  //set self avarta data
	var selfAvartaData = {};
	selfAvartaData.session_key = localStorage.session_key;
	selfAvartaData.uid = localStorage.uid;

  //update self profile information
  $("#profileName").html(localStorage.username);
  $("#profileUid").html(localStorage.uid);
  $("#profileUid").attr("uid",localStorage.uid);
  $("#nickname").html(localStorage.usernickname);
  $("#city").html(localStorage.city);
  $("#country").html(localStorage.country);
  if(localStorage.usertags && localStorage.usertags != ""){
    $.each(localStorage.usertags.split(','),function(index,element){
      $('#tags').append("<span class='label label-info' style = 'margin-left:5px;'>"+element+"</span>");
    });
  }else{
    $('#tags').append("<font>None</font>");
  }
  $("#birthday").html(localStorage.birthday);
  console.log("gender "+localStorage.gender);
  switch(localStorage.gender){
    case "0":
      $("#gender").html("Female");
    break;
    case "1":
      $("#gender").html("Male");
    break;
    default:
      $("#gender").html("Secret");
    break;
  }
  $("#state").html(localStorage.state);
  if(localStorage.hiddentags && localStorage.hiddentags != ""){
    $.each(localStorage.hiddentags.split(','),function(index,element){
      $('#hidden_tags').append("<span class='label label-info' style = 'margin-left:5px;'>"+element+"</span>");
    });
  }else{
    $('#hidden_tags').append("<font>None</font>");
  }

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
      var parentWidth = $('.tagsGroup').closest('.span2').width();
      var selfWidth = $(element).closest(".tagsGroup").width();
      $(element).closest(".tagsGroup").css('margin-left',parentWidth - selfWidth);
    });
  });

  $("#profileEdit").click(function(){
    var body = $("#profileModal").find(".modal-body");
    $(".profileBody").hide();
    $(".updateBody").show();
    renderUpdate();
    console.log($(".bootstrap-tagsinput").find("input"));
    $.each($(".bootstrap-tagsinput").find("input"),function(index,element){
      $(element).limit(20);
    });
    body.css("max-height",500);
    $(this).hide();
    return false;
  });

  $("#editAvarta").click(function(){
    $("#profileModal").modal("hide");
  });

  $("#uploadCancel").click(function(){
    $("#uploadModal").modal("hide");
    $("#profileModal").modal("show");
    return false;
  });

  $("#fileupload").fileupload({
    url:"/uploadavarta",
    type:"POST",
    dataType:"json",
    maxFileSize:10000000,
    acceptFileTypes: /\.(gif|jpe?g|png)$/i,
    formData: {
      uid: localStorage.uid
    },
    progress:function(e, data){
        var progress = parseInt(data.loaded / data.total * 100, 10);
        $('#progress .bar').css(
            'width',
            progress + '%'
        );
    },
    add: function(e, data){
        data.files[0].name = localStorage.uid+".jpg";
        console.log(data);
        data.submit().success(function(result, textStatus, jqXHR){
          console.log("upload feedback:");
          console.log(result);
          if(result.status == "successful"){
            setTimeout(function(){
              $('#progress').hide();
              $('#notice').html("finished!").css("color",'green');
              $('#progress .bar').css(
                  'width',
                  '0%'
              );
              //TO DO: use ajax to save image to database
              var filename = data.files[0].name;
              var avartaData = auth_data;
              avartaData.avarta = filename;
              $.ajax({
                url:'/updateselfavarta',
                data:JSON.stringify(avartaData),
                type:'POST',
                contentType: 'application/json',
                success:function(result){
                  if(result.status == "successful"){
                    $.ajax({
                      url:'/getselfavarta',
                      data:JSON.stringify(auth_data),
                      type:'POST',
                      contentType: 'application/json',
                      success:function(avarta){
                        console.log("new avarta");
                        console.log(avarta);
                        if(avarta.status == "successful"){
                          localStorage.self_small_avarta = avarta.avarta;
                          $(".selfProfileAvarta").attr("src",avarta.avarta);
                          setTimeout(function(){
                            $('#notice').html("").css("color","black");
                            $('#uploadCancel').removeAttr("disabled");
                            $('#fileupload').removeAttr("disabled");
                            $('#uploadModal').modal("hide");
                            $('#profileModal').modal("show");
                          },3000);
                        }
                      }
                    });
                  }else{
                    console.log(result);
                  }
                }
              });
            },1000);
          }
        }).error(function(jqXHR, textStatus, errorThrown){
          $('#uploadCancel').removeAttr("disabled");
          $('#progress').hide();
          $('#progress .bar').css(
              'width',
              '0%'
          );
          $('#notice').show().html("failed!").css("color","#B94A48");
        });
    },
    start: function(e, data){
        $('#progress').show();
        $('#notice').show().html("uploading...");
        $('#uploadCancel').attr("disabled","disabled");
        $('#fileupload').attr("disabled","disabled");
    },
    fail:function(e, data){
        $('#notice').show().html("failed!").css("color","#B94A48");
        $('#uploadCancel').removeAttr("disabled");
        $('#fileupload').removeAttr("disabled");
        $('#progress .bar').css(
            'width',
            '0%'
        );
    },
    done:function(e,data){  
        console.log("upload done.");    
    }
  });

  $("#profileConfirm").click(function(){
    $("#profileConfirm").attr("disabled","disabled");
    $("#profileCancel").attr("disabled","disabled");
    $("#floatingBarsG-update").show();
    //TO DO: send update self information request
    var realname = $('#inputName').val();
    var nickname = $('#inputNickName').val();
    var birthday = $('#inputBirthday').val();
    var gender = $('#inputGender').val();
    var tags = localStorage.usertags.split(",");
    var modified_tags = [];
    var proceed = true;
    if(realname == ""){
      $('#inputName').closest('.control-group').children('label').html('<strong>Name </strong><font color ="#B94A48">*required</font>');
      $('#inputName').css('border-color','#B94A48');
      proceed = false;
    }else{
      $('#inputName').closest('.control-group').children('label').html('Name<font style = "color:red;">*</font>');
      $('#inputName').css('border-color','#CCC');
    }
    if(nickname == ""){
      $('#inputNickName').closest('.control-group').children('label').html('<strong>NickName </strong><font color ="#B94A48">*required</font>');
      $('#inputNickName').css('border-color','#B94A48');
      proceed = false;
    }else{
      $('#inputNickName').closest('.control-group').children('label').html('Nickname<font style = "color:red;">*</font>');
      $('#inputNickName').css('border-color','#CCC');
    }
    if(birthday == ""){
      $('#inputBirthday').closest('.control-group').children('label').html('<strong>Birthday </strong><font color ="#B94A48">*required</font>');
      $('#inputBirthday').css('border-color','#B94A48');
      proceed = false;
    }else{
      $('#inputBirthday').closest('.control-group').children('label').html('Birthday<font style = "color:red;">*</font>');
      $('#inputBirthday').css('border-color','#CCC');
    }
    if(tags.length > 0){
        modified_tags = $('#inputTags').val().split(",");
    }else if($('#inputTags').val().trim() != ""){
        modified_tags.push($('#inputTags').val());
    }
    //format date
    var bits = birthday.split('-');
    birthday = bits[0] + bits[1] + bits[2];
    if(proceed){
        var data = {};
        data.uid = localStorage.uid;
        data.session_key =localStorage.session_key;
        data.name = realname;
        data.birthday = birthday;
        data.nickname = nickname;
        data.gender = gender;
        data.city = "Singapore";
        data.state = "Singapore";
        data.country = "Singapore";
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
        console.log("data gender",data.gender);
        $.ajax({
            url:'/updatesuserinfo',
            data:JSON.stringify(data),
            type:'POST',
            contentType: 'application/json',
            success:function(data){
                if(data.status == "successful"){
                    //TO DO: handle the returned data
                    //update changes to localStorage
                    console.log("update data");
                    console.log(data);
                    localStorage.username = realname;
                    localStorage.usernickname = nickname;
                    localStorage.raw_birthday = birthday;
                    localStorage.gender = gender;
                    console.log("local gender",localStorage.gender);
                    localStorage.usertags = modified_tags;
                    renderSubNavBar();
                    //localStorage.honors = data.honors;
                    localStorage.gender = gender;
                    $(".profileBody").show();
                    $(".updateBody").hide();
                    renderProfile();
                    $("#floatingBarsG-update").hide();
                    $("#profileConfirm").removeAttr("disabled");
                    $("#profileCancel").removeAttr("disabled");
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

  //retrieve self avarta
	$.ajax({
	 	url:'/getselfavarta',
	 	data:JSON.stringify(selfAvartaData),
	 	type:"POST",
	 	contentType:"application/json",
	 	success:function(data){
      localStorage.self_small_avarta = data.avarta;
      $(".selfProfileAvarta").attr("src",data.avarta);
    }
	});

	//retrieve self posts
  var newsData = {};
  newsData.session_key = localStorage.session_key;
  newsData.uid = localStorage.uid;
	newsData.option = 1;
  var date = new Date();
  var timeoffset = date.getTimezoneOffset();
	$.ajax({
		url:"/getusernews",
		data:JSON.stringify(newsData),
		type:"POST",
		contentType: 'application/json',
		success:function(data){
			console.log("News:");
			console.log(data);
      viewpost(data.pidsets,postCounter);
		}
	});

  //retrieve self events
  $.ajax({
      url:"/getselfevents",
      data:JSON.stringify(auth_data),
      type:"POST",
      contentType: 'application/json',
      success:function(data){
        $("#eventsNumber").html(data.events.length);
        localStorage.eventsNumber = data.events.length;
        localStorage.eventsList = data.events;
      }
  });

  //retrieve self friends
  $.ajax({
    url:"/getselffriendsinfo",
    data:JSON.stringify(auth_data),
    type:"POST",
    contentType: 'application/json',
    success:function(data){
      $("#friendsNumber").html(data.friend_uids.length);
      localStorage.friendsNumber = data.friend_uids.length;
      localStorage.friendsList = data.friend_uids;
    }  
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

  $("body").delegate(".friendItem", 'click', function() {
      var friendUid = $(this).parent().attr("uid");
      var proceed = true;
      $.each($("#chatArea").find(".chat-window"),function(index,element){
        if($(element).attr("id").replace("chat","") == friendUid){
          proceed = false;
        }
      });
      if(proceed){
        openFriendsChatBox(localStorage.session_key,localStorage.uid,friendUid,chatBoxNumber);
        chatBoxNumber++;
      }
      return false;
  });

  $("body").delegate(".eventItem", 'click', function(){
    localStorage.eid = $(this).attr("eid");
    localStorage.ename = $(this).attr("ename");
    window.location = "/event";
    return false;
  });

  // $("body").delegate(".eventItem", 'click', function() {
  //     var eventId = $(this).attr("eid");
  //     var eventName = $(this).attr("ename");
  //     var proceed = true;
  //     $.each($("#chatArea").find(".chat-window"),function(index,element){
  //       if($(element).attr("chatId") == eventId){
  //         proceed = false;
  //       }
  //     });
  //     if(proceed){
  //       $('#chatArea').append(renderChatBox({"name":eventName,"id":eventId,url:$(this).find('img').attr('src')},chatBoxNumber));
  //       chatBoxNumber++;
  //     }
  //     return false;
  // });

  $("#notification").hover(
    function(){
      $(this).tooltip('show');
      console.log("first");
      setTimeout(function(){$('#notification').tooltip('hide')},2000);},
    function(){$(this).tooltip('hide')}
    );

  $("#settingUserNews").click(function(){
    var newsData = {};
    newsData.session_key = localStorage.session_key;
    newsData.uid = localStorage.uid;
    newsData.option = 1;
    var date = new Date();
    var timeoffset = date.getTimezoneOffset();
    $("#circularG").show();
    $.ajax({
      url:"/getusernews",
      data:JSON.stringify(newsData),
      type:"POST",
      contentType: 'application/json',
      success:function(data){
        console.log("News:");
        console.log(data);
        $("#left-column").html("");
        $("#right-column").html("");
        viewpost(data.pidsets,postCounter);
        $("#userNameLink").html("User News");
        $("#circularG").hide();
      }
    });
    return false;
  });

  $("#settingEventNews").click(function(){
    var newsData = {};
    newsData.session_key = localStorage.session_key;
    newsData.uid = localStorage.uid;
    newsData.option = 1;
    var date = new Date();
    var timeoffset = date.getTimezoneOffset();
    $("#circularG").show();
    $.ajax({
      url:"/geteventnews",
      data:JSON.stringify(newsData),
      type:"POST",
      contentType: 'application/json',
      success:function(data){
        console.log("Event News:");
        console.log(data);
        $("#left-column").html("");
        $("#right-column").html("");
        viewpost(data.pidsets,postCounter);
        $("#userNameLink").html("Circa News");
        $("#circularG").hide();
      }
    });
    return false;
  });


	$('#postSubmit').click(function(){
    $(this).attr("disabled","disabled");
    $('#postCancel').attr("disabled","disabled");
		var content = $('#postArea').val();
		var tags = $('#postTags').tagsinput('items');
    if(tags=="")
      tags=[];
		if(content != ""){
			var eid = "0000000000000000";
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
        $(this).find(".icon-chevron-left").remove();
        $(this).find("a").append("<i class = 'icon-chevron-right' style = 'margin-top:2.5%;'></i>");
        $(this).attr("action","out");
      }else{
        $(this).find(".icon-chevron-right").remove();
        $(this).find("a").prepend("<i class = 'icon-chevron-left' style = 'margin-top:2%;'></i>");
        $(this).attr("action","in");
      }
      //get user's friends information
      if(flag_displayfriend){
        $("#squaresWaveG-friend").show();
        flag_displayfriend=false;
        $.ajax({
          url:"/getselffriendsinfo",
          data:JSON.stringify(auth_data),
          type:"POST",
          contentType: 'application/json',
          success:function(data){
            var friendsData = {};
            friendsData.uidList = data.friend_uids;
            friendsData.session_key = localStorage.session_key;
            friendsData.uid = localStorage.uid;
            if(data.friend_uids){
              localStorage.friendsNumber = data.friend_uids.length;
            }else{
              localStorage.friendsNumber = 0;
            }
            $("#friendsNumber").html(localStorage.friendsNumber);
            $(".friendItem").remove();
            $("#friendsHead").find("font").html("("+localStorage.friendsNumber+")");
            if(localStorage.friendsNumber == 0){
              $("#friendsList").append("<strong style = 'margin-left:15%;color:white;'>No friend yet.</strong>");
              $("#squaresWaveG-friend").hide();
            }else{
              $("#friendsList").html("");
              userlist(friendsData,'friend');
            }
          }	
        });
      }
      //get user's events information
      if(flag_displayevent){
        flag_displayevent=false;
        $("#squaresWaveG-event").show();
        $.ajax({
            url:"/getselfevents",
            data:JSON.stringify(auth_data),
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
                localStorage.eventsNumber = data.events.length;
              }else{
                localStorage.eventsNumber = 0;
              }
              $("#eventsNumber").html(localStorage.eventsNumber);
              $(".eventItem").remove();
              $("#eventsHead").find("font").html("("+localStorage.eventsNumber+")");
              if(localStorage.eventsNumber == 0){
                $("#eventsList").append("<strong style = 'margin-left:15%;color:white;'>No event yet.</strong>");
                $("#squaresWaveG-event").hide();
              }else{
                $("#eventsList").html("");
                eventlist(eventsData);
              }
            }
        });
      }
    return false;
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
    var replier = $(this).closest(".replyBody").find('.userName').first();
    console.log(replier.attr('name'));
    console.log(replier.attr('uid'));
    var textarea = $(this).closest('.postRoot').find('textarea').first();
    textarea.attr({"replyToName":replier.attr('name'),"replyToUid":replier.attr('uid')}); 
    textarea.focus();
    return false;
  });

  $('body').delegate('.removePost','click',function(){
    var context = $(this).closest('.postRoot');
    $("#removePostConfirm").attr("postId",$(this).closest(".postRoot").attr("id")).attr('postUid',$(context).attr('posterUid')).attr('postEid',$(context).attr('postEid')).attr('postPid',$(context).attr('postPid'));
  });

  $('#removePostConfirm').click(function(){
    $("#floatingBarsG-removePost").show();
    $("#removePostConfirm").attr("disabled","disabled");
    var data = auth_data;
    var id = $(this).attr('postId');
    data.id = $(this).attr('postUid');
    data.eid = $(this).attr('postEid');
    data.pid = $(this).attr('postPid');
    $.ajax({
      url:"/deletepost",
      data:JSON.stringify(data),
      type:"POST",
      contentType: 'application/json',
      success:function(data){
        console.log(data);
        if(data.status=="successful"){
          $('#'+id).remove();
          if($("#left-column").html() == "" && $("#right-column").html() == ""){
            $("#contentBody").find(".well").show();
          }
        }
        $("#removePostConfirm").removeAttr("disabled");
        $("#floatingBarsG-removePost").hide();
        $("#removePostCancel").trigger("click");
      }
    });
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
    var replyToName = $(this).attr("replyToName");
    $(this).attr('placeholder','Reply to '+replyToName+":");
    return false;
  });

  $('body').delegate('.replyInput','keyup',function(){
    if($(this).val() == ""){
      $(this).closest('.postRoot').find('.replySubmit').attr('disabled','disabled');
    }else{
      $(this).closest('.postRoot').find('.replySubmit').removeAttr('disabled');
    }
  });

	$('body').delegate('.replySubmit','click',function(){
        //TODO: choose reply target
        var data = auth_data;
        data.replier_name = localStorage.username;
        var context = $(this).closest('.postRoot');
        data.replyContent = $(this).closest('.span11').children('textarea').first().val();
        data.posterUid = parseInt($(this).closest('.span11').children('textarea').first().attr('replyToUid'));
        data.replyToUid = data.posterUid;
        data.postEid = context.attr('postEid');
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
              reply.posterUid = data.posterUid;
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
	$('body').delegate('.replyCancel','click',function(){
    var post = $(this).closest('.postRoot');
    var textarea = post.find('textarea').first();
    textarea.attr({replyToName:post.attr("posterName"),replyToUid:post.attr('uid'),placeholder:"Add Comments here..."});
    return false; 
	});

  //Handle notifications behaviors
  $('body').delegate('.notificationItem','click',function(){
    if($(this).hasClass('unread')){
      $(this).removeClass('unread');
    }
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

  $('body').delegate('.chat-window-title','click',function(){
    $(this).closest(".chat-window").find(".chat-window-content").toggle();
    $(this).closest(".chat-window").find(".chat-window-text-box-wrapper").toggle();
    return false;
  });

  $('body').delegate('.closeChat','click',function(){
    var currentPosition = $(this).closest(".chat-window").attr("position");
    $(this).closest(".chat-window").remove();
    $.each($("#chatArea").find(".chat-window"),function(index,element){
      var position = $(element).attr("position");
      if(position > currentPosition){
        $(element).attr("position",position - 1);
        if(position <= 3){
          var right = $(element).css("right").replace("px","");
          console.log("right: "+right);
          $(element).css("right",right - $(window).width()*0.18);
          console.log("window width:"+$(window).width()*0.18);
          console.log("right: "+right);
        }
      }
    });
    chatBoxNumber--;
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

  $(".createEventInput").keyup(function(){
    var proceed = true;
    $.each($(".createEventInput"),function(index,element){
      if($(element).val() == ""){
        proceed = false;
      }
    });
    if(proceed){
      $("#createEventSubmit").removeAttr("disabled");
    }else{
      $("#createEventSubmit").attr("disabled","disabled");
    }
  });

  $("#createEventCancel").click(function(){
    $.each($(".createEventInput"),function(index,element){
      $(element).val("");
    });
    $('#createEventInputTags').tagsinput("removeAll");
    $("#createEventSubmit").attr("disabled","disabled");
  });

  $("#createEventSubmit").click(function(){
    $(this).attr("disabled","disabled");
    $("#createEventCancel").attr("disabled","disabled");
    var realname = $('#createEventInputName').val();
    var city = $('#createEventInputCity').val();
    var description = $('#createEventInputDescription').val();
    var tags = [];
    if($('#createEventInputTags').val().indexOf(",")>-1)
        tags = $('#createEventInputTags').val().split(",");
    else if($('#createEventInputTags').val().trim() != "")
        tags.push($('#createEventInputTags').val());
    var data = {};
    data.uid = localStorage.uid;
    data.session_key =localStorage.session_key;
    data.event_name = realname;
    data.description = description;
    data.city = city;
    data.tags = tags;
    $.ajax({
        url:'/createevent',
        data:JSON.stringify(data),
        type:'POST',
        contentType: 'application/json',
        success:function(data){
            if(data.status == "successful"){
                localStorage.eid = data.eid;
                localStorage.ename = data.event_name;
                $.each($(".createEventInput"),function(index,element){
                  $(element).val("");
                });
                $('#createEventInputTags').tagsinput("removeAll");
                $(this).removeAttr("disabled");
                $("#createEventCancel").removeAttr("disabled");
                //TO DO: handle the returned data
                window.location = "/event";
            }
        }
    });
    return false;
  });
});

function removeNotification(){
  var newNotificationNumber = parseInt($("#notificationNumber").html().trim()) - 1;
  $("#notificationNumber").html(" "+newNotificationNumber+" ");
  console.log(($("#notificationNumber").html()).trim());
  if(newNotificationNumber == 0){
    $("#notificationNumber").css({"color":"black","font-weight":"normal"});
    $("#notificationList").html("<li tabindex='-1' style = 'text-align:center;'>No New Notification.</li>");
  }
}