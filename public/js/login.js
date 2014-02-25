if(localStorage.uid){
  window.location = "/home";
}

function formHexBit(x) {
	if (x > 9)
		return 'A' + x - 10;
	else
		return '0' + x;
}
function print_8byte(x){
	var ans = "";
	for (var i = 0; i < 8; i++){
		ans += formHexBit((x[i] >> 4) & 0xF);
		ans += formHexBit(x[i] & 0xF);
	}
	return ans; 
}  
$(function() {
    var button = $('#loginButton');
    var box = $('#loginBox');
    var form = $('#loginForm');
    button.removeAttr('href');
    form.mouseup(function() { 
        return false;
    });

    var signUpbutton = $('#signUpButton');
    var signUpbox = $('#signUpBox');
    var signUpform = $('#signUpForm');
    signUpbutton.removeAttr('href');
    signUpform.mouseup(function() { 
        return false;
    });

    $(this).click(function(event) { 	
        if(($(event.target).parent('#signUpButton').length > 0)||($(event.target).attr('id') == "signUpButton")||($(event.target).parent('#webButton').length > 0)||($(event.target).attr('id') == "webButton")) {
	        signUpbox.toggle();
	        signUpbutton.toggleClass('active'); 
	       	$('#signUpName').focus();
        }else if(!(($(event.target).parents('#signUpBox').length > 0)||($(event.target).attr('id') == "signUpBox"))){
        	signUpbutton.removeClass('active');
            signUpbox.hide();
           	$('#signUpName').blur();
        }
        if(($(event.target).parent('#loginButton').length > 0)||($(event.target).attr('id') == "loginButton")) {
	        box.toggle();
	        button.toggleClass('active'); 
	       	$('#loginEmail').focus();  
        }else if(!(($(event.target).parents('#loginBox').length > 0)||($(event.target).attr('id') == "loginBox"))){
        	button.removeClass('active');
            box.hide();
           	$('#loginEmail').blur();
        }
    });
});


$(document).ready(function(){
	$('.help-inline').hide();
	$(".bootstrap-tagsinput").find("input").attr("placeholder","Add").attr("size",8);
  	$(".bootstrap-tagsinput").find("input").limit('14');

	$("#validationEmailLabel").find("a").click(function(){
		var email = $("#validationEmail").val();
		var checkButton = $("#validationEmailLabel").find("a").first();
		var input = $('#validationEmail');
		$("#validationEmailLabel").find("font").remove();
		if(email == ""){
			$(checkButton).before('<font color ="#B94A48"> *required</font>');
			$(input).css('border-color','#B94A48');
		}else if(!isValidEmailAddress(email)){
			$(checkButton).before('<font color ="#B94A48"> *invalid email address</font>');
			$(input).css('border-color','#B94A48');
		}else{
			$("#squaresWaveG").show();
			var data = {};
			data.email = email;
			$.ajax({
				url:'/emailvalidation',
				data:JSON.stringify(data),
				type:'POST',
				contentType: 'application/json',
				success:function(data){
					console.log("email validation feedback:");
					console.log(data);
					if(data.status == "unsuccessful"){
						$(checkButton).before('<font color ="#B94A48"> *'+data.reason+'</font>');
						$(input).css('border-color','#B94A48');
						$(input).css('border-color','#CCC');
					}else{
						$("#signUpbody").show();
						$(input).css('border-color','#CCC').attr('disabled','disabled');
						$("#validationEmailLabel").find("a").hide();
					}
					$("#squaresWaveG").hide();
				}
			});
		}
		return false;
	});

	$("#cancelCreateAccount").click(function(){
		$('#signUpName').val("");
		$('#signUpEmail').val("");
		$('#signUpPassword').val("");
		$('#confirmsignUpPassword').val("");
		$('#inlineCheckbox').removeAttr("checked");
		$("#signUpbody").hide();
		$('#validationEmail').removeAttr('disabled');
		$("#validationEmailLabel").find("a").show();
		return false;
	});

	$('#submitCreateAccount').click(function(){
		$("#signupAlert").hide();
		var realname = $('#signUpRealName').val();
		var nickname = $('#signUpNickName').val();
		var email = $('#validationEmail').val();
		var password = $('#signUpPassword').val();
		var confirmPassword = $('#confirmsignUpPassword').val();
		var term = $('#inlineCheckbox').is(":checked");
		var validationCode = $('#validationCode').val();
		var proceed = true;
		var tags = $('#signUpTags').tagsinput('items');
		console.log(tags);
		if(validationCode == ""){
			$("#validationCodeLabel").html('<strong>Validation Code </strong><font color ="#B94A48">*required</font>');
			$('#validationCode').css('border-color','#B94A48');
			proceed = false;
		}else{
			$("#validationCodeLabel").html('<strong>Validation Code </strong>');
			$('#validationCode').css('border-color','#CCC');
		}
		if(realname == ""){
			$('#signUpRealNameLabel').html('<strong>Nick Name </strong><font color ="#B94A48">*required</font>');
			$('#signUpRealName').css('border-color','#B94A48');
			proceed = false;
		}else{
			$('#signUpRealNameLabel').html('<strong>Nick Name<strong>');
			$('#signUpRealName').css('border-color','#CCC');
		}
		if(nickname == ""){
			$('#signUpNickNameLabel').html('<strong>Nick Name </strong><font color ="#B94A48">*required</font>');
			$('#signUpNickName').css('border-color','#B94A48');
			proceed = false;
		}else{
			$('#signUpNickNameLabel').html('<strong>Nick Name<strong>');
			$('#signUpNickName').css('border-color','#CCC');
		}
		if(password.length <6){
			$('#signUpPasswordLabel').html('<strong>Password </strong><font color ="#B94A48">*at least 6 characters.</font>');
			$('#signUpPassword').css('border-color','#B94A48');
			$('#confirmsignUpPasswordLabel').html('<strong>Confirm Password </strong><font color ="#B94A48">*at least 6 characters.</font>');
			$('#confirmsignUpPassword').css('border-color','#B94A48');
			proceed = false;
		}else if(password == ""||confirmPassword == ""||password != confirmPassword){
			$('#signUpPasswordLabel').html('<strong>Password </strong><font color ="#B94A48">*invalid password</font>');
			$('#signUpPassword').css('border-color','#B94A48');
			$('#confirmsignUpPasswordLabel').html('<strong>Confirm Password </strong><font color ="#B94A48">*invalid password</font>');
			$('#confirmsignUpPassword').css('border-color','#B94A48');
			proceed = false;
		}else{
			$('#signUpPasswordLabel').html('<strong>Password</strong>');
			$('#signUpPassword').css('border-color','#CCC');
			$('#confirmsignUpPasswordLabel').html('<strong>Confirm Password</strong>');
			$('#confirmsignUpPassword').css('border-color','#CCC');
		}
		if(!term){
			proceed = false;
			$('.checkbox').first().css('font-size','20px');
		}else{
			$('.checkbox').first().css('font-size','14px');
		}
		if(proceed){
			$("#floatingBarsG-signup").show();
			$("#submitCreateAccount").attr('disabled','disabled');
			$("#cancelCreateAccount").attr('disabled','disabled');
			var data = {};
			data.realname = realname;
			data.nickname = nickname;
			data.email = email;
			data.password = password;
			data.birthday = 19900610;
			data.gender = 1;
			data.city = "Singapore";
			data.state = "Singapore";
			data.country = "Singapore";
            data.tags = tags;
			data.hidden_tags = [];
			data.code = validationCode;
			$.ajax({
				url:'/signup',
				data:JSON.stringify(data),
				type:'POST',
				contentType: 'application/json',
				success:function(data){
					console.log(data);
					if(data.status == "successful"){
                    	var data = {};
                    	data.email = email;
                    	data.password = password;
						$.ajax({
						url:"/login",
						data:JSON.stringify(data),
						type:"POST",
						contentType: 'application/json',
						success:function(data){
							$('#loginAlert').hide();
							if(data.status == "successful"){
								console.log("sigup successful");
								localStorage.session_key = data.session_key;
								localStorage.uid = data.uid;
								var auth_data = {};
								auth_data.session_key = localStorage.session_key;
								auth_data.uid = localStorage.uid;
								$.ajax({
								    url:"/getselfinfo",
								    data:JSON.stringify(auth_data),
								    type:"POST",
								    contentType: 'application/json',
								    success:function(data){
								    console.log("self data:");
								    console.log(data);
								    localStorage.username = data.realname;
									localStorage.usernickname = data.nickname;
								    localStorage.raw_birthday = data.birthday;
								    localStorage.usertags = data.tags;
								    localStorage.hiddentags= data.hidden_tags;
								    localStorage.honors = data.honors;
								    localStorage.gender = data.raw_gender;
								    localStorage.city = data.city;
								    localStorage.state = data.state;
								    localStorage.country = data.country;
								    console.log("ready to go home");
								    $("#floatingBarsG-signup").hide();
								    $("#submitCreateAccount").removeAttr('disabled');
								    localStorage.search_tag_option = "user";
								    localStorage.search_tag_content = "";
								    window.location = "/search";
								    }
								});
							}
                          }//success
                         });
                    }else{
						$("#floatingBarsG-signup").hide();
						$("#signupAlert").show();
						$("#submitCreateAccount").removeAttr('disabled');
						$("#cancelCreateAccount").removeAttr('disabled');
					}
                }
            });
        }
		return false;
	});

	$('#login').click(function(){
		$('#loginAlert').hide();
		var Email = $('#loginEmail').val();
		var password = $('#loginPassword').val();
		var proceed = true;
		if(Email == ""){
			$('#loginEmailLabel').html('<strong>Email </strong><font color ="#B94A48">*required</font>');
			$('#loginEmail').css('border-color','#B94A48');
			proceed = false;
		}else{
			$('#loginEmailLabel').html('<strong>Email</strong>');
			$('#loginEmail').css('border-color','#CCC');
		}
		if(password == ""){
			$('#loginPasswordLabel').html('<strong>Password </strong><font color ="#B94A48">*required</font>');
			$('#loginPassword').css('border-color','#B94A48');
			proceed = false;
		}else{
			$('#loginPasswordLabel').html('<strong>Password</strong>');
			$('#loginPassword').css('border-color','#CCC');
		}
		if(proceed){
			$("#floatingBarsG-login").show();
			$("#login").attr("disabled","disabled");
			var data = {};
			data.email = Email;
			data.password = password;
			$.ajax({
				url:"/login",
				data:JSON.stringify(data),
				type:"POST",
				contentType: 'application/json',
				success:function(data){
					console.log(data);
					if(data.status == "successful"){
						console.log("login successful");
						localStorage.session_key = data.session_key;
						localStorage.uid = data.uid;
						var auth_data = {};
						auth_data.session_key = localStorage.session_key;
						auth_data.uid = localStorage.uid;
						$.ajax({
							url:"/getselfinfo",
							data:JSON.stringify(auth_data),
							type:"POST",
							contentType: 'application/json',
							success:function(data){
								console.log("self data:");
                                console.log(data);
								localStorage.username = data.realname;
								localStorage.usernickname = data.nickname;
						        localStorage.birthday = data.birthday;
                                localStorage.raw_birthday = data.raw_birthday;
						        localStorage.usertags = data.tags;
						        localStorage.hiddentags= data.hidden_tags;
						        localStorage.honors = data.honors;
						        localStorage.gender = data.raw_gender;
						        localStorage.city = data.city;
						        localStorage.state = data.state;
						        localStorage.country = data.country;
						        localStorage.search_tag_option = "user";
						        localStorage.search_tag_content = "";
						        $.ajax({
						        	url:"/getselffriendsinfo",
									data:JSON.stringify(auth_data),
									type:"POST",
									contentType: 'application/json',
									success:function(data){
										console.log("ready to go home");
						        		$("#floatingBarsG-login").hide();
						        		$("#login").removeAttr("disabled");
						        		if(data.friend_uids.length>7)
											window.location = "/home";
										else
											window.location = "/search";
									}
						        });
							}
						});
					}else{
						$("#floatingBarsG-login").hide();
						$('#loginAlert').show();
						$("#login").removeAttr("disabled");
					}
				}
			});
		}
		return false;
	});

	$("#agreementBack").click(function(){
		$("#agreementModal").modal("hide");
		return false;
	});
});

function isValidEmailAddress(emailAddress) {
    var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
    return pattern.test(emailAddress);
};

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