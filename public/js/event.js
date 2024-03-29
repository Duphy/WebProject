if(!localStorage.uid){
  window.location = "/";
}
var pidset = [];
var loadOrder = 0;
var postOrder = 0;
var insertOrder = 0;
var loadingFlag = true;
var postCounter = 0; 
var chatBoxNumber = 0;
var view_eid = localStorage.eid;
var flag_displaymember=true;
var isMember = false; 
var isManager = false;
$(document).ready(function(){
  $("#circularG").show();
  $("#homeNav").removeClass("active");
  $("#searchNav").removeClass("active");

  $(".imgLiquidFill").imgLiquid();
  $("#postArea").elastic();
  $("#pictureDescArea").elastic();

  var auth_data = {};
  auth_data.session_key = localStorage.session_key;
  auth_data.uid = localStorage.uid;

  //update page title 
  $("title").first().html("Group-"+localStorage.ename);
  $("#userNameLink").text(localStorage.usernickname);

  $(".bootstrap-tagsinput").find("input").attr("placeholder","Add").attr("size",8);
  $(".bootstrap-tagsinput").find("input").limit('20');
  $(".bootstrap-tagsinput").css("border-radius","0px");
  $(".icon-question-sign").tooltip({title:"Add the tag you want by typing in it and press Enter; Remove the tag by pressing Delete.",placement:"right"});
  $('body').delegate('#postArea','keyup',function(){
    if($(this).val() == ""){
      $("#postSubmit").attr('disabled','disabled');
    }else{
     $("#postSubmit").removeAttr('disabled');
    }
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
     localStorage.etags = sortTags(data.tags);
     var tagsList = sortTags(data.tags);
     localStorage.ecity = data.city;
     console.log(tagsList);
     for(var index = 0; index <  Math.min(4,tagsList.length); index++){
     $($("#subNavBar").find("li")[index+1]).html('<a class = "eventtag" href="#" tag = '+tagsList[index]+'>'+tagsList[index]+'</a>');
     }
     $("#name").html(localStorage.ename);
     $("#creator").html(localStorage.ecreator);
     $("#description").html(localStorage.edescription);
     if(tagsList == ""){
     $('#tags').append("<font>None</font>");
     }else{
        $.each(localStorage.etags.split(','),function(index,element){
          $('#tags').append("<span class='label label-info' style = 'margin-left:5px;'>"+element+"</span>");
        });
     }
     $("#rating").html(localStorage.erating);
     $("#city").html(localStorage.ecity);
   },
   error:function(jqXHR, textStatus, errorThrown){
    if(textStatus == "timeout"){
      $("#timeoutModal").modal("show");
    }
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
    data:JSON.stringify(eventAvartaData),
    
    type:"POST",
    contentType: 'application/json',
    success:function(data){
      console.log(data);
      localStorage.event_small_avarta = data.avarta;
      $("#navi_avarta").attr("src",data.avarta);
      $("#profileAvarta").attr("src",data.avarta);
    },
    error:function(jqXHR, textStatus, errorThrown){
      if(textStatus == "timeout"){
        $("#timeoutModal").modal("show");
      }
    }
  });

  //get event posts
  if(!checkEvent(localStorage.eid)){
    var newsData = view_auth_data;
    newsData.option = 0;
    newsData.max_pid = "default";
    $.ajax({
     url:"/geteventpost",
     data:JSON.stringify(newsData),
     
     type:"POST",
     contentType: 'application/json',
     success:function(data){
       console.log("News:");
       console.log(data);
       if(data.pidsets.length == 0){
        $("#contentBody").find(".well").show();
        $("#circularG").hide();
       }else{
        viewpost(data.pidsets,2,newsData);
       }
     },
     error:function(jqXHR, textStatus, errorThrown){
        if(textStatus == "timeout"){
          $("#timeoutModal").modal("show");
        }
      }
    });

    $.ajax({
      url:"/geteventmanagers",
      data:JSON.stringify(view_auth_data),
      
      type:"POST",
      contentType: 'application/json',
      success:function(data){
        console.log("here");
        console.log(data);
        //$("#membersNumber").html(data.members.length);
        for(var i = 0; i < data.members.length;i++){
          if(data.members[i] == localStorage.uid){
            isManager = true;
            break;
          }
        }
        if(!isManager){
          $("#eventManage").hide();
        }
        else{
          $("#eventManage").show();
        }
      },
      error:function(jqXHR, textStatus, errorThrown){
        if(textStatus == "timeout"){
          $("#timeoutModal").modal("show");
        }
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
          $("#eventManage").hide();
          $("#profileEdit").hide();
          $("#createPost").hide();
          $("#createPicture").hide();
          $("#profileModal").find(".modal-footer").hide();
          $("#eventManage").after('<a id = "settingJoinEvent"><i class="icon-plus"></i>&nbsp;&nbsp;Join Event</a>');
        }else{
          //$("#eventManage").hide();
          $("#eventManage").after('<a href="#quitModal" data-toggle="modal" ><i class="icon-remove"></i>&nbsp;&nbsp;Quit Event</a>');
        }
      },
      error:function(jqXHR, textStatus, errorThrown){
        if(textStatus == "timeout"){
          $("#timeoutModal").modal("show");
        }
      }
    });
  }
  else{
    //TODO: add warning message
    //flag_displaymember=false;
    $("#right").hide();
    $(".nonMemberWarning").show();
    $("#circularG").hide();
    $("#createPost").hide();
    $("#eventManage").hide();
    $("#eventManage").after('<a id = "settingJoinEvent"><i class="icon-plus"></i>&nbsp;&nbsp;Join Event</a>');
  }
  //Adjust posting Area width
  $('#postArea').css({'width':$('#postModal').width()*0.9,'height':"80px"});

  //Just show the first tag for each post
  $(".tagsGroup a").hide();
  $('.tagHead').show();
  adjustTags();

  $(window).resize(function(){
    $.each($(".tagHead"),function(index,element){
      var tagsGroup = $(element).closest(".tagsGroup");
      if(!$(tagsGroup).hasClass('popPostTags')){
          var parentWidth = $(tagsGroup).closest('.span2').width();
          var selfWidth = $(tagsGroup).width();
          $(tagsGroup).css('margin-left',parentWidth - selfWidth);
      }
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
            },
            error:function(jqXHR, textStatus, errorThrown){
              if(textStatus == "timeout"){
                $("#timeoutModal").modal("show");
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
    $('#postCancel').attr("disabled","disabled");
    var content = $('#postArea').val();
    var tags = $('#postTags').tagsinput('items');
    if(tags=="")
      tags=[];
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
      data.pics = [];
      $("#floatingBarsG-post").show();
      createPost(data);
    }
  });

  $("#fileFileupload").fileupload({
    url:"/uploadpostfile",
    type:"POST",
    dataType:"json",
    maxFileSize:10000000,
    acceptFileTypes: /\.(pdf|zip)$/i,
    formData: {
      uid: localStorage.uid,
      session_key: localStorage.session_key
    },
    progress: function(e, data){
        var progress = parseInt(data.loaded / data.total * 100, 10);
        $('#fileProgress .bar').css(
            'width',
            progress + '%'
        );
    },
    add: function(e, data){
        data.submit().success(function(result, textStatus, jqXHR){
          console.log("file upload feedback:");
          console.log(result);
          if(result.status == "successful"){
            setTimeout(function(){
              $('#fileProgress').hide();
              $('#fileNotice').html("finished! Uploaded your file already.").css("color",'green');
              $('#fileProgress .bar').css(
                  'width',
                  '0%'
              );
              $('#fileCancel').removeAttr("disabled");
              $('#fileSubmit').removeAttr("disabled");
              $('#fileDescArea').show();
              $('#fileTags').parent().show();
              if(!localStorage.fileids){
                localStorage.fileids = result.fileids;
              }else{
                var originalFileIds = localStorage.fileids.split(",");
                localStorage.fileids = originalFileIds.concat(result.fileids);
              } 
              console.log("upload files urls:");
              console.log(data.files);
              $.each(data.files,function(index,element){
                $('#previewFileArea').append(
                    '<li class="span3">'+
                      '<div href="#" class="thumbnail" style = "background:white;">'+
                        '<img src="/img/default.png" style = "margin-left:auto;margin-right:auto;display:block;padding-top: 10px;"/>'+
                        '<h3 style = "text-align:center;">'+data.files[0].name+'</h3>'+
                      '</div>'+
                    '</li>');
              });
              $('#previewFileArea').show();
            },1000);
          }
        }).error(function(jqXHR, textStatus, errorThrown){
          $('#fileSubmit').removeAttr("disabled");
          $('#fileCancel').removeAttr("disabled");
          $('#fileProgress').hide();
          $('#fileProgress .bar').css(
              'width',
              '0%'
          );
          $('#fileNotice').show().html("failed!").css("color","#B94A48");
        });
    },
    start:function(e, data){
        $('#fileProgress').show();
        $('#fileNotice').show().html("uploading...");
        $('#fileSubmit').attr("disabled","disabled");
        $('#fileCancel').attr("disabled","disabled");
        $('#fileFileupload').attr("disabled","disabled");
    },
    fail:function(e, data){
        $('#fileNotice').show().html("failed!").css("color","#B94A48");
        $('#fileSubmit').removeAttr("disabled");
        $('#fileCancel').removeAttr("disabled");
        $('#fileFileupload').removeAttr("disabled");
        $('#fileProgress .bar').css(
            'width',
            '0%'
        );
    },
    done:function(e, data){  
        console.log("upload done.");
        $("#fileFileupload").removeAttr("disabled");
    }
  });

  $("#fileSubmit").click(function(){
    $(this).attr("disabled","disabled");
    $('#fileCancel').attr("disabled","disabled");
    var description = $("#fileDescArea").val();
    var tags = $('#fileTags').tagsinput('items');
    if(tags==""){
      tags=[];
    }
    var eid = view_eid;
    var visibility = 0;
    var tags = tags;
    var data = {};
    var d = new Date();
    data.content = description;
    data.eid = eid;
    data.visibility = visibility;
    data.tags = tags;
    data.date = d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();
    data.time = d.getHours()*10000+d.getMinutes()*100;+d.getSeconds();
    data.session_key = localStorage.session_key;
    data.uid = localStorage.uid;

    data.pics = [];

    data.files = localStorage.fileids.split(",");
    console.log("file ids: ");
    console.log(data.files);
    
    $("#floatingBarsG-file").show();
    createPost(data);
    return false;
  });

  $("#fileCancel").click(function(){
    $("#fileDescArea").val("").hide();
    $("#fileTags").tagsinput("removeAll");
    $('#fileTags').parent().hide();
    $("#previewFileArea").html("");
    $("#fileNotice").hide();
    $('#fileSubmit').attr("disabled", "disabled");
    localStorage.removeItem("fileids");
  });

  $("#pictureFileupload").fileupload({
    url:"/uploadpostpicture",
    type:"POST",
    dataType:"json",
    maxFileSize:10000000,
    acceptFileTypes: /\.(gif|jpe?g|png)$/i,
    formData: {
      uid: localStorage.uid,
      session_key: localStorage.session_key
    },
    progress: function(e, data){
        var progress = parseInt(data.loaded / data.total * 100, 10);
        $('#pictureProgress .bar').css(
            'width',
            progress + '%'
        );
    },
    add: function(e, data){
        data.submit().success(function(result, textStatus, jqXHR){
          console.log("upload feedback:");
          console.log(result);
          if(result.status == "successful"){
            setTimeout(function(){
              $('#pictureProgress').hide();
              $('#pictureNotice').html("finished! Preview your picture below.").css("color",'green');
              $('#pictureProgress .bar').css(
                  'width',
                  '0%'
              );
              $('#pictureCancel').removeAttr("disabled");
              $('#pictureSubmit').removeAttr("disabled");
              $('#pictureDescArea').show();
              $('#pictureTags').parent().show();
              if(!localStorage.pictureids){
                localStorage.pictureids = result.picids;
              }else{
                var originalPictureIds = localStorage.pictureids.split(",");
                localStorage.pictureids = originalPictureIds.concat(result.picids);
              } 
              console.log("upload picture urls:");
              console.log(data.files);
              $.each(data.files,function(index,element){
                $('#previewImageArea').append(
                  '<li class="span3">'+
                    '<a href="#" class="thumbnail">'+
                      '<img src="' + URL.createObjectURL(element) + '" style = "margin-left:auto;margin-right:auto;display:block;height:300px;"/>'+
                    '</a>'+
                  '</li>');
              });
              $('#previewImageArea').show();
            },1000);
          }
        }).error(function(jqXHR, textStatus, errorThrown){
          $('#pictureSubmit').removeAttr("disabled");
          $('#pictureCancel').removeAttr("disabled");
          $('#pictureProgress').hide();
          $('#pictureProgress .bar').css(
              'width',
              '0%'
          );
          $('#notice').show().html("failed!").css("color","#B94A48");
        });
    },
    start:function(e, data){
        $('#pictureProgress').show();
        $('#pictureNotice').show().html("uploading...");
        $('#pictureSubmit').attr("disabled","disabled");
        $('#pictureCancel').attr("disabled","disabled");
        $('#pictureFileupload').attr("disabled","disabled");
    },
    fail:function(e, data){
        $('#pictureNotice').show().html("failed!").css("color","#B94A48");
        $('#pictureSubmit').removeAttr("disabled");
        $('#pictureCancel').removeAttr("disabled");
        $('#pictureFileupload').removeAttr("disabled");
        $('#pictureProgress .bar').css(
            'width',
            '0%'
        );
    },
    done:function(e,data){  
        console.log("upload done.");    
        $("#pictureFileupload").removeAttr("disabled");
    }
  });

  $("#pictureSubmit").click(function(){
    $(this).attr("disabled","disabled");
    $('#pictureCancel').attr("disabled","disabled");
    var description = $("#pictureDescArea").val();
    var tags = $('#pictureTags').tagsinput('items');
    if(tags==""){
      tags=[];
    }
    var eid = view_eid;
    var visibility = 0;
    var tags = tags;
    var data = {};
    var d = new Date();
    data.content = description;
    data.eid = eid;
    data.visibility = visibility;
    data.tags = tags;
    data.date = d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();
    data.time = d.getHours()*10000+d.getMinutes()*100;+d.getSeconds();
    data.session_key = localStorage.session_key;
    data.uid = localStorage.uid;

    data.pics = localStorage.pictureids.split(",");
    console.log("picture ids: ");
    console.log(data.pics);

    data.files = [];
    
    $("#floatingBarsG-picture").show();
    createPost(data);
    return false;
  });

  $("#pictureCancel").click(function(){
    $("#pictureDescArea").val("");
    $("#pictureTags").tagsinput("removeAll");
    $("#pictureSubmit").attr("picturename","");
    $("#previewImageArea").html("");
    $("#pictureNotice").hide();
    localStorage.removeItem("pictureids");
  });

  $('body').delegate('.postImage','click',function(){
    var source = $(this).attr('src');
    var url = "url("+window.location.origin+"/"+source+")";
    $('#imageModal').find('.imgLiquidFill').css('background-image',url);
    $('body').css("overflow","hidden");
    var context = $(this).closest(".postRoot");
    var source = $("#post_user_avarta"+$(context).attr("postPid")).attr("src");
    $(".interactionArea").find(".modalAvarta").first().attr("src",source);
    var data = {};
    data.session_key = localStorage.session_key;
    data.uid = localStorage.uid;
    data.uidList = [$(context).attr("posteruid")];
    data.pidList = [$(context).attr("postpid")];
    if([$(context).attr("posteid")] == ""){
      data.eidList = ["0000000000000000"];
    }else{
      data.eidList = [$(context).attr("posteid")];
    }
    console.log(data);
    $.ajax({
        url:"/getpostscontent",
        data:JSON.stringify(data),
        type:"POST",
        contentType: 'application/json',
        success:function(result){
          if(result.status == "successful"){
            renderLargePost(result.source[0]);
            $(".interactionArea").show();
          }
        },
        error:function(jqXHR, textStatus, errorThrown){
          if(textStatus == "timeout"){
            $("#timeoutModal").modal("show");
          }
        }
    });
  });



$("body").delegate("#settingJoinEvent",'click',function(){
  var data = {};
  data = auth_data;
  data.eid = localStorage.eid;
  data.content = "Could you add me into your event? :)";
  $("#settingJoinEvent").css({"pointer-events":"none","cursor":"default","color":"#ccc"});
  $("#settingJoinEvent").html("sending....");
  $.ajax({
    url:"/joinevent",
    data:JSON.stringify(data),
    
    type:"POST",
    contentType: 'application/json',
    success:function(result){
      if(result.status == "successful"){
        $("#settingJoinEvent").html("request pending");
      }else{
        $("#settingJoinEvent").html("request failed");
      }
    },
    error:function(jqXHR, textStatus, errorThrown){
      if(textStatus == "timeout"){
        $("#timeoutModal").modal("show");
      }
    }
  });
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

  $("#membersHead").click(function(){
    if($(this).find("i").hasClass("icon-chevron-right")){
      $(this).find("i").remove();
      $(this).prepend("<i class = 'icon-chevron-down icon-white' style = 'margin-top:3%;margin-right:2%;'></i>");
      $("#membersList").show();
    }else{
      $(this).find("i").remove();
      $(this).prepend("<i class = 'icon-chevron-right icon-white' style = 'margin-top:3%;margin-right:2%;'></i>");
      $("#membersList").hide();
    }
    return false;
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
      $("#squaresWaveG-member").show();                    
      $.ajax({
             url:"/geteventmembers",
             data:JSON.stringify(view_auth_data),
             
             type:"POST",
             contentType: 'application/json',
             success:function(data){
             console.log("members:");
             console.log(data);
             $("#membersHead").find("font").html("("+data.members.length+")");
             var membersData = {};
             membersData.uidList = data.members;
             membersData.session_key = localStorage.session_key;
             membersData.uid = localStorage.uid;
             if(membersData.uidList.length == 0){
                $("#membersList").append("<strong style = 'margin-left:15%;color:white;font-family: \"Lato\", sans-serif;font-weight:300;'>No Member Yet.</strong>");
                $("#squaresWaveG-member").hide();
              }else{
                userlist(membersData,"event");
              }
             },
             error:function(jqXHR, textStatus, errorThrown){
                if(textStatus == "timeout"){
                  $("#timeoutModal").modal("show");
                }
              }
        });//ajax
    }
  });

  $('body').delegate('.tagHead','mouseover',function(){
    var tagsGroup = $(this).closest(".tagsGroup");
    $(tagsGroup).children().slideDown( "fast");
    var parentWidth = $(tagsGroup).closest('.span2').width();
    var selfWidth = $(tagsGroup).width();
    $(tagsGroup).css('margin-left',parentWidth - selfWidth);
    setTimeout(function(){
      $(tagsGroup).children("a:not(:first-child)").slideUp( "fast",function(){
        var parentWidth = $(tagsGroup).closest('.span2').width();
        var selfWidth = $(tagsGroup).width();
        $(tagsGroup).css('margin-left',parentWidth - selfWidth);
      });
    },3000);
  });
  $('#popPostModal').delegate('.tagHead','mouseover',function(){
    var tagsGroup = $(this).closest(".tagsGroup");
    $(tagsGroup).children().slideDown( "fast");
    setTimeout(function(){
      $(tagsGroup).children("a:not(:first-child)").slideUp( "fast",function(){
      });
    },3000);
    return false;
  });

  $('body').delegate('.replyLink','click',function(){
    var replier = $(this).prev().find('.replier').first();
    var textarea = $(this).closest('.postRoot').find('textarea').first();
    textarea.attr({replyToName:replier.attr('name'),replyToUid:replier.attr('uid')});
    textarea.focus();
    return false;
  });

  $('body').delegate('.removePost','click',function(){
    var context = $(this).closest('.postRoot');
    $(context).addClass("PostToBeRemoved");
    $("#removePostConfirm").attr('postUid',$(context).attr('posterUid')).attr('postEid',$(context).attr('postEid')).attr('postPid',$(context).attr('postPid'));
  });

  $('#removePostConfirm').click(function(){
    $("#floatingBarsG-removePost").show();
    $("#removePostConfirm").attr("disabled","disabled");
    var data = auth_data;
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
          // BUG!! did not remove the post!
          $('.PostToBeRemoved')[0].remove();
          if($("#left-column").html() == "" && $("#right-column").html() == ""){
            $("#contentBody").find(".well").show();
          }
        }else{
          $('.PostToBeRemoved')[0].removeClass("PostToBeRemoved");
          console.log("post was not removed successfully!");
        }
        $("#removePostConfirm").removeAttr("disabled");
        $("#removePostConfirm").removeAttr("postUid").removeAttr("postEid").removeAttr("postPid");
        $("#floatingBarsG-removePost").hide();
        $("#removePostCancel").trigger("click");
      },
      error:function(jqXHR, textStatus, errorThrown){
        if(textStatus == "timeout"){
          $("#timeoutModal").modal("show");
        }
      }
    });
  });

  $('body').delegate('.removereply','click',function(){
    console.log("removereply click");
    var postId = $(this).closest(".postRoot").attr("posterUid")+""+$(this).closest(".postRoot").attr("postEid")+""+$(this).closest(".postRoot").attr("postPid");
    $("#removeReplyConfirm").attr("replyId",$(this).closest(".replyBody").attr("replyId")).attr("postId",postId);
  });

  $("#removeReplyConfirm").click(function(){
      $("#floatingBarsG-removeReply").show();
      $("#removeReplyConfirm").attr("disabled","disabled");
      var postId = $(this).attr("postId");
      var replyId = $(this).attr("replyId");
      var context = $("div."+postId).first();
      var data = auth_data;
      data.id = $(context).attr('posterUid');
      data.eid = $(context).attr('postEid');
      data.pid = $(context).attr('postPid');
      var reply = $("li[replyId='"+replyId+"']").first();
      data.rid = $(reply).attr("rid");
      console.log(data);
      $.ajax({
            url:"/deletereply",
            data:JSON.stringify(data),
            
            type:"POST",
            contentType: 'application/json',
            success:function(data){
              console.log(data);
              $.each($("li[replyId='"+replyId+"']"),function(index,element){
                if(!$(element).closest("#imageModal").length && !$(element).closest("#popPostModal").length){
                  var repliesArea = $(element).closest(".repliesArea");
                  if($(element).attr("repliesNumber") == 1){
                    $(repliesArea).remove();
                  }else{
                    var repliesNumber = parseInt($(element).closest(".postRoot").attr("repliesNumber"));
                    $(element).closest(".postRoot").attr("repliesNumber",(repliesNumber - 1));
                    $(element).remove();
                    if(repliesNumber == 2){
                      $(repliesArea).find(".accordion-toggle").html('1 reply');
                    }else{
                      $(repliesArea).find(".accordion-toggle").html((repliesNumber - 1)+' replies');
                    }
                  }
                }else{
                  $(element).remove();
                }
              });
              $("#removeReplyConfirm").removeAttr("disabled");
              $("#floatingBarsG-removeReply").hide();
              $("#removeReplyCancel").trigger("click");
            },
            error:function(jqXHR, textStatus, errorThrown){
              if(textStatus == "timeout"){
                $("#timeoutModal").modal("show");
              }
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
                            },
                            error:function(jqXHR, textStatus, errorThrown){
                              if(textStatus == "timeout"){
                                $("#timeoutModal").modal("show");
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
  $(document).on('click','#homeNav',function(){
    window.location = "/home";
    return false;
  });

  $(document).on('click', "#searchNav", function() {
    localStorage.search_tag_option = "user";
    localStorage.search_tag_content = "";
    window.location = "/search";
    return false;
  });

  $("#naviDropdown").remove();
  $("#quitConfirm").click(function(){
    $("#floatingBarsG-quit").show();
    var data = {};
    data.eid = localStorage.eid;
    data.uid = localStorage.uid;
    data.session_key = localStorage.session_key;
    $.ajax({
      url:"/quitevent",
      data:JSON.stringify(data),
      
      type:"POST",
      contentType: 'application/json',
      success:function(result){
        if(result.status = "sccessful"){
          $("#floatingBarsG-quit").show();
          window.location = "/home";
        }
      },
      error:function(jqXHR, textStatus, errorThrown){
        if(textStatus == "timeout"){
          $("#timeoutModal").modal("show");
        }
      }
    });
    return false;
  });

  $("#eventManage").click(function(){
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
              '<img class = "chatAvarta'+localStorage.uid+'" src = "'+localStorage.self_small_avarta+'" style = "height:20px;width:20px;border-radius:10px;">'+
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
    getMorePosts(2,newsData);
    return false;
  });

  $("#notification").hover(function(){
    $(this).tooltip('show');
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
          if(notification.prev() && notification.prev().hasClass("divider")){
              notification.prev().remove();
          };
          notification.remove();
        }
      },
      error:function(jqXHR, textStatus, errorThrown){
        if(textStatus == "timeout"){
          $("#timeoutModal").modal("show");
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
      },
      error:function(jqXHR, textStatus, errorThrown){
        if(textStatus == "timeout"){
          $("#timeoutModal").modal("show");
        }
      }
    });
    removeNotification();
  });

  $('body').delegate('.eventResponse','click',function(){
    console.log("read event response");
    flag_displayevent = true;
    var notification = $(this).closest('.notificationItem');
    if($(notification).prev() && $(notification).prev().hasClass("divider")){
        $(notification).prev().remove();
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
      },
      error:function(jqXHR, textStatus, errorThrown){
        if(textStatus == "timeout"){
          $("#timeoutModal").modal("show");
        }
      }
    });
    removeNotification();
  });

  $(".nonMemberWarning").click(function(){
    $("#left").trigger("click");
    return false;
  });

  $("#timeoutButton").click(function(){
    localStorage.clear();
    window.location = "/";
    return false;
  });
});