if(!localStorage.uid){
  window.location = "/";
}
var loadOrder = 0;
var loadingFlag = false;
var pidsets = [];
var uids = [];
var eids = [];

var postCounter =0;
var userCounter = 0;
var eventCounter = 0;

$(document).ready(function(){

  $("#circularG").hide();

   //TO DO: add the case handler for no matched result.
  if(localStorage.search_tag_option!=""){
      switch(localStorage.search_tag_option){
        case "post":
            $($("#searchTabBar").find("a")[0]).trigger("click");
            $("#PostsSearch").find(".searchInput").val(localStorage.search_tag_content);
            search(localStorage.search_tag_content,"postSearch");
        break;
        case "user":
            $($("#searchTabBar").find("a")[2]).trigger("click");
            $("#UsersSearch").find(".searchInput").val(localStorage.search_tag_content);
            search(localStorage.search_tag_content,"userSearch");
        break;
        case "event":
            $($("#searchTabBar").find("a")[1]).trigger("click");
            $("#EventsSearch").find(".searchInput").val(localStorage.search_tag_content);
            search(localStorage.search_tag_content,"eventSearch");
        break;
      }
      localStorage.search_tag_option = "";
      localStorage.search_tag_content = "";
  }

  //Just show the first tag for each post
  $(".tagsGroup").width("+=10");
  $(".tagsGroup a").hide();
  $('.tagHead').show();
  adjustTags();
  
  $(window).resize(function(){
    $.each($(".tagHead"),function(index,element){
      var tagsGroup = $(element).closest(".tagsGroup");
      //$(tagsGroup).children().slideDown( "fast");
      var parentWidth = $('.tagsGroup').closest('.span2').width();
      var selfWidth = $(element).closest(".tagsGroup").width();
      $(element).closest(".tagsGroup").css('margin-left',parentWidth - selfWidth);
    });
  });

	$("#userSearchOption").click(function(){
		if($("#userSearchOption").text() == "By ID/Email"){
			$("#userSearchOption").text("By Filter");
			$("#userSearchFilterSubOptions").show();	
			$("#userSearchOption").attr("subtype",1);
		}else{
			$("#userSearchOption").text("By ID/Email");
			$("#userSearchFilterSubOptions").hide();
			$("#userSearchOption").attr("subtype",0);
		}
	});
	$("#eventSearchOption").click(function(){
		if($("#eventSearchOption").text() == "By ID"){
			$("#eventSearchOption").text("By Filter");
			$("#eventSearchFilterSubOptions").show();	 
			$("#eventSearchOption").attr("subtype",1);
		}else{
			$("#eventSearchOption").text("By ID");
			$("#eventSearchFilterSubOptions").hide();
			$("#eventSearchOption").attr("subtype",0);
		}
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

$("body").delegate('.searchInput','keypress',function(event){
  if(event.which == '13'){
    $("#loadMoreButton").html("More").removeAttr("disabled","disabled").hide();
    search($(this).val(),$(this).attr("searchType"));
  }
});
$(".searchSubmit").click(function(){
  var searchInput = $(this).prev('.searchInput');
  search($(searchInput).val(),$(searchInput).attr("searchType"));
  return false;
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

$("body").delegate(".eventName", 'click', function() {
  localStorage.eid = $(this).attr("eid");
  localStorage.ename = $(this).attr("name");
  window.location = "/event";
  return false;
});

$("body").delegate(".postName", 'click', function() {
  $(this).css("cusor","pointer");
  /*TO DO: handle the event when user clicks 
           post name in notification
  */
  // localStorage.friendUid  = $(this).attr("uid");
  // localStorage.friendName = $(this).attr("name");
  // window.location = "/user";
  return false;
});

$(document).on('click', ".posttag", function() {
               console.log("postSearch");
               var searchData = {};
               searchData.session_key = localStorage.session_key;
               searchData.uid = localStorage.uid;
               searchData.filter = $(this).attr("tag");
               $("#search_result").html('<div class = "span6" id = "left-column"></div><div class = "span6" id = "right-column"></div>');
               searchData.option = 0;
               searchData.range = 0;
               $.ajax({
                      url:"/searchpost",
                      data:JSON.stringify(searchData),
                      type:"POST",
                      contentType: 'application/json',
                      success:function(data){
                      console.log("searchpost result:");
                      console.log(data);
                      $(window).unbind('scroll');
                      viewpost(data.pidsets);
                      }
                      });
             return false;
             });
$(document).on('click', ".eventtag", function() {
               $("#search_result").html('<div class = "span4" id = "left-column"></div><div class = "span4" id = "middle-column"></div> <div class = "span4" id = "right-column"></div>');
             console.log("eventtagSearch");
             var searchData = {};
             searchData.session_key = localStorage.session_key;
             searchData.uid = localStorage.uid;
             searchData.filter = $(this).attr("tag");
             searchData.option = 2;
             searchData.range = 1;
             $(window).unbind('scroll');
             searchEvents(searchData,loadOrder);
             return false;
             });
$(document).on('click', ".usertag", function() {
        $("#search_result").html('<div class = "span4" id = "left-column"></div><div class = "span4" id = "middle-column"></div> <div class = "span4" id = "right-column"></div>');
             console.log("usertagSearch");
             var searchData = {};
             searchData.session_key = localStorage.session_key;
             searchData.uid = localStorage.uid;
             searchData.filter = $(this).attr("tag");
             searchData.option = 2;
             searchData.range = 0;
             searchData.age_lower=0;
             searchData.age_upper=99;
             searchData.gender = 2;
             $(window).unbind('scroll');
             searchUser(searchData,loadOrder);
             return false;
             });
$(document).on('click', ".addfriend", function() {
              var addButton = $(this);
              $(addButton).attr("disabled","disabled");
              $(addButton).html("sending...");
              console.log("add friend button");
              var requestData = {};
              requestData.session_key = localStorage.session_key;
              requestData.uid = localStorage.uid;
              requestData.content = "Could you add me as your friend? :)";
              requestData.receiver_uid = $(addButton).attr("id");
              console.log(requestData);
              $.ajax({
                url:"/friendrequest",
                data:JSON.stringify(requestData),
                type:"POST",
                contentType: 'application/json',
                success:function(data){
                  console.log("request result:");
                  console.log(data);
                  if(data.status == "successful"){
                    $(addButton).html("request sended");
                  }
                }
              });
              return false;
             });
$(document).on('click', ".joinevent", function() {
              var joinButton = $(this);
              $(joinButton).attr("disabled","disabled");
              $(joinButton).html("sending...");
              console.log("add friend button");
              var requestData = {};
              requestData.session_key = localStorage.session_key;
              requestData.uid = localStorage.uid;
              requestData.content = "Could you add me into your event? :)";
              requestData.eid = $(joinButton).attr("id");
              console.log(requestData);
              $.ajax({
                url:"/joinevent",
                data:JSON.stringify(requestData),
                type:"POST",
                contentType: 'application/json',
                success:function(data){
                  console.log("request result:");
                  console.log(data);
                  if(data.status == "successful"){
                    $(joinButton).html("request sended");
                  }
                }
              });
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

  $("#loadMoreButton").click(function(){
    var type = $("#searchTabBar").find(".active a").html();
    switch(type){
      case "Users":
        getMoreUsers();
        break;
      case "Groups":
        getMoreEvents();
        break;
      case "Posts":
        getMorePosts();
        break;
      default:
        break;
    }
    return false;
  });  
  
  $("#timeoutButton").click(function(){
    localStorage.clear();
    window.location = "/";
    return false;
  });

  $("#createPost").remove();
  $("#searchButton").remove();
});

function search(val,type){
  $(window).unbind('scroll');
  loadOrder = 0;
  userCounter = 0;
  eventCounter = 0;
  postCounter = 0;
  var searchValue = val;
  var searchData = {};
  searchData.session_key = localStorage.session_key;
  searchData.uid = localStorage.uid;
  $("#contentBody").addClass("well");
  $("#circularG").show();
  if(type == "userSearch"){
    console.log("userSearch");
    $("#search_result").html('<div class = "span4" id = "left-column"></div><div class = "span4" id = "middle-column"></div> <div class = "span4" id = "right-column"></div>');
    var subtype = ((isNaN(searchValue)&&(!isValidEmailAddress(searchValue)))||(searchValue==""))?1:0;
    if(subtype == 0){
      //search by Email
      if(isValidEmailAddress(searchValue)){
        console.log("search by email");
        searchData.email = searchValue;
        $.ajax({
          url:"/searchuserbyemail",
          data:JSON.stringify(searchData),
          type:"POST",
          contentType: 'application/json',
          success:function(data){
            console.log(data);
            if(data.uids.length != 0){
              var friendsData = {};
              friendsData.session_key = localStorage.session_key;
              friendsData.uid = localStorage.uid;
              friendsData.view_uid = data.uids;
              loadingFlag = true;
              $.ajax({
                url:"/getuserinfo",
                data:JSON.stringify(friendsData),
                type:"POST",
                contentType:'application/json',
                success:function(result){
                  if(result.status == "successful"){
                    var element = result;
                    //TO DO: change to add avarta
                    if(loadOrder == 0){
                      $('#left-column').append(renderSearchUser(element));
                      loadOrder = 1;
                    }else if(loadOrder == 1){
                      $('#middle-column').append(renderSearchUser(element));
                      loadOrder = 2;
                    }else{
                      $('#right-column').append(renderSearchUser(element));
                      loadOrder = 0;
                    }
                    $(".tagsGroup").width("+=10");
                    $(".tagsGroup a").hide();
                    $('.tagHead').show();
                    adjustTags();
                    $("#circularG").hide();
                  }else{
                    $("#circularG").hide();
                  }
                }
              });
            }else{
              $("#circularG").hide();
              $("#search_result").html("");
              $("#search_result").css("text-align","center");
              $("#search_result").append("<strong>No Matched result found.</strong>");
            }
          }
        });
      }else{
        //search by ID
        console.log("search by id");
        searchData.id = searchValue;
        $.ajax({
          url:"/searchuserbyid",
          data:JSON.stringify(searchData),
          type:"POST",
          contentType: 'application/json',
          success:function(data){
            if(data.uids.length != 0){
              var friendsData = {};
              friendsData.session_key = localStorage.session_key;
              friendsData.uid = localStorage.uid;
              friendsData.view_uid = data.uids[0];
              loadingFlag=true;
              $.ajax({
                url:"/getuserinfo",
                data:JSON.stringify(friendsData),
                type:"POST",
                contentType:'application/json',
                success:function(result){
                  if(result.status == "successful"){
                    var element = result;
                    //TO DO: change to add avarta
                    if(loadOrder == 0){
                      $('#left-column').append(renderSearchUser(element));
                      loadOrder = 1;
                    }else if(loadOrder == 1){
                      $('#middle-column').append(renderSearchUser(element));
                      loadOrder = 2;
                    }else{
                      $('#right-column').append(renderSearchUser(element));
                      loadOrder = 0;
                    }
                    $(".tagsGroup").width("+=10");
                    $(".tagsGroup a").hide();
                    $('.tagHead').show();
                    adjustTags();
                    $("#circularG").hide();
                  }
                }
              });
            }else{
              $("#circularG").hide();
              $("#search_result").html("");
              $("#search_result").css("text-align","center");
              $("#search_result").append("<strong>No Matched result found.</strong>");
            }               
          }
        });
      }
    }else{
      //search by filter
      searchData.filter = searchValue;
      //name & tag
      searchData.option = 0;
      //global
      searchData.range = 1;
      searchData.age_lower = 0;
      searchData.age_upper = 99;
      searchData.gender = 2;
      searchUser(searchData,loadOrder);
    }
  }else if(type == "eventSearch"){
    console.log("eventSearch");
    $("#search_result").html('<div class = "span4" id = "left-column"></div><div class = "span4" id = "middle-column"></div> <div class = "span4" id = "right-column"></div>');
    var subtype = (isNaN(searchValue)||searchValue=="")?1:0;
    if(subtype == 0){
      //search by ID
      searchData.id = searchValue;
      $.ajax({
        url:"/searcheventbyid",
        data:JSON.stringify(searchData),
        type:"POST",
        contentType: 'application/json',
        success:function(data){
          if(data.eids.length != 0){
            var eventData = {};
            eventData.session_key = localStorage.session_key;
            eventData.uid = localStorage.uid;
            eventData.eid = data.eids[0];
            loadingFlag=true;
            $.ajax({
              url:"/geteventinfo",
              data:JSON.stringify(eventData),
              type:"POST",
              contentType:'application/json',
              success:function(result){
                if(result.status == "successful"){
                  var element = result;
                  //TO DO: change to add avarta
                  if(loadOrder == 0){
                    $('#left-column').append(renderSearchEvents(element));
                    loadOrder = 1;
                  }else if(loadOrder == 1){
                    $('#middle-column').append(renderSearchEvents(element));
                    loadOrder = 2;
                  }else{
                    $('#right-column').append(renderSearchEvents(element));
                    loadOrder = 0;
                  }
                  $(".tagsGroup").width("+=10");
                  $(".tagsGroup a").hide();
                  $('.tagHead').show();
                  adjustTags();
                  $("#circularG").hide();
                }
              }
            });
          }else{
            $("#circularG").hide();
            $("#search_result").html("");
            $("#search_result").css("text-align","center");
            $("#search_result").append("<strong>No Matched result found.</strong>");
          }
        }
      });
    }else{
      //search by filter
      searchData.filter = searchValue;
      //name & tag
      searchData.option = 0;
      //global
      searchData.range = 1;
      searchEvents(searchData,loadOrder);
    }
  }else{
    console.log("postSearch");
    $("#circularG").show();
    searchData.filter = searchValue;
    $("#search_result").html('<div class = "span6" id = "left-column"></div><div class = "span6" id = "right-column"></div>');
    //user & event
    searchData.option = 0;
    //global
    searchData.range = 1;     
    $.ajax({
      url:"/searchpost",
      data:JSON.stringify(searchData),
      type:"POST",
      contentType: 'application/json',
      success:function(data){
        console.log("searchpost result:");
        console.log(data);
        if(data.pidsets.length > 0){
          viewpost(data.pidsets);
        }else{
          $("#loadMoreButton").hide();
          $("#circularG").hide();
          $("#search_result").html("");
          $("#search_result").css("text-align","center");
          $("#search_result").append("<strong>No Matched result found.</strong>");
        }
      }
    });
  }
}

/*function search(val, type){
  $(window).unbind('scroll');
  loadOrder = 0;
  userCounter = 0;
  eventCounter = 0;
  postCounter = 0;
  var searchValue = val;
  var searchData = {};
  searchData.session_key = localStorage.session_key;
  searchData.uid = localStorage.uid;
  $("#contentBody").addClass("well");
  $("#circularG").show();
  if(type == "userSearch"){
    console.log("userSearch");
    $("#search_result").html('<div class = "span4" id = "left-column"></div><div class = "span4" id = "middle-column"></div> <div class = "span4" id = "right-column"></div>');
    var subtype = $("#userSearchOption").attr("subtype");
    if(subtype == 0){
      //search by Email
      console.log("search by email");
      if(isValidEmailAddress(searchValue)){
        searchData.email = searchValue;
        $.ajax({
          url:"/searchuserbyemail",
          data:JSON.stringify(searchData),
          type:"POST",
          contentType: 'application/json',
          success:function(data){
            console.log(data);
            if(data.uids.length != 0){
              var friendsData = {};
              friendsData.session_key = localStorage.session_key;
              friendsData.uid = localStorage.uid;
              friendsData.view_uid = data.uids;
              loadingFlag = true;
              $.ajax({
                url:"/getuserinfo",
                data:JSON.stringify(friendsData),
                type:"POST",
                contentType:'application/json',
                success:function(result){
                  if(result.status == "successful"){
                    var element = result;
                    //TO DO: change to add avarta
                    if(loadOrder == 0){
                      $('#left-column').append(renderSearchUser(element));
                      loadOrder = 1;
                    }else if(loadOrder == 1){
                      $('#middle-column').append(renderSearchUser(element));
                      loadOrder = 2;
                    }else{
                      $('#right-column').append(renderSearchUser(element));
                      loadOrder = 0;
                    }
                    $(".tagsGroup").width("+=10");
                    $(".tagsGroup a").hide();
                    $('.tagHead').show();
                    adjustTags(); 
                    $("#circularG").hide();
                  }else{
                    $("#circularG").hide();
                  }
                }
              });
            }else{
              $("#circularG").hide();
              $("#search_result").html("");
              $("#search_result").css("text-align","center");
              $("#search_result").append("<strong>No Matched result found.</strong>");
            }
          }
        });
      }else{
        //search by ID
        console.log("search by id");
        searchData.id = searchValue;
        $.ajax({
          url:"/searchuserbyid",
          data:JSON.stringify(searchData),
          type:"POST",
          contentType: 'application/json',
          success:function(data){
            if(data.uids.length != 0){
              var friendsData = {};
              friendsData.session_key = localStorage.session_key;
              friendsData.uid = localStorage.uid;
              friendsData.view_uid = data.uids[0];
              loadingFlag=true;
              $.ajax({
                url:"/getuserinfo",
                data:JSON.stringify(friendsData),
                type:"POST",
                contentType:'application/json',
                success:function(result){
                  if(result.status == "successful"){
                    var element = result;
                    //TO DO: change to add avarta
                    if(loadOrder == 0){
                      $('#left-column').append(renderSearchUser(element));
                      loadOrder = 1;
                    }else if(loadOrder == 1){
                      $('#middle-column').append(renderSearchUser(element));
                      loadOrder = 2;
                    }else{
                      $('#right-column').append(renderSearchUser(element));
                      loadOrder = 0;
                    }
                    $(".tagsGroup").width("+=10");
                    $(".tagsGroup a").hide();
                    $('.tagHead').show();
                    adjustTags();
                    $("#circularG").hide();
                  }
                }
              });
            }else{
              $("#circularG").hide();
              $("#search_result").html("");
              $("#search_result").css("text-align","center");
              $("#search_result").append("<strong>No Matched result found.</strong>");
            }               
          }
        });
      }
    }else{
      //search by filter
      searchData.filter = searchValue;
      switch($($("#userSearchFilterSubOptions").find("select")[0]).val()){
        case "name":
          searchData.option = 1;
        break;
        case "tag":
          searchData.option = 2;
        break;
        case "name & tag":
          searchData.option = 0;
        break;
      }
      if($($("#userSearchFilterSubOptions").find("select")[1]).val() == "global"){
        searchData.range = 1;
      }else{
        searchData.range = 0;
      }
      searchData.age_lower = $($("#userSearchFilterSubOptions").find("input")[0]).val();
      if(!searchData.age_lower){
        searchData.age_lower=0;
      }
      searchData.age_upper = $($("#userSearchFilterSubOptions").find("input")[1]).val();
      if(!searchData.age_upper){
        searchData.age_upper=99;
      }
      switch($($("#userSearchFilterSubOptions").find("select")[2]).val()){
        case "female":
          searchData.gender = 0;
        break;
        case "male":
          searchData.gender = 1;
        break;
        case "both":
          searchData.gender = 2;
        break;
      }
      searchUser(searchData,loadOrder);
    }
  }else if(type == "eventSearch"){
    console.log("eventSearch");
    $("#search_result").html('<div class = "span4" id = "left-column"></div><div class = "span4" id = "middle-column"></div> <div class = "span4" id = "right-column"></div>');
    var subtype = $("#eventSearchOption").attr("subtype");
    if(subtype == 0){
      //search by ID
      searchData.id = searchValue;
      $.ajax({
        url:"/searcheventbyid",
        data:JSON.stringify(searchData),
        type:"POST",
        contentType: 'application/json',
        success:function(data){
          if(data.eids.length != 0){
            var eventData = {};
            eventData.session_key = localStorage.session_key;
            eventData.uid = localStorage.uid;
            eventData.eid = data.eids[0];
            loadingFlag=true;
            $.ajax({
              url:"/geteventinfo",
              data:JSON.stringify(eventData),
              type:"POST",
              contentType:'application/json',
              success:function(result){
                if(result.status == "successful"){
                  var element = result;
                  //TO DO: change to add avarta
                  if(loadOrder == 0){
                    $('#left-column').append(renderEvents(element));
                    loadOrder = 1;
                  }else if(loadOrder == 1){
                    $('#middle-column').append(renderEvents(element));
                    loadOrder = 2;
                  }else{
                    $('#right-column').append(renderEvents(element));
                    loadOrder = 0;
                  }
                  $(".tagsGroup").width("+=10");
                  $(".tagsGroup a").hide();
                  $('.tagHead').show();
                  adjustTags();
                  $("#circularG").hide();
                }
              }
            });
          }else{
            $("#circularG").hide();
            $("#search_result").html("");
            $("#search_result").css("text-align","center");
            $("#search_result").append("<strong>No Matched result found.</strong>");
          }
        }
      });
    }else{
      //search by filter
      searchData.filter = searchValue;
      switch($($("#eventSearchFilterSubOptions").find("select")[0]).val()){
        case "name":
          searchData.option = 1;
        break;
        case "tag":
          searchData.option = 2;
        break;
        case "name & tag":
          searchData.option = 0;
        break;
      }
      if($($("#eventSearchFilterSubOptions").find("select")[1]).val() == "global"){
        searchData.range = 1;
      }else{
        searchData.range = 0;
      }
      searchEvents(searchData,loadOrder);
    }
  }else{
    console.log("postSearch");
    $("#circularG").show();
    searchData.filter = searchValue;
    $("#search_result").html('<div class = "span6" id = "left-column"></div><div class = "span6" id = "right-column"></div>');
    switch($($("#postSearchFilterSubOptions").find("select")[0]).val()){
        case "user & event":
          searchData.option = 0;
        break;
        case "user only":
          searchData.option = 1;
        break;
        case "event only":
          searchData.option = 2;
        break;
      }
      if($($("#postSearchFilterSubOptions").find("select")[1]).val() == "global"){
        searchData.range = 1;
      }else{
        searchData.range = 0;
      }           
      $.ajax({
      url:"/searchpost",
      data:JSON.stringify(searchData),
      type:"POST",
      contentType: 'application/json',
      success:function(data){
        console.log("searchpost result:");
        console.log(data);
        if(data.pidsets.length > 0){
          viewpost(data.pidsets,postCounter);
        }else{
          $("#circularG").hide();
          $("#search_result").html("");
          $("#search_result").css("text-align","center");
          $("#search_result").append("<strong>No Matched result found.</strong>");
        }
      }
    });
  }
}*/