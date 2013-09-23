$(document).ready(function(){
	$('#LoginButton').click(function(){
		var proceed = true;
		var email = $('#inputEmail').val();
		var password = $('#inputPassword').val();
		if(email == ""){
			proceed = false;
			$('#emailGroup').addClass('error');
			$('#emailWarning').show();
		}else{
			proceed = true;
			$('#emailGroup').removeClass('error');
			$('#emailWarning').hide();
		}
		if(password == ""){
			proceed = false;
			$('#passwordGroup').addClass('error');
			$('#passwordWarning').show();
		}else{
			proceed = false;
			$('#passwordGroup').removeClass('error');
			$('#passwordWarning').hide();
		}
		if(proceed){
			//Do send the post request
			$.ajax({
				url:"/doLogin",
				data:{"email":email,"password":password},
				type:"POST",
				success:function(data){
					//do something
				}
			});
		}
		return false;
	});
});