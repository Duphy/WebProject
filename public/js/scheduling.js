var schedulingList = {};
var today = new Date();
var clickDate = "";
var isManager = false;
$(document).ready(function(){
	var schedulingId = localStorage.schedulingId;
	var schedulingType = localStorage.schedulingType;
	var auth_data  = {};
	auth_data.uid = localStorage.uid;
	auth_data.session_key = localStorage.session_key;

	//update date
	var day = today.getDate();
	var month = today.getMonth() + 1;
	var year = today.getFullYear();
	var todayDate = year+"";
	if(month < 10){
		todayDate = todayDate + "0"+month;
	}else{
		todayDate = todayDate + month;
	}
	if(day < 10){
		todayDate = todayDate + "0"+day;
	}else{
		todayDate = todayDate + day;
	}
	clickDate = todayDate;
	$("#day").html(day);
	$("#month").html(checkMonth(month));
	$("#year").html(year);

	//get schedule
	if(schedulingType == "user"){
		var data = auth_data;
		data.option = 0;
	    $("title").first().html("Scheduling-"+localStorage.username);
	    $("#scheduleHead").find('img').attr("src",localStorage.self_small_avarta);
	    $("#scheduleHead").find('font').html("Schedule for "+localStorage.username);
	    $.ajax({
	        url:"/getselfschedule",
	        data:JSON.stringify(data),
	        type:"POST",
	        contentType: 'application/json',
	        success:function(result){
	       		console.log("schedule:");
	       		console.log(result);
	       		$.each(result.schedules, function(index, element){
	       			var date = element.start_date.toString();
	       			if(!schedulingList[date]){
	       				schedulingList[date] = [];
	       			}
       				var list = schedulingList[date];
       				list.push(element);
       				schedulingList[date] = list;
	       		});
	       		if(schedulingList[todayDate]){
	       			$("#emptyBody").hide();
	       			$.each(schedulingList[todayDate],function(index, element){
	       				$("#scheduleBody").append(renderSchedule(element,isManager));
	       			});
	       			$("#scheduleBody").show();
	       		}
	       }
	   });
	}else if(schedulingType == "event"){
		var data = auth_data;
		data.eid = localStorage.eid;
		data.option = 1;
		$("title").first().html("Scheduling-"+localStorage.ename);
	    $("#scheduleHead").find('font').html("Schedule for "+localStorage.ename);
	    $.ajax({
			url:"/geteventmanagers",
			data:JSON.stringify(data),
			type:"POST",
			contentType: 'application/json',
	        success:function(result){
	        	if(result.members && result.members.length > 0){	
	        		for(var i = 0; i < result.members.length;i++){
	        			if(localStorage.uid == result.members[i]){
	        				isManager = true;
	        				break;
	        			}
	        		}
	        	}
	        	$.ajax({
			        url:"/geteventschedule",
			        data:JSON.stringify(data),
			        type:"POST",
			        contentType: 'application/json',
			        success:function(result){
			       		console.log("schedule:");
			       		console.log(result);
			       		$.each(result.schedules, function(index, element){
			       			var date = element.start_date.toString();
			       			if(!schedulingList[date]){
			       				schedulingList[date] = [];
			       			}
		       				var list = schedulingList[date];
		       				list.push(element);
		       				schedulingList[date] = list;
			       		});
			       		if(schedulingList[todayDate]){
			       			$("#emptyBody").hide();
			       			$.each(schedulingList[todayDate],function(index, element){
			       				$("#scheduleBody").append(renderSchedule(element,isManager));
			       			});
			       			$("#scheduleBody").show();
			       		}
			        }
			    });
	        }
	    });
	}

	$(".scheduleInput").keyup(function(){
		var start_date = $("#scheduleStartTime").val();
		var end_date = $("#scheduleEndTime").val();
		var place = $("#schedulePlace").val();
		var description = $("#scheduleDescription").val();
		if(start_date != "" && end_date != "" && place != "" && description != ""){
			$("#createSchedule").removeAttr("disabled");
		}else{
			$("#createSchedule").attr("disabled","disabled");
		}
	});

	$("#createSchedule").click(function(){
		$("#createSchedule").attr("disabled","disabled");
		var start_date = $("#scheduleStartTime").val().replace(/\-/g,"").replace(":","");
		var start_date_string = start_date.substring(0,8);
		var start_time_string = start_date.substring(9,13)+"00";
		var end_date = $("#scheduleEndTime").val().replace(/\-/g,"").replace(":","");;
		var end_date_string = end_date.substring(0,8);
		var end_time_string = end_date.substring(9,13)+"00";
		var place = $("#schedulePlace").val();
		var description = $("#scheduleDescription").val();
		var data = auth_data;
		data.start_date=start_date_string;
		data.start_time=start_time_string;
		data.end_date=end_date_string;
		data.end_time=end_time_string;
		data.place=place;
		data.description=description;
		data.members = [];
		if(schedulingType == "user"){
			data.eid = "0000000000000000";
			$.ajax({
		       url:"/createschedule",
		       data:JSON.stringify(data),
		       type:"POST",
		       contentType: 'application/json',
		       success:function(result){
			        if(result.status== "successful"){
						if(!schedulingList[start_date_string]){
		       				schedulingList[start_date_string] = [];
		       			}
	       				var list = schedulingList[start_date_string];
	       				list.push(data);
	       				schedulingList[start_date_string] = list;
	       				console.log("schedule list:");
	       				console.log(schedulingList);
	       				if(start_date_string == clickDate){
	       					$("#emptyBody").hide();
	       					$("#scheduleBody").append(renderSchedule(data,isManager));
	       					$("#scheduleBody").show();
						}
						$("#scheduleStartTime").val("");
						$("#scheduleEndTime").val("");
						$("#schedulePlace").val("");
						$("#scheduleDescription").val("");
						$("#scheduleInputArea").collapse('toggle');
				    }
				$("#createSchedule").removeAttr("disabled");
		       }
			});
		}else if(schedulingType == "event"){
			data.eid = schedulingId;
			$.ajax({
		        url:"/createschedule",
		        data:JSON.stringify(data),
		        type:"POST",
		        contentType: 'application/json',
		        success:function(result){
			        if(result.status=="successful"){
			       		console.log("new Schedule:");
			       		console.log(result);
						if(!schedulingList[start_date_string]){
		       				schedulingList[start_date_string] = [];
		       			}
	       				var list = schedulingList[start_date_string];
	       				list.push(data);
	       				schedulingList[start_date_string] = list;
	       				if(start_date_string == clickDate){
	       					$("#emptyBody").hide();
	       					$("#scheduleBody").append(renderSchedule(data,isManager));
	       					$("#scheduleBody").show();
						}
						$("#scheduleStartTime").val("");
						$("#scheduleEndTime").val("");
						$("#schedulePlace").val("");
						$("#scheduleDescription").val("");
						$("#scheduleInputArea").collapse('toggle');
			        }
			    $("#createSchedule").removeAttr("disabled");
		       }
			});
		}
	});

	$("body").delegate(".c-day","click",function(){
		var time = $(this).attr("strtime");
		var day = time.substring(6,8);
		var month = time.substring(4,6);
		var year = time.substring(0,4);
		clickDate = time;
		if(schedulingList[clickDate]){
			$("#emptyBody").hide();
			$("#scheduleBody").html("");
			$.each(schedulingList[clickDate],function(index, element){
				$("#scheduleBody").append(renderSchedule(element,isManager));
			});
			$("#scheduleBody").show();
		}else{
			$("#emptyBody").show();
			$("#scheduleBody").hide();
		}
		$("#day").html(day);
		$("#month").html(checkMonth(parseInt(month)));
		$("#year").html(year);
		return false;
	});

	$("#scheduleBody").delegate('.close','click',function(){
		$("#removeConfirm").attr("sid",$(this).attr("sid"));
	});

	$("#removeConfirm").click(function(){
		$(this).attr("disabled","disabled");
		$("#floatingBarsG-remove").show();
		var sid = $(this).attr("sid");
		var data = auth_data;
		data.eid = $("#"+sid).attr("eid");
		data.id = $("#"+sid).attr("uid");;
		data.sid = sid;
		$.ajax({
	        url:"/deleteschedule",
	        data:JSON.stringify(data),
	        type:"POST",
	        contentType: 'application/json',
	        success:function(result){
		       if(result.status=="successful"){
			       $("#floatingBarsG-remove").show();
			       $("#"+sid).remove();
			       	$(this).removeAttr("disabled");
			       $("#removeCancel").trigger("click");
		       }
	   		}
	    });

	});

	$("#backButton").click(function(){
		if(localStorage.schedulingType){
			if(localStorage.schedulingType == "event"){
				window.location = "/event";
			}else if(localStorage.schedulingType == "user"){
				window.location = "/home";
			}
		}
		console.log("click back button.");
		return false;
	});
});