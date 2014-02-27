/************* helper functions **********/

function isValidEmailAddress(emailAddress) {
    var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
    return pattern.test(emailAddress);
};  
     
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

function convertUTCDateToLocalDate(date, time) {
  var year = Math.floor(date / 10000);
  var month = Math.floor(date / 100) % 100;
  var day = date % 100;
  var hour = Math.floor(time / 10000);
  var minute = Math.floor(time / 100) % 100;
  var second = time % 100;
  var d = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  var newDate = new Date(d.getTime());
  return [
          print_date(newDate.getFullYear() * 10000 + (newDate.getMonth() + 1) * 100 + newDate.getDate()),
          print_time(newDate.getHours() * 10000 + newDate.getMinutes() * 100
                     + newDate.getSeconds()) ];
}
function print_date(date) {
  var year = Math.floor(date / 10000);
  var month = Math.floor(date / 100) % 100;
  var day = date % 100;
  var ans = "";
  var tmp = [ "Jan ", "Feb ", "Mar ", "Apr ", "May ", "Jun ", "Jul ", "Aug ",
             "Sep ", "Oct ", "Nov ", "Dec " ];
  ans = tmp[month - 1] + " " + day + ", " + year;
  return ans;
};
function print_time(time) {
  var hour = Math.floor(time / 10000);
  var minute = Math.floor(time / 100) % 100;
  var isPM = false;
  var ans = "";
  /*
   * if (hour > 12){ hour = hour - 12; isPM = true; }
   */
  if (hour < 10) {
      hour = "0" + hour;
  }
  if (minute < 10) {
      minute = "0" + minute;
  }
  ans = hour + ":" + minute;
  /*
   * if(isPM){ ans = hour +":"+minute+" PM" }else{ ans = hour +":"+minute+"
   * AM" }
   */
  return ans;
};

function checkMonth(month){
  switch(month){
    case 1:
      return "Jan";
    break;
    case 2:
      return "Feb";
    break;
    case 3:
      return "Mar";
    break;
    case 4:
      return "Apr";
    break;
    case 5:
      return "May";
    break;
    case 6:
      return "June";
    break;
    case 7:
      return "July";
    break;
    case 8:
      return "Aug";
    break;
    case 9:
      return "Sep";
    break;
    case 10:
      return "Oct";
    break;
    case 11:
      return "Nov";
    break;
    case 12:
      return "Dec";
    break;
    default:
    break;
  }
  return "Other";
}
function sortTags(tags){
  var results = [];
  var second = [];
  var u_tags = localStorage.usertags.split(",");
  for(var i=0;i<tags.length;i++){
    if(u_tags.indexOf(tags[i])!==-1)
      results.push(tags[i]);
    else
      second.push(tags[i]);
  }
  var length = second.length;
  for(var i =0;i<length;i++)
    results.push(second[i]);
  return results;
}
function getCurrentDate(){
  var now = new Date();
  var tmp = [ "Jan ", "Feb ", "Mar ", "Apr ", "May ", "Jun ", "Jul ", "Aug ", "Sep ", "Oct ", "Nov ", "Dec "];
  now = tmp[now.getMonth()]+now.getDate()+", "+now.getFullYear();
  return now;
}

function checkMutual(list, uid){
  list.forEach(function(element){
    if(element == uid){
      return true;
    }
  });
  return false;
}

/************* end helper functions **********/

/************* render functions **********/

function renderPost(post){
  post.id = post.uid+""+post.eid+""+post.pid;
    var time = convertUTCDateToLocalDate(post.date,post.time);
  var html =
  '<div id = "'+post.id+'" class = "row-fluid postRoot" repliesNumber = '+post.replies_no+' postPid = "'+post.pid+'" posterUid = "'+post.uid+'" postEid = "'+post.eid+'" posterName = "'+post.poster_name+'" style = "background-color:#FFFFFF;margin-bottom:10px;">'+
    '<div class = "row-fluid" style = "margin-top:10px;height:50px;">'+
      '<div class = "span4 row-fluid" style = "text-align: center;">'+
        '<div class = "span4">'+
          '<img id = "post_user_avarta'+post.pid+'" ';
          if(post.uid == localStorage.uid){
            html = html + 'class="selfProfileSmallAvarta"';
          }
          html = html +
           'src = "'+localStorage.self_small_avarta+'" style = "width:40px;height:40px;border-radius:20px;">'+
        '</div>'+
        '<div class = "span8" style = "text-align:left;">'+
          '<a href = # class = "userName" name = "'+post.poster_name+'" uid = "'+post.uid+'" style = "font-family: \'Lato\', sans-serif;font-weight:300;">'+post.poster_name+'</a><p style = "font-size:12px;color:#999;font-family: \'Lato\', sans-serif;font-weight:300;">'+time[0]+' &nbsp;&nbsp;'+time[1]+'</p>'+
        '</div>'+
      '</div>';
      if(post.uid == localStorage.uid){
        html = html + 
          '<div class = "offset5 span1"><i class = "icon-trash pull-right removePost" data-toggle = "modal" href = "#removePostModal" style = "margin-right:25%;"></i></div>'+
          '<div class = "span2 pull-right" style = "color:white;text-align: center;">'+
            '<div class = "tagsGroup">';
      }else{
        html = html +
          '<div class = "offset6 span2 pull-right" style = "color:white;text-align: center;">'+
            '<div class = "tagsGroup">';
      }
    var posttags = sortTags(post.tags); 
    var length = Math.min(4,posttags.length);       
    for(var tagNumber = 0; tagNumber <length; tagNumber++){
        if(tagNumber == 0){
            html = html +'<a class = "tagHead posttag" tag = '+posttags[tagNumber]+'><li class = "icon-tag pull-left"></li>&nbsp;'+posttags[tagNumber]+'</a>';
        }else{
            html = html +'<a class = "posttag tags" tag = '+posttags[tagNumber]+'><li class = "icon-tag pull-left"></li>&nbsp;'+posttags[tagNumber]+'</a>';
        }
    }
    html = html+
    '</div>'+
    '</div>'+
    '</div>'+
    '<div class = "row-fluid">'+
    '<div class = "offset1 span10 offset2">'+
    '<pre class = "length-limited" style = "font-family: \'Lato\', sans-serif;font-weight:300;">'+post.postContent+'</pre>'+
    '</div>'+
    '</div>'+
    '<div class="row-fluid pictureArea" style = "margin-left:2%;">'+
    '</div>'+
    '<div class = "row-fluid shareButtons" style = "margin-top:10px;">'+
      /*'<div class = "offset1 span1"><button class = "btn button" style = "width:50px;"><i class = "icon-thumbs-up"></i>0</button></div>'+
      '<div class = "span1"><button class = "btn button" style = "width:50px;margin-left:10px;"><i class = "icon-share"></i></button></div>';
      html=html+*/
    '</div>';
    if(post.replies_no > 0){
      html = html +
        '<div class = "row-fluid repliesArea" style = "margin-top:10px;">'+
        '<div class="accordion" id="reply'+post.id+'" style = "background-color:white;margin-bottom: 0px;">'+
        '<div class="accordion-group" style = "border:none;">'+
        '<div class="accordion-heading" style = "text-align: center;">'+
        '<a class="accordion-toggle" data-toggle="collapse" data-parent="#reply'+post.id+'" href="#collapse'+post.id+'">';
        if(post.replies_no == 1){
          html = html + post.replies_no+' reply';
        }else{
          html = html + post.replies_no+' replies';          
        }
        html = html+
        '</a>'+
        '</div>'+
        '<div id = "collapse'+post.id+'" class="accordion-body collapse">'+
        '<div class="accordion-inner">'+
        '<ul class ="scroller" style = "max-height:250px;overflow: scroll;">';
        for(var i = 0; i < post.replies_no;i++){
            var rtime = convertUTCDateToLocalDate((post.replies)[i].date,(post.replies)[i].time);
            html = html +
            '<li id ="'+post.pid+''+(post.replies)[i].rid+'" rid="'+(post.replies)[i].rid+'" class = "row-fluid replyBody">'+
                '<img class = "span1" id = "replyAvarta'+post.pid+''+(post.replies)[i].rid+'"  src = "#" style = "border-radius:20px;width:40px;height:40px;">'+
                '<div class = "span8">'+
                '<div class = "row-fluid">'+
                '<strong><a href = "#" class = "userName replier" name = "'+(post.replies)[i].replier_name+'" uid = "'+(post.replies)[i].replier_uid+'">'+(post.replies)[i].replier_name+'</a></strong>'+
                '&nbsp; to &nbsp;'+
                '<strong><a href = "#" class = "userName replyto" name = "'+(post.replies)[i].replyto_name+'" uid = "'+(post.replies)[i].replyto_uid+'">'+(post.replies)[i].replyto_name+'</a></strong>'+
                '&nbsp;&nbsp;<font>'+rtime[0]+'&nbsp;'+rtime[1]+'</font>'+
                '</div>'+
                '<div>'+
                '<pre class = "length-limited">'+(post.replies)[i].replyContent+'</pre>'+
                '</div>'+
                '</div>'+
                '<div class = "span1">';
                if((post.replies)[i].replier_uid != localStorage.uid){
                  html=html+
                  '<button class = "btn btn-link pull-right replyLink" style ="padding:inherit;">reply</button>';
                }
                html=html+
                '</div>'+
                '<div class = "span1">';
                if(post.uid==localStorage.uid||(post.replies)[i].replier_uid==localStorage.uid){
                  html = html+'<a class="close removereply" data-toggle = "modal" href="#removeReplyModal">&times;</a>';
                }
                html=html+
                '</div>'+
              '</li>';
        }
      html = html +
        '</ul>'+
        '</div>'+
        '</div>'+
        '</div>'+
        '</div>'+
      '</div>';
    }
    html = html +
    '<hr>'+
    '<div class = "row-fluid" style = "margin-bottom:10px;">'+
    '<div class = "span1">'+
    '<img class = "selfProfileSmallAvarta" src = '+localStorage.self_small_avarta+' style = "width:36px;height:36px;border-radius:18px;margin-left:10px;">'+
    '</div>'+
    '<div class= "span11" style = "padding-left:10px;padding-right:20px;">'+
    '<textarea class = "input-block-level replyInput" replyToUid = "'+post.uid+'" replyToName = "'+post.poster_name+'" type = "text" placeholder = "Add Comments here..." style = "min-height:70px;border-radius:0px;"></textarea>'+
    '<button class = "btn replyCancel pull-right button" style = "margin-left:10px;">Cancel</button>'+
    '<button class = "btn btn-success replySubmit pull-right button" disabled>Post</button>'+
    '</div>'+
    '</div>'+
  '</div>';
  return html;
}

function renderSchedule(schedule,isManager){
  var html =  
        '<tr eid = '+schedule.eid+' uid= '+schedule.uid+' id= '+schedule.sid+'>'+
          '<td>'+
            '<div class="media">'+
              '<div class="media-body">'+
                '<h4 class="media-heading" style = "color:gray;font-size:13px;">From <strong style = "color:green;font-size:17.5px;">'+print_date(schedule.start_date)+' '+print_time(schedule.start_time).substring(0,5)+'</strong> to <strong style = "color:red;font-size:17.5px;">'+print_date(schedule.end_date)+" "+print_time(schedule.end_time).substring(0,5)+'</strong> at <strong style = "color:black;font-size:17.5px;">'+schedule.place+'</strong>';
                if(isManager || localStorage.uid == schedule.uid){
                  html = html + '<button class="close pull-right" data-toggle="modal" href = "#removeModal" sid = "'+schedule.sid+'">&times;</button></h4>';
                }
                html = html +
                '<div class="media" style = "font-size:15px;">'+
                schedule.description+
                '</div>'+
              '</div>'+
            '</div>'+
          '</td>'+       
        '</tr>';
  return html;
}

function createPost(data){
  $.ajax({
    url:"/createpost",
    data:JSON.stringify(data),
    type:"POST",
    contentType: 'application/json',
    success:function(result){
      if(result.status == "successful"){
        if(postOrder == 0){
          $('#left-column').prepend(renderPost(result.post));
          postOrder = 1;
        }else{
          $('#right-column').prepend(renderPost(result.post));
          postOrder = 0;
        }
        $('#postArea').val("");
        $('#postModal').modal("hide");
        $(".tagsGroup").width("+=10");
        $(".tagsGroup a").hide();
        $('.tagHead').show();
        adjustTags(); 
        $("#postTags").tagsinput("removeAll");   
        $('#floatingBarsG-post').hide();
        $("#contentBody").find(".well").hide();
        $("#postSubmit").removeAttr("disabled");
        if(result.post.picids && result.post.picids.length > 0){
          var pictureData  = {};
          pictureData.session_key = localStorage.session_key;
          pictureData.uid = localStorage.uid;
          pictureData.picids = result.post.picids;
          $.ajax({
            url:'/getpictures',
            data:JSON.stringify(pictureData),
            type:"POST",
            contentType:"application/json",
            success:function(data){
              if(data.pics && data.pics.length > 0){
                console.log("picture url is:");
                console.log(data.pics[0]);
                var postid = result.post.uid+""+result.post.eid+""+result.post.pid;
                $("#"+postid).find(".pictureArea").append("<img src = '"+data.pics[0]+"' style = 'width:96%;'/>");
              }else{
                console.log("failed to get the picture of this post");
              }
            }
          });
        }
      }
    }
  });
}

function member(member,type){
  var userAvartaData = {};
  userAvartaData.view_uid = member.uid;
  userAvartaData.session_key = localStorage.session_key;
  userAvartaData.uid = localStorage.uid;
  $.ajax({
    url:'/getusersmallavarta',
    data:JSON.stringify(userAvartaData),
    type:"POST",
    contentType:"application/json",
    success:function(data){
      console.log(data.avarta);
      $("#memberAvarta"+member.uid).attr("src",data.avarta);
      //$("div.chat-window[chatId='"+element.uid+"']").attr("url",data.avarta);
    }
  });
  var html = 
    '<div class = "row-fluid member" style = "margin:5px;">'+
      '<img id = "memberAvarta'+member.uid+'" class = "member_small_avarta span6" src = "" style = "border-radius:30px;width:60px;height:60px;">'+
      '<div class = "span6">'+
        '<a href="#" class = "memberItem userName" name = "'+member.nickname+'" uid = "'+member.uid+'" style = "text-decoration: none;">'+
          '&nbsp;&nbsp;'+member.nickname+
        '</a>';
        if(member.uid != localStorage.uid){
           if(type == "member"){        
            html = html +
            '<div class = "row-fluid" style = "margin-top:5px;">'+
            '<button class = "promoteMember btn btn-primary span6" style = "border-radius: 15px;width: 30px;height: 30px;padding-left: 7px;" disabled><i class = "icon-hand-up icon-white"></i></button>'+
            '<button class = "deleteMember btn btn-danger span6" style = "margin-left:5px;border-radius: 15px;width: 30px;height: 30px;padding-left: 7px;" data-toggle="modal" href = "#deleteModal"><i class = "icon-remove icon-white"></i></button>';
            '</div>';
          }else if(type == "manager"){
            html = html +
            '<div class = "row-fluid" style = "margin-top:5px;">'+
            '<button class = "promoteMember btn btn-danger span6" style = "border-radius: 15px;width: 30px;height: 30px;padding-left: 7px;margin-left:5px;" disabled><i class = "icon-hand-down icon-white"></i></button>'+
            '</div>';
          }
        }
        html = html +
      '</div>'+
    '</div>';
  return html;
}

function renderMember(user){
  var html = '<a href="#" class = "memberItem row-fluid" name = "'+user.nickname+'" uid = "'+user.uid+'"><img id = "memberAvarta'+user.uid+'" class = "member_small_avarta span4" src = "#" style = "border-radius:15px;width:30px;height:30px;display:block;overflow:hidden;text-overflow:ellipsis;">&nbsp;&nbsp;<font class="span8" style = "display:block;overflow:hidden;text-overflow:ellipsis;font-family: \'Lato\', sans-serif;font-weight:300;">'+user.nickname+'</font></a>';
  return html;
}

function renderFriend(friend){
  var html = '<a href="#" class = "row-fluid" name = "'+friend.nickname+'" uid = "'+friend.uid+'" style = "padding:5px;font-size:0.8em;"><img id = "friendAvarta'+friend.uid+'" class = "friend_small_avarta span4" src = "#" style = "border-radius:15px;width:30px;height:30px;">&nbsp;&nbsp;<font class = "friendItem span8" style = "display:block;overflow:hidden;text-overflow:ellipsis;font-family: \'Lato\', sans-serif;font-weight:300;">'+friend.nickname+'</font></a>';
  return html;
}
function userlist(usersData,type){
    $.ajax({
           url:"/getusersinfo",
           data:JSON.stringify(usersData),
           type:"POST",
           contentType:'application/json',
           success:function(result){
             console.log("users:");
             console.log(result);
             if(result.status == "successful"){
                if(type == "friend" || type == "user"){
                  $("#squaresWaveG-friend").hide();
                  $("#squaresWaveG-commonFriend").hide();
                  var commonFriendsList = localStorage.common_friends.trim().split(",");
                  $.each(result.source,function(index,element){
                    var userAvartaData = {};
                    userAvartaData.view_uid = element.uid;
                    userAvartaData.session_key = localStorage.session_key;
                    userAvartaData.uid = localStorage.uid;
                    userAvartaData.time = getCurrentTime();
                    userAvartaData.date = getCurrentDate();
                    if(checkMutual(commonFriendsList,element.uid)){
                      $("#commonFriendsList").append(renderFriend(element));
                    }else{
                      $("#friendsList").append(renderFriend(element));
                    }
                    $.ajax({
                      url:'/getuseravarta',
                      data:JSON.stringify(userAvartaData),
                      type:"POST",
                      contentType:"application/json",
                      success:function(data){
                        $("#friendAvarta"+element.uid).attr("src",data.avarta);
                        //$("div.chat-window[chatId='"+element.uid+"']").attr("url",data.avarta);
                        $.each($(".chatAvarta"+element.uid),function(index,element){
                          $(element).attr("src",data.avarta);
                        });
                      }
                    });
                  });
                }else if(type == "event"){
                  $("#squaresWaveG-member").hide();
                  $.each(result.source,function(index,element){
                        var userAvartaData = {};
                        userAvartaData.view_uid = element.uid;
                        userAvartaData.session_key = localStorage.session_key;
                        userAvartaData.uid = localStorage.uid;
                        userAvartaData.time = getCurrentTime();
                        userAvartaData.date = getCurrentDate();
                        $("#membersList").append(renderMember(element));
                        $.ajax({
                          url:'/getuseravarta',
                          data:JSON.stringify(userAvartaData),
                          type:"POST",
                          contentType:"application/json",
                          success:function(data){
                            $("#memberAvarta"+element.uid).attr("src",data.avarta);
                          }
                      });
                  });
                }
             }
           }
    });//get usersinfo
}

function renderSubNavBar(){
  if(localStorage.usertags){
    var tagsList = localStorage.usertags.split(",");
    for(var index = 0; index <  Math.min(4,tagsList.length); index++){
      $($("#subNavBar").find("li")[index+1]).html('<a class = "usertag" href="#" tag = '+tagsList[index]+'>'+tagsList[index]+'</a>');
    }
  }
}

function renderEvent(event){
  var html = '<a href="#" class = "row-fluid" ename = "'+event.name+'" eid = "'+event.eid+'" style = "padding:5px;font-size:0.8em;"><img id = "eventAvarta'+event.eid+'" class = "event_small_avarta span4" src = "#"  style = "border-radius:15px;width:30px;height:30px;">&nbsp;&nbsp;<font style = "display:block;overflow:hidden;text-overflow:ellipsis;width;font-family: \'Lato\', sans-serif;font-weight:300;" class = "eventItem span8">'+event.name+'</font></a>';
  return html;
}
function eventlist(eventData){
  $.ajax({
    url:"/geteventsinfo",
    data:JSON.stringify(eventData),
    type:"POST",
    contentType:'application/json',
    success:function(result){
        console.log("events information:");
        console.log(result);
        if(result.status == "successful"){
            $("#squaresWaveG-event").hide();
            $.each(result.source,function(index,element){
              var eventAvartaData = {};
              eventAvartaData.view_uid = element.uid;
              eventAvartaData.session_key = localStorage.session_key;
              eventAvartaData.uid = localStorage.uid;
              eventAvartaData.time = getCurrentTime();
              eventAvartaData.date = getCurrentDate();
              //TO DO: change to add avarta
              $("#eventsList").append(renderEvent(element));
              $.ajax({
                url:'/geteventavarta',
                data:JSON.stringify(eventAvartaData),
                type:"POST",
                contentType:"application/json",
                success:function(data){
                  console.log("event avarta data:");
                  console.log(data);
                  $("#eventAvarta"+element.eid).attr("src",data.avarta);
                }
              });
            });
        }
     }
  });
}

function renderReply(reply){
  var html =
    //TO DO: make up the id content
    '<li id = "" class = "row-fluid replyBody">'+
      '<img ';
      if(reply.replier_uid != localStorage.uid){
        html = html + 'class="span1 selfProfileSmallAvarta"';
      }else{
        html = html + 'class="span1"';
      }
      html = html + 
      'src = "'+localStorage.self_small_avarta+'" style = "border-radius:20px;width:40px;height:40px;">'+
      '<div class = "span8">'+
          '<div class = "row-fluid">'+
            '<strong><a href = "#" class = "userName" name = "'+reply.replier_name+'" uid = "'+reply.replier_uid+'" style = "font-family: \'Lato\', sans-serif;font-weight:300;">'+reply.replier_name+'</a></strong>'+
            '&nbsp; to &nbsp;'+
            '<strong><a href = "#" class = "userName" name = "'+reply.replyto_name+'" uid = "'+reply.replyto_uid+'" style = "font-family: \'Lato\', sans-serif;font-weight:300;">'+reply.replyto_name+'</a></strong>'+
            '&nbsp;&nbsp;<font>'+reply.date+'&nbsp;'+reply.time+'</font>'+
          '</div>'+
          '<div class = "row-fluid">'+
            '<p style = "font-family: \'Lato\', sans-serif;font-weight:300;">'+reply.replyContent+'</p>'+
          '</div>'+
      '</div>'+
      '<div class = "span1">';
      if(reply.replier_uid != localStorage.uid){
        html=html+
        '<button class = "btn btn-link pull-right replyLink" style ="padding:inherit;font-family: \'Lato\', sans-serif;font-weight:300;">reply</button>';
      }
      html=html+
      '</div>'+
      '<div class = "span1">'+
      '</div>'+
    '</li>';
  return html;
}

function renderSearchEvents(event){
    var html =
    '<div class = "row-fluid postRoot" uid = "'+event.eid+'" style = "background-color:#FFFFFF;margin-bottom:10px;">'+
      '<div class = "row-fluid" style = "margin-top:10px;">'+
        '<div class = "span6 row-fluid" style = "text-align: center;">'+
          '<div class = "span4">'+
            '<img src = "/img/event_default.png" style = "width:30px;height:30px;border-radius:15px;">'+
          '</div>'+
          '<div class = "span8" style = "text-align:left;">'+
            '<a href = # class = "eventName" name = "'+event.name+'" eid = "'+event.eid+'" style = "text-overflow:ellipsis;overflow:hidden;width:150px;display:block;font-family: \'Lato\', sans-serif;font-weight:300;">'+event.name+'</a>'+
            '<p style = "font-size:12px;margin-bottom:0px;color:#999;font-family: \'Lato\', sans-serif;font-weight:300;">ID:'+event.eid+'</p>'+
            '<p style = "font-size:12px;color:#999;font-family: \'Lato\', sans-serif;font-weight:300;">'+event.city+'</p>'+
          '</div>'+
        '</div>'+
        '<div class = "offset4 span2" style = "color:white;text-align: center;">'+
          '<div class = "tagsGroup">';
    var tagCounter = Math.min(4,event.tags.length);
    var eventtags = sortTags(event.tags);
    for(var tagNumber = 0; tagNumber < tagCounter; tagNumber++){
        if(tagNumber == 0){
            html = html +'<a class = "tagHead eventtag" tag = '+eventtags[tagNumber]+'><li class = "icon-tag pull-left"></li>&nbsp;'+eventtags[tagNumber]+'</a>';
        }else{
            html = html +'<a class = "eventtag tags" tag = '+eventtags[tagNumber]+'><li class = "icon-tag pull-left"></li>&nbsp;'+eventtags[tagNumber]+'</a>';
        }
    }
    html = html+
          '</div>'+
        '</div>'+
      '</div>'+
      '<div class = "row-fluid">'+
        '<div class = "span4"><font class ="pull-right" style = "font-family: \'Lato\', sans-serif;font-weight:400;">Description: </font></div>'+
        '<div class = "span7" style ="font-family: \'Lato\', sans-serif;font-weight:300;">'+event.description+'</div>'+
      '</div>'+
    '<div class = "row-fluid" style = "margin-top:10px;">';
    if(checkEvent(event.eid)){
      html = html + '<div class = "offset1 span11"><button class = "btn btn-link joinevent pull-right" id = "'+event.eid+'" style = "cursor:pointer;font-family: \'Lato\', sans-serif;font-weight:300;">+ Join</button></div>';
    }
    html = html+
    '</div>'+
    '</div>';
    return html;
}

function renderSearchUser(user){
    //user.id = user.uid+""+post.eid+""+post.pid;
    if(user.gender == "Others"){
      user.gender = "Secret";
    }
    var html =
    '<div class = "row-fluid postRoot" uid = "'+user.uid+'" style = "background-color:#FFFFFF;margin-bottom:10px;">'+
      '<div class = "row-fluid" style = "margin-top:10px;height:50px;">'+
        '<div class = "span5 row-fluid" style = "text-align: center;">'+
          '<div class = "span4">'+
            '<img class = "user_small_avarta'+user.uid+'" src = "#" style = "width:30px;height:30px;border-radius:15px;">'+
          '</div>'+
          '<div class = "span8" style = "text-align:left;">';
          if(user.nickname != ""){
            html = html + '<a href = # class = "userName" name = "'+user.nickname+'" uid = "'+user.uid+'" style = "text-overflow:ellipsis;overflow:hidden;width:150px;display:block;font-family: \'Lato\', sans-serif;font-weight:300;">'+user.nickname+'</a>';
          }else{
            html = html + '<a href = # class = "userName" name = "User" uid = "'+user.uid+'" style = "font-family: \'Lato\', sans-serif;font-weight:300;">User</a>';
          }
          html = html +
            '<p style = "font-size:12px;color:#999;margin-bottom:0px;font-family: \'Lato\', sans-serif;font-weight:300;">ID:'+user.uid+'</p>'+
            '<p style = "font-size:12px;color:#999;font-family: \'Lato\', sans-serif;font-weight:300;">'+user.gender+'<br>'+user.city+'</p>'+
          '</div>'+
        '</div>'+
        '<div class = "offset5 span2" style = "color:white;text-align: center;">'+
          '<div class = "tagsGroup">';
            var usertags = sortTags(user.tags);
            var tagCounter = Math.min(4,usertags.length);
            for(var tagNumber = 0; tagNumber < tagCounter; tagNumber++){
                if(tagNumber == 0){
                    html = html +'<a class = "tagHead usertag" tag = '+usertags[tagNumber]+'><li class = "icon-tag pull-left"></li>&nbsp;'+usertags[tagNumber]+'</a>';
                }else{
                    html = html +'<a class = "usertag tags" tag ='+ usertags[tagNumber]+'><li class = "icon-tag pull-left"></li>&nbsp;'+usertags[tagNumber]+'</a>';
                }
            }
    html = html+
          '</div>'+
        '</div>'+
      '</div>'+
    '<div class = "row-fluid" style = "margin-top:10px;">';
    if(checkFriend(user.uid)){
      html = html + '<div class = "offset1 span11"><button class = "btn btn-link addfriend pull-right" id = "'+user.uid+'" style = "cursor: pointer;font-family: \'Lato\', sans-serif;font-weight:300;">+ Add</button></div>';
    }
    html = html +
    '</div>'+
    '<div class = "row-fluid" style="margin-top:10px;">'+
      '<div class = "offset1 span10 offset1" style = "text-align: center;"><a style = "text-decoration:none;font-family: \'Lato\', sans-serif;font-weight:300;">You have '+user.common_friends.length+' common friends</a></div>'+
    '</div>'+
    '</div>';
    return html;
}

function renderProfile(){
  $("#name").html(localStorage.username);
  $("#nickname").html(localStorage.usernickname);
  $("#birthday").html(print_date(localStorage.raw_birthday));
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
  $("#country").html(localStorage.country);
  $("#city").html(localStorage.city);
  $("#tags").html("");
  $("#hidden_tags").html("");
  if(localStorage.usertags == ""){
    $('#tags').append("<font>None</font>");
  }else{
    $.each(localStorage.usertags.split(','),function(index,element){
      $('#tags').append("<span class='label label-info' style = 'margin-left:5px;'>"+element+"</span>");
    });
  }
  if(localStorage.hiddentags == ""){
    $('#hidden_tags').append("<font>None</font>");
  }else{
    $.each(localStorage.hiddentags.split(','),function(index,element){
      $('#hidden_tags').append("<span class='label label-info' style = 'margin-left:5px;'>"+element+"</span>");
    });
  }
}
function renderEventProfile(){
    $("#name").html(localStorage.ename);
    $("#creator").html(localStorage.ecreator);
    $("#description").html(localStorage.description);
    if(localStorage.etags == ""){
        $('#tags').append("<font>None</font>");
    }else{
        $.each(localStorage.etags.split(','),function(index,element){
               $('#tags').append("<span class='label label-info' style = 'margin-left:5px;'>"+element+"</span>");
               });
    }
    $("#rating").html(localStorage.erating);
    $("#city").html(localStorage.ecity);


}
function renderUpdate(){
    var match = localStorage.raw_birthday.toString().match(/(\d{4})(\d{2})(\d{2})/);
    var betterDateStr = match[1] + '-' + match[2] + '-' + match[3];
    $("#inputName").val(localStorage.username);
    $("#inputNickName").val(localStorage.usernickname);
    $("#inputBirthday").val(betterDateStr);
    if(localStorage.gender){
      $("#inputGender").attr("value",localStorage.gender);
    }
    $('#inputGender option:selected').attr('selected', false);
    switch(localStorage.gender){
      case 0:
        $('#inputGender option:eq(1)').attr('selected', 'selected');
      break;
      case 1:
        $('#inputGender option:eq(0)').attr('selected', 'selected');
      break;
      default:
        $('#inputGender option:eq(2)').attr('selected', 'selected');
      break;
    }
    $("#inputState").val(localStorage.state);
    $("#inputCountry").val(localStorage.country);
    $("#inputCity").val(localStorage.city);
    var tags = localStorage.usertags.split(",");
    var hiddentags = localStorage.hiddentags.split(",");
    $("#inputTags").tagsinput("removeAll");
    $("#inputHiddenTags").tagsinput("removeAll");
    $.each(tags, function(index, element){
      $("#inputTags").tagsinput("add",element);
    });
    $.each(hiddentags, function(index, element){
      $("#inputHiddenTags").tagsinput("add",element);
    });
    $(".bootstrap-tagsinput").find("input").attr("placeholder","Add").attr("size",8);
}

function renderEventUpdate(){
    $("#inputName").val(localStorage.ename);
    $("#inputCity").val(localStorage.ecity);
    console.log(localStorage.ename);
    var tags = localStorage.etags.split(",");
    $("#inputTags").tagsinput("removeAll");
    $.each(tags, function(index, element){
           $("#inputTags").tagsinput("add",element);
           });
    $(".bootstrap-tagsinput").find("input").attr("placeholder","Add").attr("size",8);
}

/************* end render functions **********/

/************* general functions **********/

function viewpost(pids,char,newsData){
    if(pids.length != 0){
        $("#contentBody").find(".well").hide();
        $("#loadMoreButton").hide();
        $("#circularG").show();
        var loadingFlag = true;
        pidsets = pids;
        var postData = {};
        postData.session_key = localStorage.session_key;
        postData.uid = localStorage.uid;
        postData.uidList = [];
        postData.eidList = [];
        postData.pidList = [];
        for(var i = 0; i < Math.min(6,pidsets.length); i++){
            postData.uidList[i] = pidsets[i][0];
            postData.eidList[i] = pidsets[i][1];
            postData.pidList[i] = pidsets[i][2];
        }
        postCounter = Math.min(postCounter+6,pidsets.length);
        $.ajax({
           url:"/getpostscontent",
           data:JSON.stringify(postData),
           type:"POST",
           contentType: 'application/json',
           success:function(result){
           //console.log("posts content:");
           //console.log(result);
            if(result.status == "successful"){
              $("#contentBody").find(".well").hide();
              console.log(result.source);
              $.each(result.source,function(index,element){
                    var postAvartaData = {};
                    postAvartaData.session_key = localStorage.session_key;
                    postAvartaData.uid = localStorage.uid;
                    postAvartaData.view_uid = element.uid;
                    var replyAvartaData = {};
                    replyAvartaData.session_key = localStorage.session_key;
                    replyAvartaData.uid = localStorage.uid;
                    if(parseInt($('#left-column').css('height'),10) > parseInt($('#right-column').css('height'),10)){
                      $('#right-column').append(renderPost(element));
                    }else{
                      $('#left-column').append(renderPost(element));
                    }
                    //retrieve the pics of the element if any.
                    if(element.picids && element.picids.length > 0){
                      console.log("element:");
                      console.log(element);
                      console.log(element.picids);
                      console.log(element.picids.length);
                      var pictureData  = {};
                      pictureData.session_key = localStorage.session_key;
                      pictureData.uid = localStorage.uid;
                      pictureData.picids = element.picids;
                      $.ajax({
                        url:'/getpictures',
                        data:JSON.stringify(pictureData),
                        type:"POST",
                        contentType:"application/json",
                        success:function(data){
                          if(data.pics && data.pics.length > 0){
                            console.log("picture url is:");
                            console.log(data.pics[0]);
                            var postid = element.uid+""+element.eid+""+element.pid;
                            $("#"+postid).find(".pictureArea").append("<img src = '"+data.pics[0]+"' style = 'width:96%;'/>");
                          }else{
                            console.log("failed to get the picture of this post");
                          }
                        }
                      });
                    }
                    //retrieve the avatar of the poster
                    $.ajax({
                           url:'/getuseravarta',
                           data:JSON.stringify(postAvartaData),
                           type:"POST",
                           contentType:"application/json",
                           success:function(data){
                             //TO DO: render the user's avarta into home page
                             $("#post_user_avarta"+element.pid).attr("src",data.avarta);
                           }
                    });
                    $.each(element.replies,function(replyIndex,reply){
                      replyAvartaData.view_uid = reply.replier_uid;
                      replyAvartaData.time = 0000//getCurrentTime();
                      replyAvartaData.date = 00000000//getCurrentDate();
                      $.ajax({
                             url:'/getuseravarta',
                             data:JSON.stringify(replyAvartaData),
                             type:"POST",
                             contentType:"application/json",
                             success:function(data){
                               $("#replyAvarta"+element.pid+""+reply.rid).attr("src",data.avarta);
                             }
                      });
                    });
              });
              $(".tagsGroup").width("+=10");
              $(".tagsGroup a").hide();
              $('.tagHead').show();
              adjustTags();
              $("#loadMoreButton").show();
              $("#circularG").hide();
              $(window).scroll(function(){
                if($(window).scrollTop() + $(window).height() == $(document).height() && loadingFlag){
                  getMorePosts(char,newsData);
                }
              });
            }
           }
        });
    }else{
      $("#contentBody").find(".well").show();
      $("#circularG").hide();
    }
}

function searchUser(searchData,loadOrder){
  userCounter = 0;
  $.ajax({
    url:"/searchuserbyfilter",
    data:JSON.stringify(searchData),
    type:"POST",
    contentType: 'application/json',
    success:function(data){
      if(data.uids.length != 0){
        console.log(searchData.filter);
        console.log("searchuser byfilter result:");
        console.log(data);
        var friendsData = {};
        friendsData.uidList = [];
        friendsData.session_key = localStorage.session_key;
        friendsData.uid = localStorage.uid;
        uids=data.uids;
        console.log("userCounter before:"+userCounter);
        for(var i = 0; i < Math.min(6,uids.length); i++){
          friendsData.uidList[i] = uids[i];
        }
        userCounter = Math.min(userCounter+6,uids.length);
        console.log("userCounter after:"+userCounter);
        if(userCounter<uids.length){
          loadingFlag=true;
        }
        $.ajax({
          url:"/getusersinfo",
          data:JSON.stringify(friendsData),
          type:"POST",
          contentType:'application/json',
          success:function(result){
            if(result.status == "successful"){
              $.each(result.source,function(index,element){
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
                var userAvartaData = {};
                userAvartaData.session_key = localStorage.session_key;
                userAvartaData.uid = localStorage.uid;
                userAvartaData.view_uid = element.uid;
                userAvartaData.time = 0000//getCurrentTime();
                userAvartaData.date = 00000000//getCurrentDate();
                $.ajax({
                  url:'/getuseravarta',
                  data:JSON.stringify(userAvartaData),
                  type:"POST",
                  contentType:"application/json",
                  success:function(data){
                    $(".user_small_avarta"+element.uid).attr("src",data.avarta);
                  }
                });
                $(".tagsGroup a").hide();
                $('.tagHead').show();
                adjustTags();
                $("#loadMoreButton").show();
                $("#circularG").hide();
                $(window).scroll(
                  function(){
                    if($(window).scrollTop() + $(window).height() == $(document).height() && loadingFlag) {
                      getMoreUsers();
                    }
                });
              });
            }else{
              $("#loadMoreButton").show();
              $("#circularG").hide();
            }
          }
        });//get usersinfo
      }else{
        $("#loadMoreButton").hide();
        $("#circularG").hide();
        $("#search_result").html("");
        $("#search_result").css("text-align","center");
        $("#search_result").append("<strong>No Matched result found.</strong>");
      }   
    }//success
  });//ajax
}

function searchEvents(searchData,loadOrder){
  $.ajax({
    url:"/searcheventbyfilter",
    data:JSON.stringify(searchData),
    type:"POST",
    contentType: 'application/json',
    success:function(data){
      if(data.eids.length != 0){
        console.log("searcheventbyfilter result:");
        console.log(data);
        var eventsData = {};
        eventsData.eidList = [];
        eventsData.session_key = localStorage.session_key;
        eventsData.uid = localStorage.uid;
        eids=data.eids;
        for(var i = 0; i < Math.min(6,eids.length); i++){
          eventsData.eidList[i] = eids[i];
        }
        eventCounter = Math.min(eventCounter+6,eids.length);
        if(eventCounter<eids.length){
          loadingFlag=true;
        }
        $.ajax({
          url:"/geteventsinfo",
          data:JSON.stringify(eventsData),
          type:"POST",
          contentType:'application/json',
          success:function(result){
            if(result.status == "successful"){
              $.each(result.source,function(index,element){
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
                $(".tagsGroup a").hide();
                $('.tagHead').show();
                adjustTags();
                $("#loadMoreButton").show();
                $("#circularG").hide();
                $(window).scroll(
                  function(){
                    if($(window).scrollTop() + $(window).height() == $(document).height() && loadingFlag) {
                      getMoreEvents();
                    }
                });
              });
            }else{
              $("#loadMoreButton").show();
              $("#circularG").hide();
            }
          }
        });//get eventsinfo  
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

function friendRequestNotification(userName, userId, eventId, postId, action, seqNo){
  var html = "";
  switch(action){
    case 0:
      html = '<li seqNo = "'+seqNo+'" uid = "'+userId+'" eid = "'+eventId+'" pid = "'+postId+'" tabindex="-1" class = "notificationItem friendRequestNotification unread">'+
                '<i class="icon-user"></i>'+
                '&nbsp;&nbsp;<span class = "websiteFont"><a class = "userName user'+userId+'" uid = "'+userId+'">'+userName+'</a> have approved your friend request.</span>&nbsp;'+
                '<button class = "btn btn-primary pull-right friendResponse" style = "border-radius:15px;padding:2px 6px 3px;width:30px;height:28px;"><i class = "icon-thumbs-up icon-white"></i></button>'+
              '</li>';
      break;
    case 1:
      html = '<li seqNo = "'+seqNo+'" uid = "'+userId+'" eid = "'+eventId+'" pid = "'+postId+'" tabindex="-1" class = "notificationItem friendRequestNotification unread">'+
                '<i class="icon-user"></i>'+
                '&nbsp;&nbsp;<span class = "websiteFont"><a class = "usernName user'+userId+'" uid = "'+userId+'">'+userName+'</a> have rejected your friend request.</span>&nbsp;'+
                '<button class = "btn btn-primary pull-right friendResponse" style = "border-radius:15px;padding:2px 6px 3px;width:30px;height:28px;"><i class = "icon-thumbs-up icon-white"></i></button>'+
              '</li>';
      break;
    case 2:
      html = '<li seqNo = "'+seqNo+'" uid = "'+userId+'" eid = "'+eventId+'" pid = "'+postId+'" tabindex="-1" class = "notificationItem friendRequestNotification unread">'+
                '<i class="icon-user"></i>'+
                '&nbsp;&nbsp;<span class = "websiteFont"><a class = "userName user'+userId+'" uid = "'+userId+'">'+userName+'</a> sends a friend request to you.</span>&nbsp;&nbsp;'+
                '<button class = "btn pull-right rejectFriendRequest" style = "border-radius:15px;padding:2px 6px 3px;"><i class = "icon-remove"></i></button>'+
                '<button class = "btn btn-success pull-right approveFriendRequest" style = "border-radius:15px;padding:2px 6px 3px;margin-right:3px;"><i class = "icon-ok icon-white"></i></button>'+
             '</li>';
      break;
  }
  return html;
}

function eventJoinRequestNotification(userName, userId, postId, eventName, eventId, action, seqNo){
  var html = "";
  switch(action){
    case 0:
      html = '<li seqNo = "'+seqNo+'" uid = "'+userId+'" eid = "'+eventId+'" pid = "'+postId+'" tabindex="-1" class = "notificationItem eventJoinRequestNotification unread row-fluid">'+
                '<p class = "span10 websiteFont" style = "white-space:pre-wrap;margin-bottom:0px;"><i class="icon-calendar"></i>'+
                '<a class = "userName user'+userId+'"  uid = "'+userId+'" style = "margin-left:6px;">'+userName+'</a> has approved your event request for <a class = "eventName '+eventId+'" eid = "'+eventId+'">'+eventName+'</a>.</p>'+
                '<button class = "btn btn-primary pull-right span2 eventResponse" style = "border-radius:15px;padding:2px 6px 3px;width:30px;height:28px;"><i class = "icon-thumbs-up icon-white"></i></button>'+
              '</li>';
      break;
    case 1:
      html = '<li seqNo = "'+seqNo+'" uid = "'+userId+'" eid = "'+eventId+'" pid = "'+postId+'" tabindex="-1" class = "notificationItem eventJoinRequestNotification unread row-fluid">'+
                '<p class = "span10 websiteFont" style = "white-space:pre-wrap;margin-bottom:0px;"><i class="icon-calendar"></i>'+
                '<a class = "userName user'+userId+'"  uid = "'+userId+'" style = "margin-left:6px;">'+userName+'</a> has rejected your event request for <a class = "eventName '+eventId+'" eid = "'+eventId+'">'+eventName+'</a>.</p>'+
                '<button class = "btn btn-primary pull-right span2 eventResponse" style = "border-radius:15px;padding:2px 6px 3px;width:30px;height:28px;"><i class = "icon-thumbs-up icon-white"></i></button>'+
              '</li>';
      break;
    case 2:
      html = '<li seqNo = "'+seqNo+'" uid = "'+userId+'" eid = "'+eventId+'" pid = "'+postId+'" tabindex="-1" class = "notificationItem eventJoinRequestNotification unread row-fluid">'+
                '<p class = "span9 websiteFont" style = "white-space:pre-wrap;margin-bottom:0px;"><i class="icon-calendar"></i>'+
                '<a class = "userName user'+userId+'"  uid = "'+userId+'" style = "margin-left:6px;">'+userName+'</a> send a event request for <a class = "eventName '+eventId+'" eid = "'+eventId+'">'+eventName+'</a>.</p>'+
                '<button class = "btn pull-right rejectEventJoinRequestRequest span1" style = "border-radius:15px;padding:2px 6px 3px;width:30px;height:28px;"><i class = "icon-remove"></i></button>'+
                '<button class = "btn btn-success pull-right approveEventJoinRequest span1" style = "border-radius:15px;padding:2px 6px 3px;width:30px;height:28px;margin-right:3px;"><i class = "icon-ok icon-white"></i></button>'+
             '</li>';
      break;
  }
  return html;
}

function postReplyNotification(userName, userId, eventId, post, postId ,seqNo){
  var html = '<li seqNo= "'+seqNo+'" uid = "'+userId+'" eid = "'+eventId+'" pid = "'+postId+'" tabindex="-1" class = "notificationItem postReplyNotification unread websiteFont">'+
                '<i class="icon-list"></i>'+
                '&nbsp;&nbsp;<a id = "'+userId+'">'+userName+'</a> has replied to your post <a class = "postName" id = "'+postId+'">'+post+'</a>.'+
                '<button class = "btn pull-right btn-primary" style = "border-radius:15px;padding:2px 6px 3px;width:30px;height:28px;"><i class = "icon-thumbs-up icon-white"></i></button>'+               
             '</li>';
  return html;
}

function removeNotification(){
  var newNotificationNumber = parseInt($("#notificationNumber").html().trim()) - 1;
  $("#notificationNumber").html(" "+newNotificationNumber+" ");
  console.log(($("#notificationNumber").html()).trim());
  if(newNotificationNumber == 0){
    $("#notificationNumber").css({"color":"black","font-weight":"normal"});
    $("#notificationList").html("<li tabindex='-1' style = 'text-align:center;'>No New Notification.</li>");
  }
}

function adjustTags(){
  var parents = $('.tagsGroup').closest('.span2');
  var selves = $('.tagsGroup');
  for(var number = 0; number < parents.length;number++){
  $(selves[number]).css('margin-left',$(parents[number]).width() - $(selves[number]).width());
  }
}

function checkEvent(eid){
  if(localStorage.eventsList != null){
    var eventsList = localStorage.eventsList.split(",");
    for(var i = 0; i < eventsList.length;i++){
      if(eventsList[i] == eid){
        return false;
      }
    }
    return true;
  }else{
    return true;
  }
}

function checkFriend(view_uid){
    if(localStorage.friendsList != null){
      var friendsList = localStorage.friendsList.split(",");
      for(var i = 0; i < friendsList.length;i++){
        if(friendsList[i] == view_uid){
          return false;
        }
      }
      return true;
    }else{
      return true;
    }
}

function renderChatBox(type, id, chatBoxNumber){
  var html = "";
  switch(chatBoxNumber){
    case 0:
      html = '<div class = "chat-window" id = "chat'+id+'" url = "" position = 0 style = "right:12%;position:fixed;">';
    break;
    case 1:
      html = '<div class = "chat-window" id = "chat'+id+'" url = "" position = 1 style = "right:30%;position:fixed;">';
    break;
    case 2:
      html = '<div class = "chat-window" id = "chat'+id+'" url = "" position = 2 style = "right:48%;position:fixed;">';
    break;
    case 3:
      html = '<div class = "chat-window" id = "chat'+id+'" url = "" position = 3 style = "right:66%;position:fixed;">';
    break;
    default:
      html = '<div class = "chat-window" id = "chat'+id+'" url = "" position = '+chatBoxNumber+' style = "right:66%;position:fixed;">';
    break;
  }
  html = html +
    '<div class = "chat-window-title">'+
      '<i class="icon-remove icon-white pull-right closeChat"></i>';
      if(type == "user"){
        html = html + '<div class = "text chatName">user</div>';
      }else{
        html = html + '<div class = "text chatName">group</div>';
      }
  html = html +
    '</div>'+
    '<div class = "chat-window-content" style = "max-height:250px;overflow-y:auto;">'+
      '<div class = "chat-window-inner-content">'+
      '</div>'+
    '</div>'+
    '<div class = "chat-window-text-box-wrapper">';
    if(type == "user"){
      html = html + '<textarea turn = 0 rows="1" class="friendTextBox chat-window-text-box" style = "overflow:hidden;word-wrap:break-word;resize:none;max-height:50px;"></textarea>';
    }else{
      html = html + '<textarea turn = 0 rows="1" class="eventtTextBox chat-window-text-box" style = "overflow:hidden;word-wrap:break-word;resize:none;max-height:50px;"></textarea>';
    }
    html = html +
    '</div>'+
  '</div>';
  return html;
}

function openFriendsChatBox(session_key, selfUid, friendUid, chatBoxNumber){
  $("#chatArea").append(renderChatBox("user", friendUid, chatBoxNumber));
  $(".chat-window-text-box").elastic();
  var userData = {};
  userData.session_key = session_key;
  userData.uid = selfUid;
  userData.view_uid = friendUid;
  $.ajax({
    url:'/getuserinfo',
    data:JSON.stringify(userData),
    type:"POST",
    contentType:"application/json",
    success:function(data){
      if(data.status == "successful"){
        $("#chat"+friendUid).find(".chatName").html(data.nickname);
      }
    }
  });
  $.ajax({
    url:'/getuseravarta', 
    data:JSON.stringify(userData),
    type:"POST",
    contentType:"application/json",
    success:function(data){
      if(data.status == "successful"){
        console.log("chat avarta");
        console.log(data);
        $("#chat"+friendUid).attr("url",data.avarta);
        $(".chatAvarta"+friendUid).attr("src",data.avarta);
      }
    }
  });
}

function openEventsChatBox(session_key, selfUid, eventEid, chatBoxNumber){
  $("#chatArea").append(renderChatBox("event", eventEid, chatBoxNumber));
  $(".chat-window-text-box").elastic();
  var eventData = {};
  eventData.session_key = session_key;
  eventData.uid = selfUid;
  eventData.eid = eventEid;
  $.ajax({
    url:'/geteventinfo',
    data:JSON.stringify(eventData),
    type:"POST",
    contentType:"application/json",
    success:function(data){
      if(data.status == "successful"){
        $("#chat"+eventEid).find(".chatName").html(data.name);
      }
    }
  });
}

function getMorePosts(char,newsData){
  if(postCounter<pidsets.length){
    loadingFlag = false;
    $("#loadMoreButton").hide();
    $("#circularG").show();
    var postData = {};
    postData.session_key = localStorage.session_key;
    postData.uid = localStorage.uid;
    postData.uidList = [];
    postData.eidList = [];
    postData.pidList = [];
    for(var i = postCounter; i < Math.min(postCounter+6,pidsets.length); i++){
      postData.uidList[i-postCounter] = pidsets[i][0];
      postData.eidList[i-postCounter] = pidsets[i][1];
      postData.pidList[i-postCounter] = pidsets[i][2];
    }
    if(postCounter+6>=pidsets.length){
      console.log("postCounter");
      console.log(postCounter);
      var posturl;
      switch (char){
        case 0://self
          posturl = "/getusernews"
          break;
        case 1://user
          posturl = "/getuserposts"
          break;
        case 2://event
          posturl = "/geteventpost"
          break;
        default:
      }
      newsData.max_pid = pidsets[pidsets.length-1][2];
      console.log("Max pid");
      console.log(newsData.max_pid);
      $.ajax({
        url:posturl,
        data:JSON.stringify(newsData),
        type:"POST",
        contentType: 'application/json',
        success:function(data){
          console.log("More post:");
          //console.log(data);
          pidsets.concat(data.pidsets);
          for(var j=0;j<data.pidsets.length;j++)
            pidsets.push(data.pidsets[j]);
          console.log(pidsets);
        }
      });
    }
    postCounter = Math.min(postCounter+6,pidsets.length);
    $.ajax({
         url:"/getpostscontent",
         data:JSON.stringify(postData),
         type:"POST",
         contentType: 'application/json',
         success:function(result){
         if(result.status == "successful"){
          $.each(result.source,function(index,element){
              var postAvartaData = {};
              postAvartaData.session_key = localStorage.session_key;
              postAvartaData.uid = localStorage.uid;
              postAvartaData.view_uid = element.uid;
              var replyAvartaData = {};
              replyAvartaData.session_key = localStorage.session_key;
              replyAvartaData.uid = localStorage.uid;
              if(parseInt($('#left-column').css('height'),10) > parseInt($('#right-column').css('height'),10)){
                $('#right-column').append(renderPost(element));
              }else{
                console.log("right is large");
                $('#left-column').append(renderPost(element));
              }
              $.ajax({
                  url:'/getuseravarta',
                  data:JSON.stringify(postAvartaData),
                  type:"POST",
                  contentType:"application/json",
                  success:function(data){
                      $("#post_user_avarta"+element.pid).attr("src",data.avarta);
                  }
              });
              $.each(element.replies,function(replyIndex,reply){
                  replyAvartaData.view_uid = reply.replier_uid;
                  replyAvartaData.time = 0000//getCurrentTime();
                  replyAvartaData.date = 00000000//getCurrentDate();
                  $.ajax({
                      url:'/getuseravarta',
                      data:JSON.stringify(replyAvartaData),
                      type:"POST",
                      contentType:"application/json",
                      success:function(data){
                          $("#replyAvarta"+element.pid+""+reply.rid).attr("src",data.avarta);
                      }
                  });
              });
          });
          $(".tagsGroup").width("+=10");
          $(".tagsGroup a").hide();
          $('.tagHead').show();
          adjustTags();
          console.log("woca");
          $("#loadMoreButton").show();
          $("#circularG").hide();
          loadingFlag = true;
         }
         }
    });
  }else{
    $("#loadMoreButton").html("No More Posts");
    $("#loadMoreButton").attr("disabled","disabled");
  }
}

function getMoreUsers(){
  console.log("before:"+userCounter);
  if(userCounter<uids.length){
    console.log("fuck");
    loadingFlag = false;
    $("#loadMoreButton").hide();
    $("#circularG").show();
    var friendsData = {};
    friendsData.uidList = [];
    friendsData.session_key = localStorage.session_key;
    friendsData.uid = localStorage.uid;
    console.log("userCounter before:"+userCounter);
    for(var i = userCounter; i < Math.min(userCounter+6,uids.length); i++){
      friendsData.uidList[i-userCounter] = uids[i];
    }
    userCounter = Math.min(userCounter+6,uids.length);
    console.log("userCounter after:"+userCounter);
    $.ajax({
      url:"/getusersinfo",
      data:JSON.stringify(friendsData),
      type:"POST",
      contentType:'application/json',
      success:function(result){
        console.log("search result");
        console.log(result);
        if(result.status == "successful"){
          $.each(result.source,function(index,element){
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
            var userAvartaData = {};
            userAvartaData.session_key = localStorage.session_key;
            userAvartaData.uid = localStorage.uid;
            userAvartaData.view_uid = element.uid;
            userAvartaData.time = 0000//getCurrentTime();
            userAvartaData.date = 00000000//getCurrentDate();
            $.ajax({
              url:'/getuseravarta',
              data:JSON.stringify(userAvartaData),
              type:"POST",
              contentType:"application/json",
              success:function(data){
                $(".user_small_avarta"+element.uid).attr("src",data.avarta);
              }
            });
            $(".tagsGroup a").hide();
            $('.tagHead').show();
            adjustTags();
            $("#loadMoreButton").show();
            $("#circularG").hide();
            loadingFlag=true;                                
          });
        }else{
          $("#loadMoreButton").show();
          $("#circularG").hide();
        }
      }//success
    });
  }else{
    $("#loadMoreButton").html("No More Users");
    $("#loadMoreButton").attr("disabled","disabled");
  }
}

function getMoreEvents(){
  if(eventCounter<eids.length){
    loadingFlag = false;
    $("#loadMoreButton").hide();
    $("#circularG").show();
    var eventsData = {};
    eventsData.eidList = [];
    eventsData.session_key = localStorage.session_key;
    eventsData.uid = localStorage.uid;
    for(var i = eventCounter; i < Math.min(eventCounter+6,eids.length); i++){
      eventsData.eidList[i-eventCounter] = eids[i];
    }
    eventCounter = Math.min(eventCounter+6,eids.length);
    $.ajax({
      url:"/geteventsinfo",
      data:JSON.stringify(eventsData),
      type:"POST",
      contentType:'application/json',
      success:function(result){
        if(result.status == "successful"){
          $.each(result.source,function(index,element){
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
            $(".tagsGroup a").hide();
            $('.tagHead').show();
            adjustTags();
            $("#loadMoreButton").show();
            $("#circularG").hide();
            loadingFlag=true;
          });
        }else{
          $("#loadMoreButton").show();
          $("#circularG").hide();
        }
      }
    });
  }else{
    $("#loadMoreButton").html("No More Groups");
    $("#loadMoreButton").attr("disabled","disabled");
  }
}

(function($){ 
     $.fn.extend({  
         limit: function(limit) {
      
      var interval, f;
      var self = $(this);
          
      $(this).focus(function(){
        interval = window.setInterval(substring,100);
      });
      
      $(this).blur(function(){
        clearInterval(interval);
        substring();
      });
      
      substringFunction = "function substring(){ var val = $(self).val();var length = val.length;if(length > limit){$(self).val($(self).val().substring(0,limit));}}";      
      eval(substringFunction);
          
      substring();
      
        } 
    }); 
})(jQuery);
